/**
 * lib/data/importPipeline.ts
 *
 * CSV-only spreadsheet parser + mapping store + validator for the import
 * wizard. Intentionally small and dependency-free so we can ship without a
 * new package install. XLSX support is a follow-up: the wizard accepts
 * `.csv` and `text/csv` only for now.
 *
 * Validation surface:
 *   - column → templateMetricId mapping
 *   - per-row numeric coercion
 *   - duplicate-row detection on (campusId, period, templateMetricId)
 *   - unknown-metric detection
 *
 * Commit performs chunked Prisma updates against existing reports and uses
 * `runBulkTransaction` for atomicity per chunk.
 */

import { prisma } from "@/lib/data/prisma";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface ImportMapping {
    /** column index → templateMetricId (string), "campusId", "period", or "skip" */
    columns: Array<{ index: number; header: string; target: string }>;
    /** Optional templateId scope */
    templateId?: string;
}

export interface ImportPreviewRow {
    rowIndex: number;
    raw: Record<string, string>;
    normalized: Record<string, unknown>;
    outcome: "OK" | "WARNING" | "ERROR";
    errors: string[];
}

/* ── CSV parser (RFC4180-ish; handles quoted fields with commas/newlines) ─ */

export function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let field = "";
    let row: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (c === '"') {
                inQuotes = false;
            } else {
                field += c;
            }
            continue;
        }
        if (c === '"') {
            inQuotes = true;
            continue;
        }
        if (c === ",") {
            row.push(field);
            field = "";
            continue;
        }
        if (c === "\r") continue;
        if (c === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
            continue;
        }
        field += c;
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows.filter((r) => r.length > 0 && r.some((cell) => cell.length > 0));
}

/* ── Validation ─────────────────────────────────────────────────────────── */

export function validateRows(
    rawRows: string[][],
    mapping: ImportMapping,
    knownTemplateMetricIds: Set<string>,
): ImportPreviewRow[] {
    if (rawRows.length === 0) return [];
    const header = rawRows[0];
    const dataRows = rawRows.slice(1);
    const seenKeys = new Set<string>();

    return dataRows.map((cells, idx) => {
        const errors: string[] = [];
        const raw: Record<string, string> = {};
        const normalized: Record<string, unknown> = {};

        for (let col = 0; col < cells.length; col++) {
            const headerName = header[col] ?? `col_${col}`;
            raw[headerName] = cells[col];
        }

        for (const colMapping of mapping.columns) {
            const cell = cells[colMapping.index] ?? "";
            switch (colMapping.target) {
                case "skip":
                    break;
                case "campusId":
                case "period": {
                    const trimmed = cell.trim();
                    if (!trimmed) errors.push(`${colMapping.target} required`);
                    normalized[colMapping.target] = trimmed;
                    break;
                }
                default: {
                    const templateMetricId = colMapping.target;
                    if (!knownTemplateMetricIds.has(templateMetricId)) {
                        errors.push(`Unknown templateMetricId ${templateMetricId}`);
                        break;
                    }
                    const trimmed = cell.trim();
                    if (trimmed === "") {
                        normalized[templateMetricId] = null;
                    } else {
                        const num = Number(trimmed);
                        if (Number.isNaN(num)) {
                            errors.push(`Non-numeric value in column ${colMapping.header}`);
                        } else {
                            normalized[templateMetricId] = num;
                        }
                    }
                }
            }
        }

        const dedupKey = JSON.stringify({
            campusId: normalized.campusId ?? null,
            period: normalized.period ?? null,
        });
        if (seenKeys.has(dedupKey)) {
            errors.push("Duplicate row in batch");
        } else {
            seenKeys.add(dedupKey);
        }

        return {
            rowIndex: idx + 1,
            raw,
            normalized,
            outcome: errors.length === 0 ? "OK" : "ERROR",
            errors,
        };
    });
}

/* ── Commit ─────────────────────────────────────────────────────────────── */

export interface ImportCommitInput {
    jobId: string;
    rows: ImportPreviewRow[];
    chunkSize?: number;
}

export async function commitImport(input: ImportCommitInput): Promise<{ committed: number; failed: number }> {
    const okRows = input.rows.filter((r) => r.outcome === "OK");
    const chunkSize = input.chunkSize ?? 100;
    let committed = 0;
    let failed = 0;

    for (let i = 0; i < okRows.length; i += chunkSize) {
        const chunk = okRows.slice(i, i + chunkSize);
        try {
            await prisma.$transaction(async (tx) => {
                for (const row of chunk) {
                    const campusId = row.normalized.campusId as string | undefined;
                    const period = row.normalized.period as string | undefined;
                    if (!campusId || !period) continue;
                    const report = await tx.report.findFirst({
                        where: { campusId, period },
                        include: { sections: { include: { metrics: true } } },
                    });
                    if (!report) continue;
                    const map = new Map<string, { id: string; isLocked: boolean }>();
                    for (const sec of report.sections ?? []) {
                        for (const rm of sec.metrics ?? []) {
                            map.set(rm.templateMetricId, { id: rm.id, isLocked: rm.isLocked });
                        }
                    }
                    for (const [tmId, value] of Object.entries(row.normalized)) {
                        if (tmId === "campusId" || tmId === "period") continue;
                        const target = map.get(tmId);
                        if (!target || target.isLocked) continue;
                        await tx.reportMetric.update({
                            where: { id: target.id },
                            data: { monthlyAchieved: typeof value === "number" ? value : null },
                        });
                    }
                }
            }, { timeout: 15000 });
            committed += chunk.length;
            await prisma.importJobItem.updateMany({
                where: { jobId: input.jobId, rowIndex: { in: chunk.map((r) => r.rowIndex) } },
                data: { outcome: "COMMITTED" },
            });
        } catch (err) {
            failed += chunk.length;
            await prisma.importJobItem.updateMany({
                where: { jobId: input.jobId, rowIndex: { in: chunk.map((r) => r.rowIndex) } },
                data: { outcome: "ERROR", errors: [err instanceof Error ? err.message : "commit failed"] },
            });
        }
    }

    return { committed, failed };
}

/**
 * lib/data/importPipeline.ts
 *
 * Spreadsheet parser + mapping store + validator for the import wizard.
 * Supports both CSV and XLSX:
 *   - `parseCsv(text)` parses RFC4180-ish CSV.
 *   - `parseXlsx(buffer)` lazily loads SheetJS server-side and returns
 *     `{ sheets: [{ name, rows }] }` so the wizard can prompt the user to
 *     pick a sheet on multi-sheet files.
 *   - `parseSpreadsheet(input)` dispatches based on the file format.
 *
 * Validation surface:
 *   - column → templateMetricId mapping
 *   - per-row numeric coercion
 *   - duplicate-row detection on (campusId, period, templateMetricId)
 *   - unknown-metric detection
 *
 * Commit performs chunked Prisma updates against existing reports and uses
 * `runBulkTransaction` for atomicity per chunk. Failures are recorded as
 * per-row outcomes — never bubble up as 500s.
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

/* ── XLSX parser (SheetJS) ───────────────────────────────────────────────
 *
 * Server-side only. SheetJS is dynamically imported so the client wizard
 * never bundles it. The buffer can be a Node Buffer or a Uint8Array.
 * Multi-sheet workbooks are returned as an array; the API + wizard pick
 * the active sheet via `selectedSheet`.
 */

export interface SheetParseResult {
    sheets: Array<{ name: string; rows: string[][] }>;
}

export class SpreadsheetParseError extends Error {
    constructor(public reason: string) {
        super(reason);
        this.name = "SpreadsheetParseError";
    }
}

const MAX_SHEETS = Number(process.env.IMPORT_XLSX_MAX_SHEETS ?? 12);

export async function parseXlsx(buffer: Uint8Array | Buffer): Promise<SheetParseResult> {
    let xlsx: typeof import("xlsx");
    try {
        // Lazy import so the bundle for routes that never parse xlsx stays small.
        xlsx = await import("xlsx");
    } catch (err) {
        throw new SpreadsheetParseError(
            `xlsx parser unavailable: ${err instanceof Error ? err.message : String(err)}`,
        );
    }

    let wb: ReturnType<typeof xlsx.read>;
    try {
        wb = xlsx.read(buffer, { type: "buffer", cellDates: false, cellNF: false, cellText: false });
    } catch (err) {
        throw new SpreadsheetParseError(
            `Could not read workbook: ${err instanceof Error ? err.message : String(err)}`,
        );
    }

    const sheetNames = wb.SheetNames ?? [];
    if (sheetNames.length === 0) {
        throw new SpreadsheetParseError("Workbook contains no sheets");
    }
    const limit = Math.min(sheetNames.length, MAX_SHEETS);
    const out: SheetParseResult["sheets"] = [];
    for (let i = 0; i < limit; i++) {
        const name = sheetNames[i];
        const ws = wb.Sheets[name];
        if (!ws) continue;
        // `header: 1` returns array-of-arrays. `defval: ""` keeps empty cells
        // present so column indices stay aligned with headers. `raw: false`
        // forces string output so number/date coercion happens uniformly in
        // `validateRows` instead of leaking xlsx-specific types upstream.
        const matrix = xlsx.utils.sheet_to_json<unknown[]>(ws, {
            header: 1,
            defval: "",
            raw: false,
            blankrows: false,
        }) as unknown[][];
        const rows: string[][] = matrix.map((row) =>
            (row ?? []).map((cell) => (cell == null ? "" : String(cell))),
        );
        // Drop fully empty trailing rows (SheetJS sometimes returns padding rows).
        const trimmed = rows.filter((r) => r.some((cell) => cell.trim().length > 0));
        out.push({ name, rows: trimmed });
    }
    if (out.length === 0) {
        throw new SpreadsheetParseError("All sheets in this workbook are empty");
    }
    return { sheets: out };
}

/* ── Spreadsheet dispatch (CSV ↔ XLSX) ──────────────────────────────────── */

export type SpreadsheetFormat = "CSV" | "XLSX";

export interface SpreadsheetParseInput {
    format: SpreadsheetFormat;
    /** For CSV: the raw text. For XLSX: base64-encoded buffer (DB storage)
     *  OR a binary Uint8Array (HTTP body). */
    payload: string | Uint8Array;
    /** XLSX only: which sheet to extract. When omitted, returns the first non-empty sheet. */
    selectedSheet?: string | null;
}

export async function parseSpreadsheet(
    input: SpreadsheetParseInput,
): Promise<{ rows: string[][]; sheetName?: string; sheetNames?: string[] }> {
    if (input.format === "CSV") {
        if (typeof input.payload !== "string") {
            throw new SpreadsheetParseError("CSV payload must be a string");
        }
        return { rows: parseCsv(input.payload) };
    }
    // XLSX path. Accept either base64 (string) or binary (Uint8Array).
    let buffer: Buffer;
    if (typeof input.payload === "string") {
        try {
            buffer = Buffer.from(input.payload, "base64");
        } catch (err) {
            throw new SpreadsheetParseError(
                `Invalid base64 payload: ${err instanceof Error ? err.message : String(err)}`,
            );
        }
    } else {
        buffer = Buffer.from(input.payload);
    }
    const parsed = await parseXlsx(buffer);
    const sheetNames = parsed.sheets.map((s) => s.name);
    const target = input.selectedSheet
        ? parsed.sheets.find((s) => s.name === input.selectedSheet)
        : parsed.sheets[0];
    if (!target) {
        throw new SpreadsheetParseError(
            `Sheet "${input.selectedSheet}" not found. Available: ${sheetNames.join(", ") || "(none)"}`,
        );
    }
    return { rows: target.rows, sheetName: target.name, sheetNames };
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

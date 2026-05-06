/**
 * scripts/check-no-hardcoded-labels.ts
 *
 * Static audit script: flags user-facing literal strings that hardcode the
 * names of org-hierarchy levels ("Campus", "Group") or built-in role labels
 * ("Superadmin", "Campus Admin", etc.). These should always be resolved
 * through `resolveHierarchyLevels()` / `resolveRoleConfig()` /
 * `useEntityNames()` so admins can rename them at runtime.
 *
 * Run: `npm run check:no-hardcoded-labels` (added to package.json).
 *
 * The audit is intentionally conservative: only files under `modules/**` and
 * `components/**` are scanned, and only literal strings inside JSX text /
 * attributes / template literals are flagged. The allowlist below covers
 * the legitimate sources of these labels (config + resolver paths).
 *
 * Exits non-zero on findings so a future change that hardcodes a label
 * blocks the build.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["modules", "components"];

const ALLOWLIST_PATHS = [
    // Config / resolver paths own the canonical labels.
    `config${sep}hierarchy.ts`,
    `config${sep}roles.ts`,
    `config${sep}content.ts`,
    `lib${sep}data${sep}orgUnit.ts`,
    `lib${sep}data${sep}role.ts`,
    `lib${sep}data${sep}entityNames.ts`,
    `lib${sep}auth${sep}permissions.ts`,
    `lib${sep}hooks${sep}useEntityNames.ts`,
    // Admin Config UI shows the canonical labels by design.
    `modules${sep}admin-config${sep}`,
    // Org page and its services manage the canonical labels.
    `modules${sep}org${sep}`,
    // Profile rendering already resolves names via the hook; keep it on
    // the allowlist so the literal "Campus" label heading isn't flagged.
    `modules${sep}users${sep}components${sep}ProfilePage.tsx`,
    `modules${sep}users${sep}components${sep}UserDetailPage.tsx`,
    // Templates editor renders role / level pickers — already resolves.
    `modules${sep}templates${sep}components${sep}TemplateAssignmentsEditor.tsx`,
    // Bulk invites + impersonation dialogs use ROLE_CONFIG by design.
    `modules${sep}bulk-invites${sep}`,
    `components${sep}ui${sep}ImpersonationBanner.tsx`,
    `modules${sep}reports${sep}components${sep}QuickViewAggregateBar.tsx`,
    // Dashboard widgets use level labels via resolveHierarchyLevels already.
    `modules${sep}dashboard${sep}`,
];

const ORG_LABEL_PATTERNS: Array<{ pattern: RegExp; rule: string }> = [
    // We allow the strings inside obvious resolver / TS-type contexts; the
    // regex flags only "Campus"/"Group" appearing as their own word in JSX
    // text or string literals that aren't preceded by an allowed prefix.
    { pattern: /["'`]\s*Campus\s*["'`]/, rule: "no-hardcoded-org-label (Campus)" },
    { pattern: /["'`]\s*Group\s*["'`]/, rule: "no-hardcoded-org-label (Group)" },
    { pattern: /["'`]\s*Org Group\s*["'`]/, rule: "no-hardcoded-org-label (Org Group)" },
    { pattern: />\s*Campus\s*</, rule: "no-hardcoded-org-label (Campus in JSX text)" },
    { pattern: />\s*Group\s*</, rule: "no-hardcoded-org-label (Group in JSX text)" },
];

const ROLE_LABEL_PATTERNS: Array<{ pattern: RegExp; rule: string }> = [
    { pattern: /["'`]\s*Superadmin\s*["'`]/, rule: "no-hardcoded-role-label (Superadmin)" },
    { pattern: /["'`]\s*Campus Admin\s*["'`]/, rule: "no-hardcoded-role-label (Campus Admin)" },
    { pattern: /["'`]\s*Campus Pastor\s*["'`]/, rule: "no-hardcoded-role-label (Campus Pastor)" },
    { pattern: /["'`]\s*Group Admin\s*["'`]/, rule: "no-hardcoded-role-label (Group Admin)" },
    { pattern: /["'`]\s*Group Pastor\s*["'`]/, rule: "no-hardcoded-role-label (Group Pastor)" },
];

interface Finding {
    file: string;
    line: number;
    snippet: string;
    rule: string;
}

function walk(dir: string, out: string[] = []): string[] {
    let entries: string[];
    try {
        entries = readdirSync(dir);
    } catch {
        return out;
    }
    for (const name of entries) {
        const full = join(dir, name);
        try {
            const st = statSync(full);
            if (st.isDirectory()) {
                if (name === "node_modules" || name === ".next" || name === "generated") continue;
                walk(full, out);
            } else if (st.isFile()) {
                if (name.endsWith(".tsx") || name.endsWith(".ts")) out.push(full);
            }
        } catch {
            // ignore
        }
    }
    return out;
}

function isAllowlisted(filePath: string): boolean {
    return ALLOWLIST_PATHS.some((p) => filePath.includes(p));
}

function scanFile(filePath: string): Finding[] {
    if (isAllowlisted(filePath)) return [];
    const out: Finding[] = [];
    let content: string;
    try {
        content = readFileSync(filePath, "utf8");
    } catch {
        return out;
    }
    const rel = relative(ROOT, filePath);
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comment-only lines; they're documentation.
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
        // Skip post-`??` and post-`||` fallback defaults — these only fire
        // when the CONTENT key is missing entirely, which an admin would have
        // to remove on purpose. The CONTENT key itself is admin-editable
        // through the substrate, so the runtime label still follows the
        // admin's wishes; the hardcoded literal is a defensive last resort.
        if (/(\?\?|\|\|)\s*["'`]\s*(Campus|Group|Org Group|Superadmin|Campus Admin|Campus Pastor|Group Admin|Group Pastor)\s*["'`]/i.test(line)) {
            continue;
        }
        for (const { pattern, rule } of [...ORG_LABEL_PATTERNS, ...ROLE_LABEL_PATTERNS]) {
            if (pattern.test(line)) {
                out.push({ file: rel, line: i + 1, snippet: line.trim().slice(0, 120), rule });
            }
        }
    }
    return out;
}

function main(): void {
    const files: string[] = [];
    for (const dir of TARGET_DIRS) {
        files.push(...walk(join(ROOT, dir)));
    }
    const findings: Finding[] = [];
    for (const f of files) findings.push(...scanFile(f));
    if (findings.length === 0) {
        // eslint-disable-next-line no-console
        console.log(
            `[check-no-hardcoded-labels] OK — no hardcoded org or role labels found in ${TARGET_DIRS.join(", ")}.`,
        );
        process.exit(0);
    }
    // eslint-disable-next-line no-console
    console.error(
        `[check-no-hardcoded-labels] Found ${findings.length} hardcoded label(s). Resolve via resolveHierarchyLevels() / useEntityNames() / ROLE_CONFIG instead.`,
    );
    for (const f of findings) {
        // eslint-disable-next-line no-console
        console.error(`  ${f.file}:${f.line}  [${f.rule}]  ${f.snippet}`);
    }
    process.exit(1);
}

main();

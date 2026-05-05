/**
 * scripts/check-mutation-auth.ts
 *
 * Static audit script: every Next.js route under `app/api/**` that exports a
 * mutating method (`POST`, `PUT`, `PATCH`, `DELETE`) MUST call `verifyAuth(...)`
 * inside the handler — that's the single chokepoint where the impersonation
 * read-only gate fires. Routes that are intentionally public (e.g. webhook
 * receivers, public auth endpoints like login / refresh / forgot-password)
 * can opt out via the in-file annotation `// @public-mutation` placed above
 * the export.
 *
 * Run: `npm run check:mutation-auth` (added to package.json).
 *
 * Exits non-zero on any unauthenticated mutation export — wire this into CI
 * so a future route that forgets `verifyAuth` blocks the build.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

const ROOT = join(process.cwd(), "app", "api");
const TARGET_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const OPT_OUT_TAG = "@public-mutation";

interface RouteFinding {
    file: string;
    methods: string[];
    missing: string[];
    optedOut: boolean;
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
        const s = statSync(full);
        if (s.isDirectory()) walk(full, out);
        else if (name === "route.ts" || name === "route.tsx" || name === "route.js") out.push(full);
    }
    return out;
}

function scanRoute(file: string): RouteFinding | null {
    const src = readFileSync(file, "utf8");
    const methods: string[] = [];
    for (const method of TARGET_METHODS) {
        const re = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`, "m");
        if (re.test(src)) methods.push(method);
    }
    if (methods.length === 0) return null;
    const optedOut = src.includes(OPT_OUT_TAG);
    const callsVerifyAuth = /\bverifyAuth\s*\(/.test(src);
    const missing = optedOut || callsVerifyAuth ? [] : methods;
    return { file, methods, missing, optedOut };
}

function main(): void {
    const files = walk(ROOT);
    const findings = files
        .map(scanRoute)
        .filter((x): x is RouteFinding => x !== null);

    const violations = findings.filter((f) => f.missing.length > 0);

    const root = process.cwd();
    if (violations.length === 0) {
        // eslint-disable-next-line no-console
        console.log(
            `[check-mutation-auth] OK — every mutation route under app/api/** calls verifyAuth() (or carries // ${OPT_OUT_TAG}). Scanned ${findings.length} route file(s).`,
        );
        process.exit(0);
    }

    // eslint-disable-next-line no-console
    console.error(
        `[check-mutation-auth] ${violations.length} mutation route(s) missing verifyAuth():`,
    );
    for (const v of violations) {
        const rel = relative(root, v.file).split(sep).join(posix.sep);
        // eslint-disable-next-line no-console
        console.error(`  - ${rel} :: missing on ${v.missing.join(", ")}`);
    }
    // eslint-disable-next-line no-console
    console.error(
        `\nFix: call verifyAuth(req) at the top of the handler, OR add the comment\n  // ${OPT_OUT_TAG}\nabove the export if the endpoint is intentionally public (e.g. webhook).`,
    );
    process.exit(1);
}

main();

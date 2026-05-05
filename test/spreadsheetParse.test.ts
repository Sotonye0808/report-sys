/**
 * test/spreadsheetParse.test.ts
 *
 * Validates the new `parseSpreadsheet` dispatcher + xlsx error path. Runs the
 * CSV path inline and a synthetic xlsx workbook through SheetJS. Run with:
 *
 *   npx tsx test/spreadsheetParse.test.ts
 */

import {
    parseSpreadsheet,
    parseCsv,
    SpreadsheetParseError,
} from "../lib/data/importPipeline";

let failed = 0;
function assert(cond: unknown, label: string) {
    if (!cond) {
        failed += 1;
        console.error(`✗ ${label}`);
    } else {
        console.log(`✓ ${label}`);
    }
}

async function main() {
    // 1) CSV parser remains unchanged.
    const csv = "a,b,c\n1,2,3\n4,5,6";
    const parsedCsv = parseCsv(csv);
    assert(parsedCsv.length === 3, "parseCsv returns 3 rows");
    assert(parsedCsv[0][0] === "a" && parsedCsv[2][2] === "6", "CSV cells correct");

    // 2) parseSpreadsheet dispatches CSV → parseCsv.
    const dispCsv = await parseSpreadsheet({ format: "CSV", payload: csv });
    assert(dispCsv.rows.length === 3, "parseSpreadsheet dispatches CSV correctly");

    // 3) Build a minimal xlsx workbook in-memory and check the parser.
    const xlsx = await import("xlsx");
    const wb = xlsx.utils.book_new();
    const ws1 = xlsx.utils.aoa_to_sheet([
        ["campusId", "period", "attendance"],
        ["lekki", "2026-W17", 240],
        ["surulere", "2026-W17", 188],
    ]);
    xlsx.utils.book_append_sheet(wb, ws1, "Main");
    const ws2 = xlsx.utils.aoa_to_sheet([["other"], ["x"], ["y"]]);
    xlsx.utils.book_append_sheet(wb, ws2, "Other");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const base64 = buffer.toString("base64");

    const parsedFirst = await parseSpreadsheet({ format: "XLSX", payload: base64 });
    assert(parsedFirst.sheetName === "Main", "default sheet selection picks first sheet");
    assert((parsedFirst.sheetNames ?? []).includes("Other"), "all sheet names returned");
    assert(parsedFirst.rows.length === 3, "first sheet has 3 rows incl header");
    assert(parsedFirst.rows[1][0] === "lekki", "first sheet first data cell correct");

    const parsedOther = await parseSpreadsheet({
        format: "XLSX",
        payload: base64,
        selectedSheet: "Other",
    });
    assert(parsedOther.sheetName === "Other", "explicit sheet selection honoured");
    assert(parsedOther.rows.length === 3, "second sheet rows correct");

    // 4) Asking for a missing sheet throws SpreadsheetParseError.
    let threw = false;
    try {
        await parseSpreadsheet({
            format: "XLSX",
            payload: base64,
            selectedSheet: "Missing",
        });
    } catch (err) {
        threw = err instanceof SpreadsheetParseError;
    }
    assert(threw, "missing sheet throws SpreadsheetParseError");

    // 5) CSV format with non-string payload throws.
    threw = false;
    try {
        await parseSpreadsheet({
            format: "CSV",
            payload: new Uint8Array([1, 2, 3]),
        });
    } catch (err) {
        threw = err instanceof SpreadsheetParseError;
    }
    assert(threw, "CSV with non-string payload throws SpreadsheetParseError");

    if (failed > 0) {
        console.error(`\n${failed} assertion(s) failed`);
        process.exit(1);
    }
    console.log("\nAll spreadsheet parse tests passed.");
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});

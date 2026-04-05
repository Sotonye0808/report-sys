export function isScanCursorComplete(cursor: string | number): boolean {
  return cursor === 0 || cursor === "0";
}

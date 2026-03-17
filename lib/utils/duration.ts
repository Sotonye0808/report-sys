// lib/utils/duration.ts
// Utility functions for parsing human-friendly duration strings (e.g. "15m", "8h")

const DURATION_REGEX = /^(\d+)\s*(s|m|h|d)?$/i;

/**
 * Convert a duration string into seconds.
 *
 * Supported formats:
 * - "15" (seconds)
 * - "15s" (seconds)
 * - "15m" (minutes)
 * - "8h" (hours)
 * - "7d" (days)
 *
 * Returns null if the value cannot be parsed.
 */
export function parseDurationToSeconds(value: string | undefined | null): number | null {
    if (!value) return null;
    const trimmed = value.trim();
    const match = DURATION_REGEX.exec(trimmed);
    if (!match) return null;

    const amount = Number(match[1]);
    if (Number.isNaN(amount)) return null;

    const unit = match[2]?.toLowerCase();
    switch (unit) {
        case "d":
            return amount * 24 * 60 * 60;
        case "h":
            return amount * 60 * 60;
        case "m":
            return amount * 60;
        case "s":
        default:
            return amount;
    }
}

/**
 * Parse a duration string, falling back to a default value (seconds) when parsing fails.
 */
export function parseDurationToSecondsOrDefault(value: string | undefined | null, fallbackSeconds: number): number {
    const parsed = parseDurationToSeconds(value);
    return parsed ?? fallbackSeconds;
}

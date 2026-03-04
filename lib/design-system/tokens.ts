/**
 * Design System Tokens — TypeScript Constants
 *
 * Mirrors the CSS custom properties from app/globals.css so TypeScript code
 * (recharts fills, inline styles, etc.) can reference the same source of truth.
 *
 * Usage:
 *   import { DS, palette, chartColors } from "@/lib/design-system/tokens";
 *   <Bar fill={DS.chart[1]} />
 */

/* ── Palette (raw hex) ───────────────────────────────────────────── */
export const palette = {
    black: {
        base: "#0A0A0B",
        soft: "#111214",
        elevated: "#16171A",
    },
    emerald: {
        900: "#064e3b",
        700: "#047857",
        600: "#059669",
        500: "#10b981",
        400: "#34d399",
        200: "#a7f3d0",
        50: "#ecfdf5",
    },
    neutral: {
        950: "#0a0a0a",
        900: "#0f172a",
        800: "#1e293b",
        700: "#374151",
        600: "#4b5563",
        500: "#64748b",
        400: "#94a3b8",
        300: "#cbd5e1",
        200: "#e5e7eb",
        100: "#f1f5f9",
        50: "#f8f9fb",
        0: "#ffffff",
    },
} as const;

/* ── CSS Variable Reference Helper ──────────────────────────────── */
export const cssVar = (name: string) => `var(${name})`;

/* ── Semantic Token References (matching app/globals.css) ────────── */
export const DS = {
    brand: {
        accent: cssVar("--ds-brand-accent"),
        accentHover: cssVar("--ds-brand-accent-hover"),
        accentSubtle: cssVar("--ds-brand-accent-subtle"),
        black: cssVar("--ds-brand-black"),
        blackSoft: cssVar("--ds-brand-black-soft"),
        blackElevated: cssVar("--ds-brand-black-elevated"),
    },
    status: {
        success: cssVar("--ds-status-success"),
        successBg: cssVar("--ds-status-success-bg"),
        warning: cssVar("--ds-status-warning"),
        warningBg: cssVar("--ds-status-warning-bg"),
        error: cssVar("--ds-status-error"),
        errorBg: cssVar("--ds-status-error-bg"),
        info: cssVar("--ds-status-info"),
        infoBg: cssVar("--ds-status-info-bg"),
    },
    surface: {
        base: cssVar("--ds-surface-base"),
        elevated: cssVar("--ds-surface-elevated"),
        sunken: cssVar("--ds-surface-sunken"),
        overlay: cssVar("--ds-surface-overlay"),
        sidebar: cssVar("--ds-surface-sidebar"),
        header: cssVar("--ds-surface-header"),
        glass: cssVar("--ds-surface-glass"),
    },
    text: {
        primary: cssVar("--ds-text-primary"),
        secondary: cssVar("--ds-text-secondary"),
        subtle: cssVar("--ds-text-subtle"),
        inverse: cssVar("--ds-text-inverse"),
        link: cssVar("--ds-text-link"),
    },
    border: {
        base: cssVar("--ds-border-base"),
        strong: cssVar("--ds-border-strong"),
        subtle: cssVar("--ds-border-subtle"),
        glass: cssVar("--ds-border-glass"),
    },
    chart: {
        1: cssVar("--ds-chart-1"),
        2: cssVar("--ds-chart-2"),
        3: cssVar("--ds-chart-3"),
        4: cssVar("--ds-chart-4"),
        5: cssVar("--ds-chart-5"),
        6: cssVar("--ds-chart-6"),
    },
    radius: {
        sm: cssVar("--ds-radius-sm"),
        md: cssVar("--ds-radius-md"),
        lg: cssVar("--ds-radius-lg"),
        xl: cssVar("--ds-radius-xl"),
        "2xl": cssVar("--ds-radius-2xl"),
        full: cssVar("--ds-radius-full"),
    },
    shadow: {
        sm: cssVar("--ds-shadow-sm"),
        md: cssVar("--ds-shadow-md"),
        lg: cssVar("--ds-shadow-lg"),
        xl: cssVar("--ds-shadow-xl"),
    },
    font: {
        sans: cssVar("--ds-font-sans"),
        mono: cssVar("--ds-font-mono"),
    },
} as const;

/**
 * Static chart hex colors for recharts and similar libs that need hex directly.
 * Branch on isDark from your theme context.
 */
export const chartColors = {
    light: ["#2563eb", "#10b981", "#7c3aed", "#ea580c", "#0891b2", "#be185d"],
    dark: ["#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#22d3ee", "#f472b6"],
} as const;

export default DS;

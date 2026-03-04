/**
 * Ant Design Theme — CSS Variable Bridge
 *
 * Provides hex values to Ant Design's ConfigProvider. next-themes toggles
 * `.dark` on <html>, which swaps all --ds-* CSS custom properties automatically.
 * For Ant Design tokens that can't read CSS vars, we branch on `isDark`.
 *
 * Usage:
 *   import { getAntdTheme } from "@/lib/design-system/antd-theme";
 *   <ConfigProvider theme={getAntdTheme(isDark)} />
 */

import type { ThemeConfig } from "antd";
import { palette } from "./tokens";

export function getAntdTheme(isDark: boolean): ThemeConfig {
    return {
        token: {
            /* ── Brand ─────────────────────────────────────────── */
            colorPrimary: palette.emerald[500],         // #10b981
            colorSuccess: isDark ? "#4ade80" : "#15803d",
            colorWarning: isDark ? "#fbbf24" : "#b45309",
            colorError: isDark ? "#f87171" : "#dc2626",
            colorInfo: isDark ? palette.emerald[400] : palette.emerald[700],

            /* ── Surfaces / Backgrounds ─────────────────────────── */
            colorBgContainer: isDark ? palette.black.soft : palette.neutral[0],
            colorBgElevated: isDark ? palette.black.elevated : palette.neutral[0],
            colorBgLayout: isDark ? palette.black.base : palette.neutral[50],
            colorBgSpotlight: isDark ? palette.black.elevated : palette.neutral[100],

            /* ── Text ──────────────────────────────────────────── */
            colorText: isDark ? "#F8FAFC" : palette.neutral[900],
            colorTextSecondary: isDark ? palette.neutral[400] : palette.neutral[500],
            colorTextTertiary: isDark ? "#475569" : palette.neutral[400],
            colorTextQuaternary: isDark ? "#334155" : palette.neutral[300],

            /* ── Borders ───────────────────────────────────────── */
            colorBorder: isDark ? "rgba(255,255,255,0.08)" : palette.neutral[200],
            colorBorderSecondary: isDark ? "rgba(255,255,255,0.04)" : palette.neutral[100],

            /* ── Shape ─────────────────────────────────────────── */
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 4,
            borderRadiusXS: 2,

            /* ── Typography ─────────────────────────────────────── */
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 14,
            fontSizeHeading1: 30,
            fontSizeHeading2: 24,
            fontSizeHeading3: 20,
            fontSizeHeading4: 16,
            fontSizeHeading5: 14,

            /* ── Motion ─────────────────────────────────────────── */
            motionDurationSlow: "0.3s",
            motionDurationMid: "0.2s",
            motionDurationFast: "0.1s",

            /* ── Shadows ────────────────────────────────────────── */
            boxShadow: isDark
                ? "0 4px 8px -2px rgb(0 0 0 / 0.50), 0 2px 4px -2px rgb(0 0 0 / 0.35)"
                : "0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
            boxShadowSecondary: isDark
                ? "0 12px 20px -4px rgb(0 0 0 / 0.60), 0 4px 8px -4px rgb(0 0 0 / 0.40)"
                : "0 12px 20px -4px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
        },
        components: {
            Button: {
                borderRadius: 12,
                borderRadiusLG: 12,
                borderRadiusSM: 8,
                controlHeight: 40,
                controlHeightLG: 48,
                controlHeightSM: 32,
                fontWeight: 600,
            },
            Card: {
                borderRadiusLG: 20,
                paddingLG: 24,
            },
            Modal: {
                borderRadiusLG: 24,
            },
            Input: {
                borderRadius: 12,
                borderRadiusLG: 12,
                controlHeight: 40,
                controlHeightLG: 48,
                controlHeightSM: 32,
            },
            Select: {
                borderRadius: 12,
            },
            Table: {
                borderRadius: 12,
                borderRadiusLG: 12,
            },
            Menu: {
                borderRadius: 8,
                itemBorderRadius: 8,
                subMenuItemBorderRadius: 8,
                itemMarginInline: 8,
                itemPaddingInline: 12,
            },
            Tabs: {
                borderRadius: 8,
            },
            Tag: {
                borderRadiusSM: 6,
            },
            Switch: {
                trackMinWidth: 44,
                trackHeight: 22,
                handleSize: 18,
                trackPadding: 2,
                innerMinMargin: 4,
                innerMaxMargin: 24,
            },
            DatePicker: {
                borderRadius: 12,
            },
            Notification: {
                borderRadiusLG: 16,
            },
            Message: {
                borderRadiusLG: 12,
            },
        },
    };
}

export default getAntdTheme;

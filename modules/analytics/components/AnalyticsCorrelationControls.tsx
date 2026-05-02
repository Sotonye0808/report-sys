"use client";

/**
 * modules/analytics/components/AnalyticsCorrelationControls.tsx
 *
 * Small controls strip used by analytics drill-in pages. Reads the
 * `analytics` admin-config namespace via the public RoleConfigProvider and
 * surfaces a metric-correlation toggle with a config-driven cap.
 *
 * The cap (`analytics.correlation.maxMetrics`) prevents O(n²) blowup on
 * correlation matrices and is configurable by admins through Admin Config.
 */

import { useEffect, useMemo, useState } from "react";
import { Switch, Tag, Tooltip } from "antd";
import { API_ROUTES } from "@/config/routes";

interface AnalyticsConfig {
    correlation?: {
        maxMetrics?: number;
        defaultEnabled?: boolean;
    };
}

interface PublicSnapshotResponse {
    success: boolean;
    data?: {
        analytics?: AnalyticsConfig;
        // public response also exposes other namespaces; we only consume analytics
    };
}

export interface CorrelationControlsValue {
    enabled: boolean;
    maxMetrics: number;
    selectedMetricIds: string[];
}

interface Props {
    availableMetricIds: string[];
    value: CorrelationControlsValue;
    onChange: (next: CorrelationControlsValue) => void;
}

export function AnalyticsCorrelationControls({ availableMetricIds, value, onChange }: Props) {
    const [config, setConfig] = useState<AnalyticsConfig>({});

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const res = await fetch(`${API_ROUTES.adminConfig.namespace("analytics")}`, {
                    cache: "no-store",
                });
                const json = (await res.json()) as PublicSnapshotResponse;
                if (cancelled) return;
                if (json.success && json.data) {
                    // PUT/GET on /admin-config/[ns] returns { namespace, version, payload, ... }
                    const payload = (json as unknown as { data: { payload?: AnalyticsConfig } }).data.payload ?? {};
                    setConfig(payload);
                }
            } catch {
                // fall back to defaults
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const maxMetrics = config.correlation?.maxMetrics ?? value.maxMetrics ?? 12;
    const cappedSelection = useMemo(
        () => value.selectedMetricIds.slice(0, maxMetrics),
        [value.selectedMetricIds, maxMetrics],
    );
    const exceeded = value.selectedMetricIds.length > maxMetrics;

    return (
        <div className="flex flex-wrap items-center gap-3 p-3 border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated">
            <label className="flex items-center gap-2 text-sm">
                <Switch
                    size="small"
                    checked={value.enabled}
                    onChange={(checked) =>
                        onChange({ ...value, enabled: checked, selectedMetricIds: cappedSelection })
                    }
                />
                <span>Enable metric correlation</span>
            </label>
            <Tooltip title={`Server-imposed limit: max ${maxMetrics} metrics participate per view`}>
                <Tag>Max {maxMetrics}</Tag>
            </Tooltip>
            <Tag color="blue">{cappedSelection.length}/{availableMetricIds.length} selected</Tag>
            {exceeded && (
                <Tag color="orange">Selection capped to {maxMetrics}</Tag>
            )}
        </div>
    );
}

export default AnalyticsCorrelationControls;

"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * useApiData — fetches data from an API endpoint and returns the result.
 * Replaces useMockDbSubscription for real DB usage.
 *
 * @param url    API endpoint URL (null/undefined to skip fetching)
 * @param deps   Extra dependencies that trigger a re-fetch
 * @returns      { data, loading, error, refetch }
 */
export function useApiData<T>(
  url: string | null | undefined,
  deps: unknown[] = [],
): { data: T | undefined; loading: boolean; error: string | undefined; refetch: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          let body: { error?: string } = {};
          try { body = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        // Guard against empty / non-JSON responses (e.g., 204 No Content)
        const text = await res.text().catch(() => "");
        return text ? JSON.parse(text) : {};
      })
      .then((json) => {
        if (!cancelled) {
          setData(json.success !== undefined ? json.data : json);
          setError(undefined);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refreshKey, ...deps]);

  return { data, loading, error, refetch };
}

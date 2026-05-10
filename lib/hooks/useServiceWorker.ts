"use client";

import { useEffect, useRef } from "react";

/**
 * useServiceWorker — registers the service worker and handles updates.
 * Call once in the root layout / a top-level provider.
 */
export function useServiceWorker() {
    const registered = useRef(false);

    useEffect(() => {
        if (
            registered.current ||
            typeof window === "undefined" ||
            !("serviceWorker" in navigator)
        )
            return;

        registered.current = true;
        let cancelled = false;
        let updateInterval: number | undefined;

        void (async () => {
            try {
                const probe = await fetch("/sw.js", { cache: "no-store" });
                if (!probe.ok || cancelled) return;

                const reg = await navigator.serviceWorker.register("/sw.js");
                if (cancelled) return;

                // Check for SW updates every 60 minutes.
                updateInterval = window.setInterval(() => {
                    void reg.update().catch(() => {
                        // Ignore update probe failures to avoid uncaught promise noise.
                    });
                }, 60 * 60 * 1000);
            } catch (err) {
                console.error("SW registration failed:", err);
            }
        })();

        return () => {
            cancelled = true;
            if (updateInterval) window.clearInterval(updateInterval);
        };
    }, []);
}

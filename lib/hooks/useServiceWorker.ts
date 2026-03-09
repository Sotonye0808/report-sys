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

        navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
                // Check for SW updates every 60 minutes
                const interval = setInterval(() => reg.update(), 60 * 60 * 1000);
                return () => clearInterval(interval);
            })
            .catch((err) => {
                console.error("SW registration failed:", err);
            });
    }, []);
}

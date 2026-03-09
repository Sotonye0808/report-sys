"use client";

import { useServiceWorker } from "@/lib/hooks/useServiceWorker";

/**
 * Thin client component that registers the service worker.
 * Rendered in the root layout (Server Component cannot call hooks directly).
 */
export function ServiceWorkerRegistrar() {
  useServiceWorker();
  return null;
}

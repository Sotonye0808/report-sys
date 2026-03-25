"use client";

/**
 * lib/hooks/useDraftCache.ts
 *
 * IndexedDB-backed draft caching for report and template forms.
 * Auto-saves form state every few seconds and restores on mount.
 *
 * Usage:
 *   const { cachedDraft, saveDraft, clearDraft } = useDraftCache<MyFormValues>("report-new");
 *   // On mount, cachedDraft has the restored data (or undefined)
 *   // Call saveDraft(values) to persist; clearDraft() after successful submit.
 */

import { useEffect, useRef, useState, useCallback } from "react";

const DB_NAME = "hrs-drafts";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

/* ── IndexedDB helpers ──────────────────────────────────────────────────────── */

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function getLocalStorageItem<T>(key: string): T | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return undefined;
        const record = JSON.parse(raw) as { data: T; updatedAt: number };
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (!record || Date.now() - record.updatedAt > sevenDays) {
            return undefined;
        }
        return record.data;
    } catch {
        return undefined;
    }
}

function setLocalStorageItem<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify({ data, updatedAt: Date.now() }));
    } catch {
        // ignore localStorage errors (storage full, privacy mode)
    }
}

function removeLocalStorageItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

async function getItem<T>(key: string): Promise<T | undefined> {
    const localData = getLocalStorageItem<T>(key);
    if (localData !== undefined) {
        return localData;
    }

    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => {
                const record = req.result as { data: T; updatedAt: number } | undefined;
                if (!record) {
                    resolve(undefined);
                    return;
                }
                const sevenDays = 7 * 24 * 60 * 60 * 1000;
                if (Date.now() - record.updatedAt > sevenDays) {
                    resolve(undefined);
                    return;
                }
                resolve(record.data);
            };
            req.onerror = () => reject(req.error);
        });
    } catch {
        return undefined;
    }
}

async function setItem<T>(key: string, data: T): Promise<void> {
    try {
        setLocalStorageItem(key, data);
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.put({ data, updatedAt: Date.now() }, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        // Silently fail — draft caching is best-effort
    }
}

async function removeItem(key: string): Promise<void> {
    try {
        removeLocalStorageItem(key);
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        // Silently fail
    }
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */

export function useDraftCache<T>(draftKey: string) {
    const [cachedDraft, setCachedDraft] = useState<T | undefined>(undefined);
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load cached draft on mount
    useEffect(() => {
        getItem<T>(draftKey).then((data) => {
            if (data) setCachedDraft(data);
            setIsLoaded(true);
        });
    }, [draftKey]);

    // Debounced save (300ms)
    const saveDraft = useCallback(
        (data: T) => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                setItem(draftKey, data);
            }, 300);
        },
        [draftKey],
    );

    const clearDraft = useCallback(() => {
        setCachedDraft(undefined);
        removeItem(draftKey);
    }, [draftKey]);

    return { cachedDraft, isLoaded, saveDraft, clearDraft };
}

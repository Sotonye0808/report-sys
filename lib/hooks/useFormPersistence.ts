"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useDraftCache } from "@/lib/hooks/useDraftCache";

type FormStatus = "idle" | "saved" | "restored" | "cleared" | "loading" | "error";

interface UseFormPersistenceOptions<T> {
  formKey: string;
  formState: T;
  onRestore: (draft: T) => void;
  enabled?: boolean;
  debounce?: number;
}

interface UseFormPersistenceResult {
  status: FormStatus;
  lastSavedAt: Date | null;
  clearDraft: () => void;
}

export function useFormPersistence<T>({
  formKey,
  formState,
  onRestore,
  enabled = true,
}: UseFormPersistenceOptions<T>): UseFormPersistenceResult {
  const [status, setStatus] = useState<FormStatus>("loading");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const { cachedDraft, isLoaded, saveDraft, clearDraft } = useDraftCache<T>(formKey);

  const lastSavedJsonRef = useRef<string | null>(null);
  const savedToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!isLoaded) {
      setStatus("loading");
      return;
    }
    if (cachedDraft !== undefined) {
      setStatus("restored");
      onRestore(cachedDraft);
      setLastSavedAt(new Date());
    } else {
      setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, cachedDraft, enabled]);

  useEffect(() => {
    if (!enabled || !isLoaded) return;

    let nextStateJson: string;
    try {
      nextStateJson = JSON.stringify(formState);
    } catch {
      nextStateJson = String(formState);
    }

    if (nextStateJson === lastSavedJsonRef.current) {
      return;
    }

    lastSavedJsonRef.current = nextStateJson;

    try {
      saveDraft(formState);
      setStatus("saved");
      setLastSavedAt(new Date());

      if (savedToastTimeoutRef.current) {
        clearTimeout(savedToastTimeoutRef.current);
      }
      savedToastTimeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch {
      setStatus("error");
    }
  }, [enabled, formState, isLoaded, saveDraft]);

  useEffect(() => {
    return () => {
      if (savedToastTimeoutRef.current) {
        clearTimeout(savedToastTimeoutRef.current);
      }
    };
  }, []);


  const clear = () => {
    clearDraft();
    setStatus("cleared");
    setLastSavedAt(null);
  };

  return {
    status,
    lastSavedAt,
    clearDraft: clear,
  };
}

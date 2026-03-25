"use client";

import { useEffect, useMemo, useState } from "react";
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
    try {
      saveDraft(formState);
      setStatus("saved");
      setLastSavedAt(new Date());
    } catch {
      setStatus("error");
    }
  }, [enabled, formState, isLoaded, saveDraft]);

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

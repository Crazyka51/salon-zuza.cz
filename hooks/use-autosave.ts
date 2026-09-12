'use client';

/**
 * Hook pro automatické ukládání formulářů
 */

import { useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

export interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number; // v milisekundách, default 3000
  enabled?: boolean;
}

export interface AutosaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 3000,
  enabled = true,
}: AutosaveOptions<T>) {
  const { toast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<Date | null>(null);
  const errorRef = useRef<string | null>(null);

  const save = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;

    isSavingRef.current = true;
    errorRef.current = null;

    try {
      await onSave(data);
      lastSavedRef.current = new Date();
      
      toast({
        title: 'Uloženo',
        description: 'Změny byly automaticky uloženy',
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Chyba při ukládání';
      errorRef.current = errorMessage;
      
      toast({
        title: 'Chyba při ukládání',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, toast]);

  useEffect(() => {
    if (!enabled) return;

    // Vyčisti předchozí timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Nastav nový timeout pro autosave
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    error: errorRef.current,
    saveNow: save,
  };
}

/**
 * Hook pro sledování statusu autosave
 */
export function useAutosaveStatus(): AutosaveStatus {
  return {
    isSaving: false,
    lastSaved: null,
    error: null,
  };
}

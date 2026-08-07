"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  loadProcedureDraft,
  saveProcedureDraft,
  ProcedureRequestType,
  SavedProcedureDraft,
} from "@/services/procedure-draft.service";

type PersistentDraftOptions<T> = {
  requestType: ProcedureRequestType;
  isStarted: boolean;
  currentStep: number;
  draftData: T;

  restore: (
    draft: SavedProcedureDraft<T>
  ) => void;
};

export function usePersistentProcedureDraft<T>({
  requestType,
  isStarted,
  currentStep,
  draftData,
  restore,
}: PersistentDraftOptions<T>) {
  const [isDraftLoaded, setIsDraftLoaded] =
    useState(false);

  const restoreRef = useRef(restore);

  useEffect(() => {
    restoreRef.current = restore;
  }, [restore]);

  useEffect(() => {
    let cancelled = false;

    const loadDraft = async () => {
      try {
        const draft =
          await loadProcedureDraft<T>(
            requestType
          );

        if (
          !cancelled &&
          draft
        ) {
          restoreRef.current(draft);
        }
      } catch (error) {
        console.error(
          `Không thể tải bản nháp ${requestType}:`,
          error
        );
      } finally {
        if (!cancelled) {
          setIsDraftLoaded(true);
        }
      }
    };

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [requestType]);

  useEffect(() => {
    if (!isDraftLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => {
        saveProcedureDraft(
          requestType,
          {
            isStarted,
            currentStep,
            draftData,
          }
        ).catch((error) => {
          console.error(
            `Không thể lưu bản nháp ${requestType}:`,
            error
          );
        });
      },
      600
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    requestType,
    isDraftLoaded,
    isStarted,
    currentStep,
    draftData,
  ]);

  return {
    isDraftLoaded,
  };
}
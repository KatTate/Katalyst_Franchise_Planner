import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePlan, planKey } from "@/hooks/use-plan";
import { useToast } from "@/hooks/use-toast";
import type { Plan } from "@shared/schema";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";
export type ConflictState = "none" | "conflict";

interface UsePlanAutoSaveReturn {
  plan: Plan | null;
  isLoading: boolean;
  error: Error | null;
  saveStatus: SaveStatus;
  conflictState: ConflictState;
  queueSave: (data: Partial<Plan>) => void;
  retrySave: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

const DEBOUNCE_MS = 2000;
const MAX_RETRIES = 3;
const BASE_RETRY_MS = 1000;

export function usePlanAutoSave(planId: string): UsePlanAutoSaveReturn {
  const { plan, isLoading, error, updatePlan } = usePlan(planId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [conflictState, setConflictState] = useState<ConflictState>("none");
  const pendingDataRef = useRef<Partial<Plan> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isSavingRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expectedUpdatedAtRef = useRef<string | null>(null);
  const hasUnsavedRef = useRef(false);

  useEffect(() => {
    if (plan?.updatedAt) {
      expectedUpdatedAtRef.current = new Date(plan.updatedAt).toISOString();
    }
  }, [plan?.updatedAt]);

  const executeSave = useCallback(async (data: Partial<Plan>) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveStatus("saving");

    const payload: any = { ...data };
    if (expectedUpdatedAtRef.current) {
      payload._expectedUpdatedAt = expectedUpdatedAtRef.current;
    }

    try {
      const result = await updatePlan(payload);
      if (result?.data?.updatedAt) {
        expectedUpdatedAtRef.current = new Date(result.data.updatedAt).toISOString();
      }
      pendingDataRef.current = null;
      hasUnsavedRef.current = false;
      retryCountRef.current = 0;
      setSaveStatus("saved");
      isSavingRef.current = false;
    } catch (err: any) {
      isSavingRef.current = false;
      const errMsg = err?.message || "";
      const is409 = errMsg.startsWith("409");

      if (is409) {
        setSaveStatus("error");
        setConflictState("conflict");
        pendingDataRef.current = null;
        hasUnsavedRef.current = false;
        retryCountRef.current = MAX_RETRIES;
        toast({
          title: "Plan updated elsewhere",
          description: "This plan was updated in another tab or device. Please reload to see the latest version.",
          variant: "destructive",
        });
      } else if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        const delay = BASE_RETRY_MS * Math.pow(2, retryCountRef.current - 1);
        setSaveStatus("saving");
        retryTimerRef.current = setTimeout(() => {
          isSavingRef.current = false;
          executeSave(data);
        }, delay);
        return;
      } else {
        setSaveStatus("error");
        pendingDataRef.current = data;
      }
    }
  }, [updatePlan, toast]);

  const queueSave = useCallback((data: Partial<Plan>) => {
    if (conflictState === "conflict") return;

    pendingDataRef.current = pendingDataRef.current
      ? { ...pendingDataRef.current, ...data }
      : data;
    hasUnsavedRef.current = true;
    setSaveStatus("unsaved");
    retryCountRef.current = 0;

    const previous = queryClient.getQueryData<{ data: Plan }>(planKey(planId));
    if (previous) {
      queryClient.setQueryData(planKey(planId), {
        data: { ...previous.data, ...data },
      });
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const toSave = pendingDataRef.current;
      if (toSave) {
        executeSave(toSave);
      }
    }, DEBOUNCE_MS);
  }, [executeSave, conflictState, queryClient, planId]);

  const retrySave = useCallback(() => {
    retryCountRef.current = 0;
    const toSave = pendingDataRef.current;
    if (toSave) {
      executeSave(toSave);
    }
  }, [executeSave]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current || isSavingRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      if (pendingDataRef.current && !isSavingRef.current) {
        const toSave: any = { ...pendingDataRef.current };
        if (expectedUpdatedAtRef.current) {
          toSave._expectedUpdatedAt = expectedUpdatedAtRef.current;
        }
        updatePlan(toSave).catch(() => {});
      }
    };
  }, [updatePlan]);

  return {
    plan,
    isLoading,
    error,
    saveStatus,
    conflictState,
    queueSave,
    retrySave,
    hasUnsavedChanges: hasUnsavedRef.current || saveStatus === "unsaved",
    isSaving: saveStatus === "saving",
  };
}

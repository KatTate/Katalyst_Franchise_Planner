import { useState, useCallback, useRef } from "react";
import {
  updateFieldValue,
  resetFieldToDefault,
} from "@shared/plan-initialization";
import type {
  PlanFinancialInputs,
  FinancialFieldValue,
} from "@shared/financial-engine";
import {
  FIELD_METADATA,
  parseFieldInput,
} from "@/lib/field-metadata";

interface UseFieldEditingOptions {
  financialInputs: PlanFinancialInputs | null | undefined;
  isSaving: boolean;
  onSave: (updated: PlanFinancialInputs) => void;
}

export function useFieldEditing({ financialInputs, isSaving, onSave }: UseFieldEditingOptions) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const editCanceledRef = useRef(false);

  const handleEditStart = useCallback(
    (category: string, fieldName: string, field: FinancialFieldValue) => {
      if (isSaving) return;
      const meta = FIELD_METADATA[category]?.[fieldName];
      if (!meta) return;
      const key = `${category}.${fieldName}`;
      setEditingField(key);
      switch (meta.format) {
        case "currency":
          setEditValue(String(field.currentValue / 100));
          break;
        case "percentage":
          setEditValue(String((field.currentValue * 100).toFixed(1)));
          break;
        case "integer":
          setEditValue(String(field.currentValue));
          break;
      }
    },
    [isSaving]
  );

  const handleEditCommit = useCallback(() => {
    if (!editingField || !financialInputs || editCanceledRef.current) {
      editCanceledRef.current = false;
      setEditingField(null);
      setEditValue("");
      return;
    }
    const [category, fieldName] = editingField.split(".");
    const meta = FIELD_METADATA[category]?.[fieldName];
    if (!meta) return;
    const parsedValue = parseFieldInput(editValue, meta.format);
    if (isNaN(parsedValue)) {
      setEditingField(null);
      setEditValue("");
      return;
    }
    const categoryObj = financialInputs[category as keyof PlanFinancialInputs];
    const field = categoryObj[fieldName as keyof typeof categoryObj] as FinancialFieldValue;
    if (parsedValue !== field.currentValue) {
      const updatedField = updateFieldValue(field, parsedValue, new Date().toISOString());
      const updatedInputs: PlanFinancialInputs = {
        ...financialInputs,
        [category]: {
          ...categoryObj,
          [fieldName]: updatedField,
        },
      };
      onSave(updatedInputs);
    }
    setEditingField(null);
    setEditValue("");
  }, [editingField, editValue, financialInputs, onSave]);

  const handleEditCancel = useCallback(() => {
    editCanceledRef.current = true;
    setEditingField(null);
    setEditValue("");
  }, []);

  const handleFieldUpdate = useCallback(
    (category: string, fieldName: string, parsedValue: number) => {
      if (!financialInputs || isSaving) return;
      const categoryObj = financialInputs[category as keyof PlanFinancialInputs];
      const field = categoryObj[fieldName as keyof typeof categoryObj] as FinancialFieldValue;
      if (parsedValue !== field.currentValue) {
        const updatedField = updateFieldValue(field, parsedValue, new Date().toISOString());
        const updatedInputs: PlanFinancialInputs = {
          ...financialInputs,
          [category]: {
            ...categoryObj,
            [fieldName]: updatedField,
          },
        };
        onSave(updatedInputs);
      }
    },
    [financialInputs, isSaving, onSave]
  );

  const handleReset = useCallback(
    (category: string, fieldName: string) => {
      if (!financialInputs || isSaving) return;
      const categoryObj = financialInputs[category as keyof PlanFinancialInputs];
      const field = categoryObj[fieldName as keyof typeof categoryObj] as FinancialFieldValue;
      const resetField = resetFieldToDefault(field, new Date().toISOString());
      const updatedInputs: PlanFinancialInputs = {
        ...financialInputs,
        [category]: {
          ...categoryObj,
          [fieldName]: resetField,
        },
      };
      onSave(updatedInputs);
    },
    [financialInputs, isSaving, onSave]
  );

  return {
    editingField,
    editValue,
    focusedField,
    setEditValue,
    setFocusedField,
    handleEditStart,
    handleEditCommit,
    handleEditCancel,
    handleFieldUpdate,
    handleReset,
  };
}

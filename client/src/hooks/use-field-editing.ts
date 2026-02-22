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

function resolveCategoryObj(inputs: PlanFinancialInputs, category: string): Record<string, any> | undefined {
  if (category === "facilitiesDecomposition") {
    return inputs.operatingCosts?.facilitiesDecomposition as any;
  }
  return (inputs as any)[category];
}

function resolveField(categoryObj: Record<string, any>, fieldName: string): FinancialFieldValue | undefined {
  const raw = categoryObj[fieldName];
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw[0] as FinancialFieldValue;
  return raw as FinancialFieldValue;
}

const DECOMP_KEYS = ["rent", "utilities", "telecomIt", "vehicleFleet", "insurance"] as const;

function recomputeFacilitiesAnnual(
  inputs: PlanFinancialInputs,
  updatedDecomp: Record<string, any>,
): FinancialFieldValue[] {
  const now = new Date().toISOString();
  return Array.from({ length: 5 }, (_, yi) => {
    let total = 0;
    for (const dk of DECOMP_KEYS) {
      const arr = updatedDecomp[dk] as FinancialFieldValue[] | undefined;
      if (arr && arr[yi]) total += arr[yi].currentValue;
    }
    const existing = inputs.operatingCosts.facilitiesAnnual?.[yi];
    if (existing) {
      return { ...existing, currentValue: total, source: "user_entry" as const, isCustom: true, lastModifiedAt: now };
    }
    return { currentValue: total, source: "user_entry" as const, brandDefault: null, item7Range: null, lastModifiedAt: now, isCustom: true };
  });
}

function applyDecompUpdate(
  inputs: PlanFinancialInputs,
  updatedDecomp: Record<string, any>,
): PlanFinancialInputs {
  return {
    ...inputs,
    operatingCosts: {
      ...inputs.operatingCosts,
      facilitiesDecomposition: updatedDecomp,
      facilitiesAnnual: recomputeFacilitiesAnnual(inputs, updatedDecomp),
    },
  } as PlanFinancialInputs;
}

function buildUpdatedInputs(
  inputs: PlanFinancialInputs,
  category: string,
  categoryObj: Record<string, any>,
  fieldName: string,
  updatedField: FinancialFieldValue,
  allYears: boolean = false,
): PlanFinancialInputs {
  const raw = categoryObj[fieldName];
  let newValue: FinancialFieldValue | FinancialFieldValue[];
  if (Array.isArray(raw)) {
    const now = new Date().toISOString();
    const isReset = updatedField.source === "brand_default";
    const isPerMonth = raw.length === 60;
    if (allYears || isPerMonth) {
      newValue = raw.map((item: FinancialFieldValue) =>
        isReset
          ? { ...updatedField, brandDefault: item.brandDefault, currentValue: updatedField.currentValue, lastModifiedAt: now }
          : updateFieldValue(item, updatedField.currentValue, now)
      );
    } else {
      newValue = raw.map((item: FinancialFieldValue, i: number) =>
        i === 0
          ? (isReset
            ? { ...updatedField, brandDefault: item.brandDefault, currentValue: updatedField.currentValue, lastModifiedAt: now }
            : updateFieldValue(item, updatedField.currentValue, now))
          : item
      );
    }
  } else {
    newValue = updatedField;
  }

  if (category === "facilitiesDecomposition") {
    const updatedDecomp = { ...categoryObj, [fieldName]: newValue };
    return applyDecompUpdate(inputs, updatedDecomp);
  }
  return {
    ...inputs,
    [category]: {
      ...categoryObj,
      [fieldName]: newValue,
    },
  };
}

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
        case "decimal":
          setEditValue(String(field.currentValue));
          break;
      }
    },
    [isSaving]
  );

  const handleEditCommit = useCallback((allYears?: boolean) => {
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
    const categoryObj = resolveCategoryObj(financialInputs, category);
    if (!categoryObj) return;
    const field = resolveField(categoryObj, fieldName);
    if (!field) return;
    if (parsedValue !== field.currentValue || allYears) {
      const now = new Date().toISOString();
      const updatedField = field.brandDefault !== null && parsedValue === field.brandDefault
        ? resetFieldToDefault(field, now)
        : updateFieldValue(field, parsedValue, now);
      const updatedInputs = buildUpdatedInputs(financialInputs, category, categoryObj, fieldName, updatedField, allYears);
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
      const categoryObj = resolveCategoryObj(financialInputs, category);
      if (!categoryObj) return;
      const field = resolveField(categoryObj, fieldName);
      if (!field) return;
      if (parsedValue !== field.currentValue) {
        const updatedField = updateFieldValue(field, parsedValue, new Date().toISOString());
        const updatedInputs = buildUpdatedInputs(financialInputs, category, categoryObj, fieldName, updatedField);
        onSave(updatedInputs);
      }
    },
    [financialInputs, isSaving, onSave]
  );

  const handleReset = useCallback(
    (category: string, fieldName: string) => {
      if (!financialInputs || isSaving) return;
      const categoryObj = resolveCategoryObj(financialInputs, category);
      if (!categoryObj) return;
      const raw = categoryObj[fieldName];
      if (!raw) return;
      if (Array.isArray(raw)) {
        const resetArr = raw.map((item: FinancialFieldValue) =>
          resetFieldToDefault(item, new Date().toISOString())
        );
        const updatedCategoryObj = { ...categoryObj, [fieldName]: resetArr };
        let updatedInputs: PlanFinancialInputs;
        if (category === "facilitiesDecomposition") {
          updatedInputs = applyDecompUpdate(financialInputs, updatedCategoryObj);
        } else {
          updatedInputs = {
            ...financialInputs,
            [category]: updatedCategoryObj,
          };
        }
        onSave(updatedInputs);
      } else {
        const field = raw as FinancialFieldValue;
        const resetField = resetFieldToDefault(field, new Date().toISOString());
        const updatedInputs = buildUpdatedInputs(financialInputs, category, categoryObj, fieldName, resetField);
        onSave(updatedInputs);
      }
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

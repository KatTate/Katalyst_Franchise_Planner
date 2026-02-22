import { describe, it, expect } from "vitest";
import { INPUT_FIELD_MAP } from "@/components/planning/statements/input-field-map";
import { FIELD_METADATA } from "@/lib/field-metadata";

describe("INPUT_FIELD_MAP mechanical validation", () => {
  it("every INPUT_FIELD_MAP entry has a matching FIELD_METADATA entry with the same format type", () => {
    const mismatches: string[] = [];
    const missing: string[] = [];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      const categoryMeta = FIELD_METADATA[mapping.category];
      if (!categoryMeta) {
        missing.push(
          `${rowKey}: category "${mapping.category}" not found in FIELD_METADATA`
        );
        continue;
      }

      const fieldMeta = categoryMeta[mapping.fieldName];
      if (!fieldMeta) {
        missing.push(
          `${rowKey}: field "${mapping.fieldName}" not found in FIELD_METADATA["${mapping.category}"]`
        );
        continue;
      }

      if (fieldMeta.format !== mapping.inputFormat) {
        mismatches.push(
          `${rowKey}: INPUT_FIELD_MAP says "${mapping.inputFormat}" but FIELD_METADATA says "${fieldMeta.format}" for ${mapping.category}.${mapping.fieldName}`
        );
      }
    }

    if (missing.length > 0) {
      expect.fail(
        `INPUT_FIELD_MAP references fields not in FIELD_METADATA:\n${missing.join("\n")}`
      );
    }

    if (mismatches.length > 0) {
      expect.fail(
        `Format type mismatches between INPUT_FIELD_MAP and FIELD_METADATA:\n${mismatches.join("\n")}`
      );
    }
  });

  it("every INPUT_FIELD_MAP entry has a valid FormatType", () => {
    const validFormats = ["currency", "percentage", "integer", "decimal"];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      expect(
        validFormats.includes(mapping.inputFormat),
        `${rowKey}: invalid inputFormat "${mapping.inputFormat}"`
      ).toBe(true);
    }
  });

  it("no duplicate fieldName mappings exist", () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];

    for (const [rowKey, mapping] of Object.entries(INPUT_FIELD_MAP)) {
      const key = `${mapping.category}.${mapping.fieldName}`;
      if (seen.has(key)) {
        duplicates.push(
          `${rowKey} and ${seen.get(key)} both map to ${key}`
        );
      }
      seen.set(key, rowKey);
    }

    if (duplicates.length > 0) {
      expect.fail(
        `Duplicate field mappings found:\n${duplicates.join("\n")}`
      );
    }
  });
});

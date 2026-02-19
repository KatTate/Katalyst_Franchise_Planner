export { GLOSSARY_TERMS, type GlossaryTerm } from "./glossary-terms";
export { FIELD_HELP_CONTENT, FIELD_HELP_MAP, type FieldHelpContent } from "./field-help";

import { GLOSSARY_TERMS, type GlossaryTerm } from "./glossary-terms";
import { FIELD_HELP_MAP, type FieldHelpContent } from "./field-help";

const glossaryBySlug = new Map<string, GlossaryTerm>(
  GLOSSARY_TERMS.map((term) => [term.slug, term])
);

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return glossaryBySlug.get(slug);
}

export function getFieldHelp(fieldId: string): FieldHelpContent | undefined {
  return FIELD_HELP_MAP.get(fieldId);
}

export function searchGlossary(query: string): GlossaryTerm[] {
  if (!query.trim()) return GLOSSARY_TERMS;
  const lower = query.toLowerCase();
  return GLOSSARY_TERMS.filter(
    (term) =>
      term.term.toLowerCase().includes(lower) ||
      term.definition.toLowerCase().includes(lower)
  );
}

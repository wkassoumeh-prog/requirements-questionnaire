import { buildMasterSectionCatalog } from "./section-catalog";
import type { FormField, FormSchema, FormSection } from "./types";

export const TEMPLATE_CONCISE = "concise";
export const TEMPLATE_COMPREHENSIVE = "comprehensive";

export type QuestionnaireTemplateId = typeof TEMPLATE_CONCISE | typeof TEMPLATE_COMPREHENSIVE;

export interface QuestionnaireTemplateMeta {
  id: QuestionnaireTemplateId;
  name: string;
  description: string;
}

export const QUESTIONNAIRE_TEMPLATES: QuestionnaireTemplateMeta[] = [
  {
    id: TEMPLATE_CONCISE,
    name: "Standard (concise)",
    description: "Focused on site structure, content, and design — default for new projects.",
  },
  {
    id: TEMPLATE_COMPREHENSIVE,
    name: "Comprehensive",
    description: "Full agency worksheet including contact details, inspiration, features, SEO, and timeline.",
  },
];

let catalogCache: FormSection[] | null = null;

export function getMasterSectionCatalog(): FormSection[] {
  if (!catalogCache) {
    catalogCache = buildMasterSectionCatalog();
  }
  return catalogCache.map((s) => cloneSectionDeep(s));
}

export function getCatalogSection(sectionId: string): FormSection | undefined {
  return getMasterSectionCatalog().find((s) => s.id === sectionId);
}

export function cloneSectionDeep(section: FormSection): FormSection {
  return JSON.parse(JSON.stringify(section)) as FormSection;
}

export function cloneSectionForQuestionnaire(section: FormSection, order: number): FormSection {
  const copy = cloneSectionDeep(section);
  copy.order = order;
  return copy;
}

function pickSections(ids: string[]): FormSection[] {
  const catalog = getMasterSectionCatalog();
  return ids.map((id, index) => {
    const found = catalog.find((s) => s.id === id);
    if (!found) throw new Error(`Unknown catalog section: ${id}`);
    return cloneSectionForQuestionnaire(found, index);
  });
}

/** Concise: site-building focus — no client contact block, sections F–J omitted by default. */
function buildConciseSections(): FormSection[] {
  const catalog = getMasterSectionCatalog();
  const sectionA = catalog.find((s) => s.id === "section-a");
  if (!sectionA) throw new Error("Missing section-a");

  const businessOnly: FormSection = cloneSectionForQuestionnaire(sectionA, 0);
  businessOnly.fields = businessOnly.fields.filter(
    (f) => !["contactName", "contactEmail", "contactPhone"].includes(f.id),
  );
  businessOnly.title = "Business and website overview";
  businessOnly.description = "About your business and what this website should achieve.";

  const rest = pickSections(["section-b", "section-c", "section-d", "section-e"]).map((s, i) => ({
    ...s,
    order: i + 1,
  }));

  return [businessOnly, ...rest];
}

/** Comprehensive: full worksheet from master catalog. */
function buildComprehensiveSections(): FormSection[] {
  return pickSections([
    "section-a",
    "section-b",
    "section-c",
    "section-d-comprehensive",
    "section-e",
    "section-f",
    "section-g",
    "section-h",
    "section-i-comprehensive",
    "section-j",
  ]);
}

export function buildQuestionnaireFromTemplate(templateId: QuestionnaireTemplateId): FormSchema {
  const sections =
    templateId === TEMPLATE_COMPREHENSIVE ? buildComprehensiveSections() : buildConciseSections();

  return {
    version: 1,
    baseTemplateId: templateId,
    sections,
  };
}

export const DEFAULT_FORM_SCHEMA: FormSchema = buildQuestionnaireFromTemplate(TEMPLATE_CONCISE);

export function flattenFields(schema: FormSchema): FormField[] {
  return schema.sections.flatMap((s) => s.fields.filter((f) => !f.hidden));
}

/** Email fields are always optional on the customer questionnaire (including restored catalog copies). */
export function normalizePublishedSchema(schema: FormSchema): FormSchema {
  return {
    ...schema,
    sections: schema.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) =>
        field.type === "email" ? { ...field, required: false } : field,
      ),
    })),
  };
}

export function normalizeSectionOrders(sections: FormSection[]): FormSection[] {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((s, index) => ({ ...s, order: index }));
}

export function listAddableCatalogSections(currentSchema: FormSchema): FormSection[] {
  const used = new Set(currentSchema.sections.map((s) => s.id));
  return getMasterSectionCatalog().filter((s) => !used.has(s.id));
}

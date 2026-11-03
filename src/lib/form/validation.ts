import { isConditionMet } from "./conditions";
import type { FormAnswers, FormField, FormSchema } from "./types";

export type FieldErrors = Record<string, string>;

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function validateField(field: FormField, answers: FormAnswers): string | null {
  if (field.hidden || !isConditionMet(field.conditional, answers)) return null;

  const value = answers[field.id];
  const otherKey = `${field.id}__other`;
  const hasOther = answers[otherKey];

  const enforceRequired = field.required && field.type !== "email";
  if (enforceRequired && isEmpty(value) && isEmpty(hasOther)) {
    return "This field is required.";
  }

  if (field.type === "email" && typeof value === "string" && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
  }

  if (field.type === "url" && typeof value === "string" && value) {
    try {
      new URL(value);
    } catch {
      return "Enter a valid URL (include https://).";
    }
  }

  return null;
}

export function validateSchema(schema: FormSchema, answers: FormAnswers): FieldErrors {
  const errors: FieldErrors = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const err = validateField(field, answers);
      if (err) errors[field.id] = err;
    }
  }
  return errors;
}

export function sectionCompletion(schema: FormSchema, answers: FormAnswers, sectionId: string): number {
  const section = schema.sections.find((s) => s.id === sectionId);
  if (!section) return 0;

  const visible = section.fields.filter((f) => !f.hidden && isConditionMet(f.conditional, answers));
  if (visible.length === 0) return 100;

  let filled = 0;
  for (const field of visible) {
    const v = answers[field.id];
    const other = answers[`${field.id}__other`];
    if (!isEmpty(v) || !isEmpty(other)) filled += 1;
  }
  return Math.round((filled / visible.length) * 100);
}

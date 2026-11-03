import type { FieldCondition, FormAnswers } from "./types";

export function isConditionMet(condition: FieldCondition | undefined, answers: FormAnswers): boolean {
  if (!condition) return true;

  const raw = answers[condition.fieldId];
  if (condition.operator === "not_empty") {
    if (raw === undefined || raw === null || raw === "") return false;
    if (Array.isArray(raw) && raw.length === 0) return false;
    return true;
  }

  const values = condition.value;
  if (values === undefined) return true;

  if (Array.isArray(raw)) {
    const wanted = Array.isArray(values) ? values : [values];
    if (condition.operator === "includes") {
      return wanted.some((v) => raw.includes(v));
    }
    return false;
  }

  const compare = Array.isArray(values) ? values[0] : values;
  if (condition.operator === "equals") return String(raw) === compare;
  if (condition.operator === "includes") {
    if (Array.isArray(raw)) return raw.includes(compare);
    return String(raw).includes(compare);
  }

  return true;
}

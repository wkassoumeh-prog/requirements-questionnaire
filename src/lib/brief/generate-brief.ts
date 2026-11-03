import { flattenFields } from "@/lib/form/templates";
import type { FormAnswers, FormField, FormSchema } from "@/lib/form/types";

function formatValue(field: FormField, answers: FormAnswers): string {
  const v = answers[field.id];
  const other = answers[`${field.id}__other`];
  const details = answers[`${field.id}__details`];

  if (v === undefined || v === null || v === "") {
    if (other) return `Other: ${String(other)}`;
    return "_Not provided_";
  }

  if (Array.isArray(v)) {
    const labels = v.map((id) => field.options?.find((o) => o.id === id)?.label ?? id);
    let text = labels.join(", ");
    if (other) text += `; Other: ${String(other)}`;
    return text || "_Not provided_";
  }

  if (typeof v === "object") {
    return "```json\n" + JSON.stringify(v, null, 2) + "\n```";
  }

  let out = String(v);
  if (field.options?.length) {
    const match = field.options.find((o) => o.id === out);
    if (match) out = match.label;
  }
  if (other) out += ` (Other: ${String(other)})`;
  if (details) out += `\n\nAdditional details: ${String(details)}`;
  return out;
}

function missingImportantFields(schema: FormSchema, answers: FormAnswers): string[] {
  const missing: string[] = [];
  const important = ["businessName", "idealCustomers", "visitorActions", "primaryAction"];
  for (const id of important) {
    const field = flattenFields(schema).find((f) => f.id === id);
    if (!field) continue;
    const v = answers[id];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
      missing.push(field.label);
    }
  }
  return missing;
}

export interface GeneratedBrief {
  markdown: string;
  json: Record<string, unknown>;
  cursorBrief: string;
}

export function generateBrief(
  schema: FormSchema,
  answers: FormAnswers,
  meta: { projectName: string; clientName?: string | null; submittedAt?: string | null },
): GeneratedBrief {
  const sections = schema.sections.map((section) => {
    const lines = section.fields.map((field) => {
      return `### ${field.label}\n\n${formatValue(field, answers)}\n`;
    });
    return `## ${section.title}\n\n${section.description ? `_${section.description}_\n\n` : ""}${lines.join("\n")}`;
  });

  const missing = missingImportantFields(schema, answers);

  const markdown = `# Website specification — ${meta.projectName}

> **Status:** Customer requirements document  
> **Client:** ${meta.clientName ?? "—"}  
> **Generated:** ${new Date().toISOString()}  
> ${meta.submittedAt ? `**Submitted:** ${meta.submittedAt}` : "**Draft — not yet submitted**"}

---

## 1. Project overview and business objectives

${sections.find((s) => s.includes("Business and project")) ?? ""}

## 2. Target audience

${sections.find((s) => s.includes("Target audience")) ?? ""}

## 3. Website type and sitemap

${sections.find((s) => s.includes("Website structure")) ?? ""}

## 4. Page-by-page content

${sections.find((s) => s.includes("Website text")) ?? ""}

## 5. Brand identity and visual direction

${sections.find((s) => s.includes("Visual identity")) ?? ""}

## 6. Inspiration websites

${sections.find((s) => s.includes("Design inspiration")) ?? ""}

## 7. Primary and secondary CTAs

${sections.find((s) => s.includes("Primary actions")) ?? ""}

## 8. Functional requirements

${sections.find((s) => s.includes("Features and functionality")) ?? ""}

## 9. SEO, domain, and languages

${sections.find((s) => s.includes("Domain, languages")) ?? ""}

## 10. Timeline and budget

${sections.find((s) => s.includes("Timeline, budget")) ?? ""}

---

## Missing or incomplete important information

${missing.length ? missing.map((m) => `- ${m}`).join("\n") : "- None flagged — review optional fields manually."}

## Developer recommendations (not approved requirements)

- Confirm sitemap and primary CTA before design starts.
- Validate legal pages separately — do not auto-generate compliance text.
- Propose typography and component library after palette and style selections are confirmed.

## Acceptance criteria checklist

- [ ] All confirmed pages have content or explicit placeholders
- [ ] Primary CTA implemented on every key page
- [ ] Brand assets received or placeholder strategy agreed
- [ ] Forms collect fields specified for quotes/contact
- [ ] SEO basics: titles, meta, local business data if applicable
- [ ] Launch checklist with domain, hosting, and analytics
`;

  const json = {
    meta,
    generatedAt: new Date().toISOString(),
    schemaVersion: schema.version,
    answers,
    missingImportant: missing,
    sections: schema.sections.map((s) => ({
      id: s.id,
      title: s.title,
      fields: s.fields.map((f) => ({
        id: f.id,
        label: f.label,
        value: answers[f.id] ?? null,
        other: answers[`${f.id}__other`] ?? null,
        details: answers[`${f.id}__details`] ?? null,
      })),
    })),
  };

  const cursorBrief = `# Cursor implementation brief — ${meta.projectName}

Use this as the starting specification for building the client website. Treat labeled **Confirmed** items as requirements; treat **Missing** and **Recommendations** as follow-ups, not facts.

## Confirmed business context
- **Business:** ${answers.businessName ?? "MISSING"}
- **Industry:** ${answers.industry ?? "MISSING"}
- **Project type:** ${answers.projectType ?? "MISSING"}
- **Primary CTA:** ${answers.primaryAction ?? "MISSING"}

## Build goals
${Array.isArray(answers.websiteGoals) ? answers.websiteGoals.join(", ") : answers.websiteGoals ?? "See full spec"}

## Sitemap / structure
- Structure preferences: ${Array.isArray(answers.siteStructure) ? answers.siteStructure.join(", ") : answers.siteStructure ?? "TBD"}
- Pages: ${Array.isArray(answers.desiredPages) ? answers.desiredPages.join(", ") : answers.desiredPages ?? "TBD"}

## Design direction
- Styles: ${Array.isArray(answers.websiteStyles) ? answers.websiteStyles.join(", ") : answers.websiteStyles ?? "TBD"}
- Tone: ${answers.brandTone ?? "TBD"}
- Palette: see color_palette in JSON export

## Features
${Array.isArray(answers.features) ? answers.features.map((f) => `- ${f}`).join("\n") : "See full specification"}

## Content handling
${answers.contentHandling ?? "TBD"} — do not invent factual business details.

## Missing critical inputs
${missing.length ? missing.map((m) => `- ${m}`).join("\n") : "- None flagged"}

Refer to the full Markdown export for page-level copy, inspiration links, and SEO notes.
`;

  return { markdown, json, cursorBrief };
}

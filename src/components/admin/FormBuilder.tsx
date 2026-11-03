"use client";

import { ArrowDown, ArrowUp, Eye, Plus, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { publishSchemaAction, resetQuestionnaireFromTemplateAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FieldType, FormField, FormSchema, FormSection, QuestionnaireTemplateId } from "@/lib/form/types";
import {
  cloneSectionForQuestionnaire,
  getCatalogSection,
  listAddableCatalogSections,
  normalizeSectionOrders,
  QUESTIONNAIRE_TEMPLATES,
} from "@/lib/form/templates";

const FIELD_TYPES: FieldType[] = [
  "text",
  "email",
  "tel",
  "url",
  "number",
  "date",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "color_palette",
  "style_cards",
  "inspiration_gallery",
  "file",
  "repeatable",
];

type Props = {
  initialSchema: FormSchema;
};

export function FormBuilder({ initialSchema }: Props) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [addSectionId, setAddSectionId] = useState("");
  const [resetTemplateId, setResetTemplateId] = useState<QuestionnaireTemplateId>(
    initialSchema.baseTemplateId ?? "concise",
  );

  const sections = useMemo(
    () => [...schema.sections].sort((a, b) => a.order - b.order),
    [schema.sections],
  );

  const addableSections = useMemo(() => listAddableCatalogSections(schema), [schema]);

  function updateSection(index: number, patch: Partial<FormSection>) {
    setSchema((prev) => {
      const next = [...prev.sections];
      next[index] = { ...next[index], ...patch };
      return { ...prev, sections: next };
    });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSchema((prev) => {
      const next = normalizeSectionOrders([...prev.sections]);
      const a = next[index];
      const b = next[target];
      const orderA = a.order;
      a.order = b.order;
      b.order = orderA;
      return { ...prev, sections: normalizeSectionOrders(next) };
    });
  }

  function updateField(sectionIndex: number, fieldIndex: number, patch: Partial<FormField>) {
    setSchema((prev) => {
      const sectionsCopy = [...prev.sections];
      const fields = [...sectionsCopy[sectionIndex].fields];
      fields[fieldIndex] = { ...fields[fieldIndex], ...patch };
      sectionsCopy[sectionIndex] = { ...sectionsCopy[sectionIndex], fields };
      return { ...prev, sections: sectionsCopy };
    });
  }

  function addField(sectionIndex: number) {
    setSchema((prev) => {
      const sectionsCopy = [...prev.sections];
      const id = `field_${Date.now()}`;
      sectionsCopy[sectionIndex] = {
        ...sectionsCopy[sectionIndex],
        fields: [
          ...sectionsCopy[sectionIndex].fields,
          { id, type: "text", label: "New question", allowOther: true },
        ],
      };
      return { ...prev, sections: sectionsCopy };
    });
  }

  function removeField(sectionIndex: number, fieldIndex: number) {
    setSchema((prev) => {
      const sectionsCopy = [...prev.sections];
      sectionsCopy[sectionIndex] = {
        ...sectionsCopy[sectionIndex],
        fields: sectionsCopy[sectionIndex].fields.filter((_, i) => i !== fieldIndex),
      };
      return { ...prev, sections: sectionsCopy };
    });
  }

  function moveField(sectionIndex: number, fieldIndex: number, direction: -1 | 1) {
    const fields = schema.sections[sectionIndex].fields;
    const target = fieldIndex + direction;
    if (target < 0 || target >= fields.length) return;
    setSchema((prev) => {
      const sectionsCopy = [...prev.sections];
      const list = [...sectionsCopy[sectionIndex].fields];
      [list[fieldIndex], list[target]] = [list[target], list[fieldIndex]];
      sectionsCopy[sectionIndex] = { ...sectionsCopy[sectionIndex], fields: list };
      return { ...prev, sections: sectionsCopy };
    });
  }

  function removeSection(sectionId: string) {
    setSchema((prev) => ({
      ...prev,
      sections: normalizeSectionOrders(prev.sections.filter((s) => s.id !== sectionId)),
    }));
  }

  function addSectionFromCatalog(sectionId: string) {
    const master = getCatalogSection(sectionId);
    if (!master) return;
    setSchema((prev) => {
      if (prev.sections.some((s) => s.id === sectionId)) return prev;
      const order = prev.sections.length;
      return {
        ...prev,
        sections: [...prev.sections, cloneSectionForQuestionnaire(master, order)],
      };
    });
    setAddSectionId("");
  }

  function restoreSectionFromCatalog(sectionId: string) {
    const master = getCatalogSection(sectionId);
    if (!master) return;
    setSchema((prev) => {
      const index = prev.sections.findIndex((s) => s.id === sectionId);
      if (index === -1) return prev;
      const order = prev.sections[index].order;
      const sectionsCopy = [...prev.sections];
      sectionsCopy[index] = cloneSectionForQuestionnaire(master, order);
      return { ...prev, sections: sectionsCopy };
    });
  }

  function toggleHidden(sectionIndex: number) {
    const section = schema.sections[sectionIndex];
    updateSection(sectionIndex, { hidden: !section.hidden });
  }

  async function publish() {
    setPublishing(true);
    setMessage(null);
    try {
      await publishSchemaAction({
        ...schema,
        sections: normalizeSectionOrders(schema.sections),
        version: schema.version + 1,
      });
      setMessage("Published. New client projects use this questionnaire; existing submissions keep their snapshot.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function resetFromTemplate() {
    if (
      !window.confirm(
        "Replace your current questionnaire with a fresh copy from the selected template? This does not change the template library. Publish after resetting.",
      )
    ) {
      return;
    }
    setMessage(null);
    try {
      const fresh = await resetQuestionnaireFromTemplateAction(resetTemplateId);
      setSchema(fresh);
      setMessage(`Questionnaire reset from “${QUESTIONNAIRE_TEMPLATES.find((t) => t.id === resetTemplateId)?.name}” template. Publish to apply for new client links.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Reset failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Form builder</h1>
          <p className="text-sm text-secondary">
            You are editing a <strong>questionnaire version</strong>, not the master template library. Remove sections
            freely — add them back anytime from the template dropdown below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/form-builder/preview" target="_blank">
              <Eye className="h-4 w-4" /> Preview
            </Link>
          </Button>
          <Button onClick={() => void publish()} disabled={publishing}>
            {publishing ? "Publishing…" : "Publish questionnaire"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template library</CardTitle>
          <CardDescription>
            Start over from a standard template, or add individual sections that are not in your questionnaire yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[220px] flex-1">
            <Label>Reset questionnaire from template</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              value={resetTemplateId}
              onChange={(e) => setResetTemplateId(e.target.value as QuestionnaireTemplateId)}
            >
              {QUESTIONNAIRE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {QUESTIONNAIRE_TEMPLATES.find((t) => t.id === resetTemplateId)?.description}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => void resetFromTemplate()}>
            <RotateCcw className="h-4 w-4" /> Reset from template
          </Button>

          <div className="min-w-[220px] flex-1">
            <Label>Add section from template library</Label>
            <div className="mt-1 flex gap-2">
              <select
                className="flex h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
                value={addSectionId}
                onChange={(e) => setAddSectionId(e.target.value)}
              >
                <option value="">Choose a section…</option>
                {addableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                disabled={!addSectionId}
                onClick={() => addSectionFromCatalog(addSectionId)}
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {addableSections.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">All library sections are already in this questionnaire.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}

      {sections.map((section, sectionIndex) => {
        const realIndex = schema.sections.findIndex((s) => s.id === section.id);
        return (
          <Card key={section.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <p className="text-xs text-slate-500 font-mono mt-1">{section.id}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button type="button" size="icon" variant="ghost" onClick={() => moveSection(sectionIndex, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => moveSection(sectionIndex, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => restoreSectionFromCatalog(section.id)}>
                    Restore defaults
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => toggleHidden(realIndex)}>
                    {section.hidden ? "Show" : "Hide"}
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeSection(section.id)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Section title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(realIndex, { title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Section description</Label>
                  <Textarea
                    value={section.description ?? ""}
                    onChange={(e) => updateSection(realIndex, { description: e.target.value })}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={field.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700">{field.id}</p>
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" onClick={() => moveField(realIndex, fieldIndex, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => moveField(realIndex, fieldIndex, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeField(realIndex, fieldIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label>Question label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(realIndex, fieldIndex, { label: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Field type</Label>
                      <select
                        className="mt-1 flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                        value={field.type}
                        onChange={(e) => updateField(realIndex, fieldIndex, { type: e.target.value as FieldType })}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Help text</Label>
                      <Textarea
                        value={field.helpText ?? ""}
                        onChange={(e) => updateField(realIndex, fieldIndex, { helpText: e.target.value })}
                        className="mt-1 min-h-[70px]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder ?? ""}
                        onChange={(e) => updateField(realIndex, fieldIndex, { placeholder: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                      <div className="md:col-span-2">
                        <Label>Options (one per line: id|Label)</Label>
                        <Textarea
                          className="mt-1 min-h-[100px] font-mono text-xs"
                          value={(field.options ?? []).map((o) => `${o.id}|${o.label}`).join("\n")}
                          onChange={(e) => {
                            const options = e.target.value
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean)
                              .map((line) => {
                                const [id, ...rest] = line.split("|");
                                return { id: id.trim(), label: rest.join("|").trim() || id.trim() };
                              });
                            updateField(realIndex, fieldIndex, { options });
                          }}
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(field.required)}
                        onChange={(e) => updateField(realIndex, fieldIndex, { required: e.target.checked })}
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(field.allowOther)}
                        onChange={(e) => updateField(realIndex, fieldIndex, { allowOther: e.target.checked })}
                      />
                      Allow custom answer
                    </label>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addField(realIndex)}>
                <Plus className="h-4 w-4" /> Add question
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

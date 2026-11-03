"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Check, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FormAnswers, FormField } from "@/lib/form/types";

const OTHER_ID = "__other__";

type Props = {
  field: FormField;
  answers: FormAnswers;
  onChange: (fieldId: string, value: unknown) => void;
  error?: string;
  uploadToken?: string;
};

function FieldHelp({ field }: { field: FormField }) {
  return (
    <div className="space-y-1 text-sm text-secondary">
      {field.helpText ? <p>{field.helpText}</p> : null}
      {field.example ? <p className="text-muted italic">Example: {field.example}</p> : null}
    </div>
  );
}

function OtherFields({
  field,
  answers,
  onChange,
}: {
  field: FormField;
  answers: FormAnswers;
  onChange: (fieldId: string, value: unknown) => void;
}) {
  if (!field.allowOther && !field.allowAdditionalDetails) return null;
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3">
      {field.allowOther ? (
        <div>
          <Label htmlFor={`${field.id}-other`}>{field.otherLabel ?? "Something else (please describe)"}</Label>
          <Input
            id={`${field.id}-other`}
            value={String(answers[`${field.id}__other`] ?? "")}
            onChange={(e) => onChange(`${field.id}__other`, e.target.value)}
            placeholder="Your answer"
            className="mt-1"
          />
        </div>
      ) : null}
      {field.allowAdditionalDetails ? (
        <div>
          <Label htmlFor={`${field.id}-details`}>Additional details (optional)</Label>
          <Textarea
            id={`${field.id}-details`}
            value={String(answers[`${field.id}__details`] ?? "")}
            onChange={(e) => onChange(`${field.id}__details`, e.target.value)}
            className="mt-1 min-h-[80px]"
          />
        </div>
      ) : null}
    </div>
  );
}

export function FieldRenderer({ field, answers, onChange, error, uploadToken }: Props) {
  const value = answers[field.id];

  async function handleFile(file: File) {
    if (!uploadToken) {
      onChange(field.id, { name: file.name, localOnly: true });
      return;
    }
    const body = new FormData();
    body.append("file", file);
    body.append("token", uploadToken);
    body.append("fieldId", field.id);
    const res = await fetch("/api/upload", { method: "POST", body });
    if (!res.ok) {
      onChange(field.id, { error: "Upload failed", name: file.name });
      return;
    }
    const json = (await res.json()) as { path: string; url?: string };
    onChange(field.id, json);
  }

  return (
    <div className="space-y-2">
      <Label className="text-base">
        {field.label}
        {field.required ? <span className="text-red-600"> *</span> : null}
      </Label>
      <FieldHelp field={field} />

      {(field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "url" || field.type === "number" || field.type === "date") && (
        <Input
          type={field.type === "text" ? "text" : field.type}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
          className="min-h-[140px]"
        />
      )}

      {field.type === "select" && (
        <select
          className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          value={String(value ?? "")}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          <option value="">Select an option</option>
          {field.options?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
          {field.allowOther ? <option value={OTHER_ID}>Something else</option> : null}
        </select>
      )}

      {field.type === "radio" && (
        <RadioGroup.Root
          className="space-y-2"
          value={String(value ?? "")}
          onValueChange={(v) => onChange(field.id, v)}
        >
          {field.options?.map((o) => (
            <label key={o.id} className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-3 hover:border-indigo-300">
              <RadioGroup.Item
                value={o.id}
                className="mt-0.5 h-4 w-4 rounded-full border border-slate-400 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--text-primary)]">{o.label}</span>
                {o.description ? <span className="block text-sm text-secondary">{o.description}</span> : null}
                {o.example ? <span className="block text-xs text-muted italic mt-1">{o.example}</span> : null}
              </span>
            </label>
          ))}
        </RadioGroup.Root>
      )}

      {field.type === "checkbox" && (
        <div className="space-y-2">
          {field.options?.map((o) => {
            const selected = Array.isArray(value) ? value.includes(o.id) : false;
            return (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  selected ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300",
                )}
              >
                <Checkbox.Root
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? [...value] : [];
                    const next = checked
                      ? [...current, o.id]
                      : current.filter((id) => id !== o.id);
                    onChange(field.id, next);
                  }}
                  className="mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-slate-400 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3 w-3 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span className="text-sm text-[var(--text-primary)]">{o.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {field.type === "color_palette" && (
        <div className="space-y-4">
          {(field.config?.palettes ?? []).map((palette) => {
            const selected = (value as { presetId?: string } | undefined)?.presetId === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() =>
                  onChange(field.id, {
                    presetId: palette.id,
                    name: palette.name,
                    colors: [...palette.colors],
                  })
                }
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all",
                  selected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-300",
                )}
              >
                <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">{palette.name}</p>
                <div className="flex flex-wrap gap-2">
                  {palette.colors.map((color, idx) => (
                    <span
                      key={`${palette.id}-${idx}`}
                      className="h-10 w-10 rounded-md border border-black/10 shadow-inner"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </button>
            );
          })}
          <div>
            <Label>Custom colors (HEX, comma-separated)</Label>
            <Input
              className="mt-1"
              placeholder="#1E293B, #F8FAFC, #4F46E5"
              value={String((value as { custom?: string } | undefined)?.custom ?? "")}
              onChange={(e) => {
                const prev = (value as Record<string, unknown>) ?? {};
                onChange(field.id, { ...prev, custom: e.target.value, presetId: "custom" });
              }}
            />
          </div>
        </div>
      )}

      {field.type === "style_cards" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {field.options?.map((o) => {
            const selected = Array.isArray(value) ? value.includes(o.id) : value === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  if (Array.isArray(value)) {
                    const next = selected ? value.filter((v) => v !== o.id) : [...value, o.id];
                    onChange(field.id, next);
                  } else {
                    onChange(field.id, selected ? [] : [o.id]);
                  }
                }}
                className={cn(
                  "rounded-xl border p-4 text-left",
                  selected ? "border-indigo-500 bg-indigo-50/40" : "border-slate-200 hover:border-slate-300",
                )}
              >
                <p className="font-medium text-[var(--text-primary)]">{o.label}</p>
                {o.description ? <p className="mt-1 text-sm text-secondary">{o.description}</p> : null}
              </button>
            );
          })}
        </div>
      )}

      {field.type === "inspiration_gallery" && (
        <div className="grid gap-3">
          {(field.config?.inspiration ?? []).map((item) => {
            const picks = (value as { selected?: string[]; notes?: Record<string, string> }) ?? {
              selected: [],
              notes: {},
            };
            const isSelected = picks.selected?.includes(item.id);
            return (
              <div key={item.id} className={cn("rounded-xl border p-4", isSelected ? "border-indigo-500" : "border-slate-200")}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                    <p className="text-sm text-secondary">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                  >
                    Visit <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => {
                      const selected = new Set(picks.selected ?? []);
                      if (isSelected) selected.delete(item.id);
                      else selected.add(item.id);
                      onChange(field.id, { ...picks, selected: Array.from(selected) });
                    }}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                  <Input
                    placeholder="What do you like about this site?"
                    value={picks.notes?.[item.id] ?? ""}
                    onChange={(e) =>
                      onChange(field.id, {
                        ...picks,
                        notes: { ...(picks.notes ?? {}), [item.id]: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {field.type === "file" && (
        <div className="space-y-2">
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          {value ? (
            <p className="text-sm text-secondary">
              Attached: {typeof value === "object" && value !== null && "name" in value ? String((value as { name: string }).name) : "File saved"}
            </p>
          ) : null}
        </div>
      )}

      {field.type === "repeatable" && (
        <RepeatableField field={field} answers={answers} onChange={onChange} />
      )}

      <OtherFields field={field} answers={answers} onChange={onChange} />
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
    </div>
  );
}

function RepeatableField({
  field,
  answers,
  onChange,
}: {
  field: FormField;
  answers: FormAnswers;
  onChange: (fieldId: string, value: unknown) => void;
}) {
  const rows = (Array.isArray(answers[field.id]) ? answers[field.id] : []) as Record<string, unknown>[];

  function updateRow(index: number, subFieldId: string, subValue: unknown) {
    const next = rows.map((row, i) => (i === index ? { ...row, [subFieldId]: subValue } : row));
    onChange(field.id, next);
  }

  function addRow() {
    onChange(field.id, [...rows, {}]);
  }

  function removeRow(index: number) {
    onChange(
      field.id,
      rows.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-secondary">Entry {index + 1}</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(index)}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
          <div className="space-y-4">
            {field.repeatableFields?.map((sub) => (
              <div key={sub.id} className="space-y-2">
                <Label>{sub.label}</Label>
                {sub.type === "textarea" ? (
                  <Textarea
                    value={String(row[sub.id] ?? "")}
                    placeholder={sub.placeholder}
                    onChange={(e) => updateRow(index, sub.id, e.target.value)}
                  />
                ) : sub.type === "file" ? (
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateRow(index, sub.id, { name: file.name });
                    }}
                  />
                ) : (
                  <Input
                    type={sub.type === "url" ? "url" : "text"}
                    value={String(row[sub.id] ?? "")}
                    placeholder={sub.placeholder}
                    onChange={(e) => updateRow(index, sub.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addRow}>
        <Plus className="h-4 w-4" />
        {field.repeatableAddLabel ?? "Add entry"}
      </Button>
    </div>
  );
}

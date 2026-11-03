"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, Save, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { FieldRenderer } from "@/components/form/FieldRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isConditionMet } from "@/lib/form/conditions";
import type { FormAnswers, FormSchema, SiteSettings } from "@/lib/form/types";
import { sectionCompletion, validateSchema, type FieldErrors } from "@/lib/form/validation";

type Props = {
  token: string;
  schema: FormSchema;
  initialAnswers: FormAnswers;
  settings: SiteSettings;
  initialStatus: "draft" | "submitted";
  projectName: string;
  previewMode?: boolean;
};

export function FormQuestionnaire({
  token,
  schema,
  initialAnswers,
  settings,
  initialStatus,
  projectName,
  previewMode = false,
}: Props) {
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState(initialStatus);
  const [view, setView] = useState<"form" | "review" | "success">(initialStatus === "submitted" ? "success" : "form");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const sortedSections = useMemo(
    () => [...schema.sections].filter((s) => !s.hidden).sort((a, b) => a.order - b.order),
    [schema.sections],
  );

  const overallProgress = useMemo(() => {
    if (!sortedSections.length) return 0;
    const avg =
      sortedSections.reduce((sum, s) => sum + sectionCompletion(schema, answers, s.id), 0) /
      sortedSections.length;
    return Math.round(avg);
  }, [answers, schema, sortedSections]);

  const onChange = useCallback((fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  async function saveDraft() {
    if (previewMode) return;
    setSaveState("saving");
    const res = await fetch("/api/questionnaire/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers }),
    });
    setSaveState(res.ok ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), 2500);
  }

  async function submitFinal() {
    if (previewMode) return;
    const validation = validateSchema(schema, answers);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setView("form");
      return;
    }
    const res = await fetch("/api/questionnaire/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers }),
    });
    if (!res.ok) return;
    setStatus("submitted");
    setView("success");
  }

  if (view === "success") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Submission received</CardTitle>
          <CardDescription>{settings.confirmationMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary">Project: {projectName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
      <aside className="lg:sticky lg:top-6 lg:w-64 lg:shrink-0">
        <div className="surface-card rounded-2xl border p-4 shadow-sm">
          <p className="text-sm font-semibold text-secondary">Progress</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{overallProgress}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-[var(--brand)] transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <nav className="mt-4 space-y-1">
            {sortedSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-slate-100"
              >
                {section.title}
                <span className="float-right text-xs text-muted">
                  {sectionCompletion(schema, answers, section.id)}%
                </span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-brand">{settings.agencyName}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {settings.welcomeMessage}
          </h1>
          <p className="max-w-2xl text-secondary leading-relaxed">{settings.formIntroduction}</p>
          <p className="text-sm text-muted">Project: {projectName}</p>
        </header>

        {view === "review" ? (
          <Card>
            <CardHeader>
              <CardTitle>Review your answers</CardTitle>
              <CardDescription>Check important details before submitting. You can go back to edit any section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedSections.map((section) => (
                <div key={section.id} className="border-b border-slate-100 pb-4 last:border-0">
                  <h3 className="font-medium text-[var(--text-primary)]">{section.title}</h3>
                  <p className="text-sm text-muted">{sectionCompletion(schema, answers, section.id)}% complete</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setView("form")}>
                  Back to edit
                </Button>
                <Button type="button" onClick={() => void submitFinal()} disabled={status === "submitted"}>
                  Confirm and submit
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedSections.map((section) => (
            <Collapsible.Root key={section.id} defaultOpen>
              <section id={section.id} className="scroll-mt-24">
                <Card>
                  <Collapsible.Trigger className="group w-full text-left">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        {section.description ? <CardDescription className="mt-2">{section.description}</CardDescription> : null}
                      </div>
                      <ChevronDown className="h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform group-data-[state=open]:rotate-180" />
                    </CardHeader>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <CardContent className="space-y-8">
                      {section.fields
                        .filter((f) => !f.hidden && isConditionMet(f.conditional, answers))
                        .map((field) => (
                          <FieldRenderer
                            key={field.id}
                            field={field}
                            answers={answers}
                            onChange={onChange}
                            error={errors[field.id]}
                            uploadToken={token}
                          />
                        ))}
                    </CardContent>
                  </Collapsible.Content>
                </Card>
              </section>
            </Collapsible.Root>
          ))
        )}

        {view === "form" ? (
          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-lg">
            <p className="text-sm text-secondary">
              {saveState === "saved" ? "Draft saved." : saveState === "error" ? "Could not save draft." : "Your link saves progress securely."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void saveDraft()} disabled={status === "submitted"}>
                <Save className="h-4 w-4" /> Save draft
              </Button>
              <Button type="button" variant="secondary" onClick={() => setView("review")}>
                Review
              </Button>
              <Button type="button" onClick={() => void submitFinal()} disabled={status === "submitted"}>
                <Send className="h-4 w-4" /> Submit
              </Button>
            </div>
          </div>
        ) : null}

        <footer className="pb-12 text-sm text-secondary">
          <p>{settings.footerText}</p>
          <p className="mt-2">
            Privacy: Your responses are used only to plan and build your website project. This tool does not provide legal advice.
          </p>
          {settings.contactEmail ? <p className="mt-1">Questions? {settings.contactEmail}</p> : null}
        </footer>
      </div>
    </div>
  );
}

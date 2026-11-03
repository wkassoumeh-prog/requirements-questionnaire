"use server";

import { revalidatePath } from "next/cache";
import { ensureBootstrapData, createProject, publishFormSchema, updateSiteSettings } from "@/lib/db/repository";
import type { FormSchema, QuestionnaireTemplateId, SiteSettings } from "@/lib/form/types";
import { buildQuestionnaireFromTemplate } from "@/lib/form/templates";

export async function bootstrapAdminDataAction() {
  await ensureBootstrapData();
  revalidatePath("/admin");
}

export async function publishSchemaAction(schema: FormSchema) {
  await publishFormSchema(schema);
  revalidatePath("/admin/form-builder");
  revalidatePath("/q");
}

export async function resetQuestionnaireFromTemplateAction(
  templateId: QuestionnaireTemplateId,
): Promise<FormSchema> {
  return buildQuestionnaireFromTemplate(templateId);
}

export async function saveSettingsAction(settings: SiteSettings) {
  await updateSiteSettings(settings);
  revalidatePath("/admin/settings");
}

export async function createProjectAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  if (!name) throw new Error("Project name is required");

  const { token } = await createProject({
    name,
    clientName: clientName || undefined,
    clientEmail: clientEmail || undefined,
  });
  revalidatePath("/admin/projects");
  return token;
}

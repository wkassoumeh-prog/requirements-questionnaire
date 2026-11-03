"use server";

import { revalidatePath } from "next/cache";
import { ensureBootstrapData, createProject, publishFormSchema, updateSiteSettings } from "@/lib/db/repository";
import type { FormSchema, QuestionnaireTemplateId, SiteSettings } from "@/lib/form/types";
import { buildQuestionnaireFromTemplate } from "@/lib/form/templates";
import { requireAdminUser } from "@/lib/auth/admin";
import { useLocalDevStore } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function bootstrapAdminDataAction() {
  await ensureBootstrapData();
  revalidatePath("/admin");
}

export async function publishSchemaAction(schema: FormSchema) {
  await requireAdminUser();
  await publishFormSchema(schema);
  revalidatePath("/admin/form-builder");
  revalidatePath("/q");
}

export async function resetQuestionnaireFromTemplateAction(
  templateId: QuestionnaireTemplateId,
): Promise<FormSchema> {
  await requireAdminUser();
  return buildQuestionnaireFromTemplate(templateId);
}

export async function saveSettingsAction(settings: SiteSettings) {
  await requireAdminUser();
  await updateSiteSettings(settings);
  revalidatePath("/admin/settings");
}

export async function createProjectAction(formData: FormData) {
  await requireAdminUser();
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

export async function signOutAction() {
  if (useLocalDevStore()) {
    revalidatePath("/admin");
    return;
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin");
}

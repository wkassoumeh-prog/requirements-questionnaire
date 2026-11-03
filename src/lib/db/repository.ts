import { DEFAULT_FORM_SCHEMA, normalizePublishedSchema } from "@/lib/form/templates";
import { DEFAULT_SITE_SETTINGS, type FormAnswers, type FormSchema, type SiteSettings } from "@/lib/form/types";
import { generateToken } from "@/lib/utils";
import * as local from "@/lib/db/local-store";
import { useLocalDevStore } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/server";

export type ProjectRow = {
  id: string;
  name: string;
  client_name: string | null;
  client_email: string | null;
  access_token: string;
  status: string;
  is_sample: boolean;
  admin_notes: string | null;
  created_at: string;
};

export type SubmissionRow = {
  id: string;
  project_id: string;
  form_schema_snapshot: FormSchema;
  answers: FormAnswers;
  status: "draft" | "submitted";
  submitted_at: string | null;
  updated_at: string;
};

function getService() {
  return createServiceClient();
}

export async function ensureBootstrapData(): Promise<void> {
  if (useLocalDevStore()) {
    await local.localEnsureBootstrapData();
    return;
  }

  const supabase = getService();

  const { data: settingsRows } = await supabase.from("site_settings").select("id").limit(1);
  if (!settingsRows?.length) {
    await supabase.from("site_settings").insert({ settings: DEFAULT_SITE_SETTINGS });
  }

  const { data: published } = await supabase
    .from("form_schemas")
    .select("id")
    .eq("is_published", true)
    .limit(1);

  if (!published?.length) {
    await supabase.from("form_schemas").insert({
      version: DEFAULT_FORM_SCHEMA.version,
      schema: DEFAULT_FORM_SCHEMA,
      is_published: true,
    });
  }

  const { data: sampleProject } = await supabase
    .from("projects")
    .select("id")
    .eq("is_sample", true)
    .limit(1);

  if (!sampleProject?.length) {
    const token = generateToken();
    const { data: project } = await supabase
      .from("projects")
      .insert({
        name: "Sample — Riverside Dental (Demo)",
        client_name: "Dr. Anna Keller",
        client_email: "demo@example.com",
        access_token: token,
        is_sample: true,
        admin_notes: "Demo project for testing the questionnaire flow.",
      })
      .select("id")
      .single();

    if (project) {
      await supabase.from("submissions").insert({
        project_id: project.id,
        form_schema_snapshot: DEFAULT_FORM_SCHEMA,
        answers: {
          businessName: "Riverside Dental",
          contactName: "Dr. Anna Keller",
          contactEmail: "demo@example.com",
          industry: "healthcare",
          businessDescription: "Modern family dental practice focused on gentle care.",
        },
        status: "draft",
      });
    }
  }
}

export async function getPublishedFormSchema(): Promise<FormSchema> {
  if (useLocalDevStore()) return local.localGetPublishedFormSchema();

  const supabase = getService();
  const { data, error } = await supabase
    .from("form_schemas")
    .select("schema")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  const raw = (data?.schema as FormSchema) ?? DEFAULT_FORM_SCHEMA;
  return normalizePublishedSchema(raw);
}

export async function publishFormSchema(schema: FormSchema): Promise<void> {
  const normalized = normalizePublishedSchema(schema);
  if (useLocalDevStore()) {
    await local.localPublishFormSchema(normalized);
    return;
  }

  const supabase = getService();
  await supabase.from("form_schemas").update({ is_published: false }).eq("is_published", true);
  await supabase.from("form_schemas").insert({
    version: normalized.version,
    schema: normalized,
    is_published: true,
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (useLocalDevStore()) return local.localGetSiteSettings();

  const supabase = getService();
  const { data } = await supabase.from("site_settings").select("settings").limit(1).maybeSingle();
  return { ...DEFAULT_SITE_SETTINGS, ...(data?.settings as SiteSettings | undefined) };
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  if (useLocalDevStore()) {
    await local.localUpdateSiteSettings(settings);
    return;
  }

  const supabase = getService();
  const { data: row } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();
  if (row?.id) {
    await supabase.from("site_settings").update({ settings, updated_at: new Date().toISOString() }).eq("id", row.id);
  } else {
    await supabase.from("site_settings").insert({ settings });
  }
}

export async function listProjects(): Promise<ProjectRow[]> {
  if (useLocalDevStore()) return local.localListProjects();

  const supabase = getService();
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function createProject(input: {
  name: string;
  clientName?: string;
  clientEmail?: string;
}): Promise<{ project: ProjectRow; token: string }> {
  if (useLocalDevStore()) return local.localCreateProject(input);

  const supabase = getService();
  const token = generateToken();
  const schema = await getPublishedFormSchema();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      client_name: input.clientName ?? null,
      client_email: input.clientEmail ?? null,
      access_token: token,
    })
    .select("*")
    .single();

  if (error || !project) throw error ?? new Error("Failed to create project");

  await supabase.from("submissions").insert({
    project_id: project.id,
    form_schema_snapshot: schema,
    answers: {},
    status: "draft",
  });

  return { project: project as ProjectRow, token };
}

export async function getProjectByToken(token: string): Promise<{
  project: ProjectRow;
  submission: SubmissionRow;
} | null> {
  if (useLocalDevStore()) return local.localGetProjectByToken(token);

  const supabase = getService();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (!project) return null;

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("project_id", project.id)
    .maybeSingle();

  if (!submission) return null;

  const normalizedSubmission: SubmissionRow = {
    ...(submission as SubmissionRow),
    form_schema_snapshot: normalizePublishedSchema(
      (submission as SubmissionRow).form_schema_snapshot,
    ),
  };

  return {
    project: project as ProjectRow,
    submission: normalizedSubmission,
  };
}

export async function saveDraftByToken(token: string, answers: FormAnswers): Promise<void> {
  if (useLocalDevStore()) {
    await local.localSaveDraftByToken(token, answers);
    return;
  }

  const bundle = await getProjectByToken(token);
  if (!bundle) throw new Error("Invalid link");
  if (bundle.submission.status === "submitted") throw new Error("Already submitted");

  const supabase = getService();
  await supabase
    .from("submissions")
    .update({ answers, updated_at: new Date().toISOString() })
    .eq("id", bundle.submission.id);
}

export async function submitByToken(token: string, answers: FormAnswers): Promise<void> {
  if (useLocalDevStore()) {
    await local.localSubmitByToken(token, answers);
    return;
  }

  const bundle = await getProjectByToken(token);
  if (!bundle) throw new Error("Invalid link");

  const supabase = getService();
  await supabase
    .from("submissions")
    .update({
      answers,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bundle.submission.id);
}

export async function getSubmissionById(id: string): Promise<{
  project: ProjectRow;
  submission: SubmissionRow;
} | null> {
  if (useLocalDevStore()) return local.localGetSubmissionById(id);

  const supabase = getService();
  const { data: submission } = await supabase.from("submissions").select("*").eq("id", id).maybeSingle();
  if (!submission) return null;

  const { data: project } = await supabase.from("projects").select("*").eq("id", submission.project_id).maybeSingle();
  if (!project) return null;

  return { project: project as ProjectRow, submission: submission as SubmissionRow };
}

export async function listSubmissions(): Promise<Array<SubmissionRow & { project: ProjectRow }>> {
  if (useLocalDevStore()) return local.localListSubmissions();

  const supabase = getService();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, projects(*)")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { projects, ...submission } = row as SubmissionRow & { projects: ProjectRow };
    return { ...submission, project: projects };
  });
}

export async function saveClientUpload(
  projectId: string,
  fieldId: string,
  fileName: string,
  bytes: Buffer,
): Promise<{ path: string; name: string }> {
  if (useLocalDevStore()) {
    return local.localSaveUpload(projectId, fieldId, fileName, bytes);
  }

  const supabase = getService();
  const path = `${projectId}/${fieldId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from("client-uploads").upload(path, bytes, { upsert: false });
  if (error) throw error;
  return { path, name: fileName };
}

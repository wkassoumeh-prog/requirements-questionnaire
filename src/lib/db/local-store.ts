import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { DEFAULT_FORM_SCHEMA, normalizePublishedSchema } from "@/lib/form/templates";
import { DEFAULT_SITE_SETTINGS, type FormAnswers, type FormSchema, type SiteSettings } from "@/lib/form/types";
import { generateToken } from "@/lib/utils";
import type { ProjectRow, SubmissionRow } from "@/lib/db/repository";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

type StoreFile = {
  siteSettings: SiteSettings;
  publishedSchema: FormSchema;
  projects: ProjectRow[];
  submissions: SubmissionRow[];
};

let writeQueue: Promise<void> = Promise.resolve();

async function readStore(): Promise<StoreFile> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return {
      siteSettings: DEFAULT_SITE_SETTINGS,
      publishedSchema: DEFAULT_FORM_SCHEMA,
      projects: [],
      submissions: [],
    };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  writeQueue = writeQueue.then(() => writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8"));
  await writeQueue;
}

function newId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function localEnsureBootstrapData(): Promise<void> {
  const store = await readStore();
  let changed = false;

  if (!store.projects.some((p) => p.is_sample)) {
    const token = generateToken();
    const projectId = newId();
    store.projects.push({
      id: projectId,
      name: "Sample — Riverside Dental (Demo)",
      client_name: "Dr. Anna Keller",
      client_email: "demo@example.com",
      access_token: token,
      status: "active",
      is_sample: true,
      admin_notes: "Demo project for testing the questionnaire flow.",
      created_at: nowIso(),
    });
    store.submissions.push({
      id: newId(),
      project_id: projectId,
      form_schema_snapshot: store.publishedSchema,
      answers: {
        businessName: "Riverside Dental",
        contactName: "Dr. Anna Keller",
        contactEmail: "demo@example.com",
        industry: "healthcare",
        businessDescription: "Modern family dental practice focused on gentle care.",
      },
      status: "draft",
      submitted_at: null,
      updated_at: nowIso(),
    });
    changed = true;
  }

  if (changed) await writeStore(store);
}

export async function localGetPublishedFormSchema(): Promise<FormSchema> {
  const store = await readStore();
  return normalizePublishedSchema(store.publishedSchema);
}

export async function localPublishFormSchema(schema: FormSchema): Promise<void> {
  const store = await readStore();
  store.publishedSchema = schema;
  await writeStore(store);
}

export async function localGetSiteSettings(): Promise<SiteSettings> {
  const store = await readStore();
  return { ...DEFAULT_SITE_SETTINGS, ...store.siteSettings };
}

export async function localUpdateSiteSettings(settings: SiteSettings): Promise<void> {
  const store = await readStore();
  store.siteSettings = settings;
  await writeStore(store);
}

export async function localListProjects(): Promise<ProjectRow[]> {
  const store = await readStore();
  return [...store.projects].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function localCreateProject(input: {
  name: string;
  clientName?: string;
  clientEmail?: string;
}): Promise<{ project: ProjectRow; token: string }> {
  const store = await readStore();
  const token = generateToken();
  const project: ProjectRow = {
    id: newId(),
    name: input.name,
    client_name: input.clientName ?? null,
    client_email: input.clientEmail ?? null,
    access_token: token,
    status: "active",
    is_sample: false,
    admin_notes: null,
    created_at: nowIso(),
  };
  store.projects.push(project);
  store.submissions.push({
    id: newId(),
    project_id: project.id,
    form_schema_snapshot: store.publishedSchema,
    answers: {},
    status: "draft",
    submitted_at: null,
    updated_at: nowIso(),
  });
  await writeStore(store);
  return { project, token };
}

export async function localGetProjectByToken(token: string): Promise<{
  project: ProjectRow;
  submission: SubmissionRow;
} | null> {
  const store = await readStore();
  const project = store.projects.find((p) => p.access_token === token);
  if (!project) return null;
  const submission = store.submissions.find((s) => s.project_id === project.id);
  if (!submission) return null;
  return { project, submission };
}

export async function localSaveDraftByToken(token: string, answers: FormAnswers): Promise<void> {
  const store = await readStore();
  const bundle = await localGetProjectByToken(token);
  if (!bundle) throw new Error("Invalid link");
  if (bundle.submission.status === "submitted") throw new Error("Already submitted");

  const idx = store.submissions.findIndex((s) => s.id === bundle.submission.id);
  store.submissions[idx] = {
    ...store.submissions[idx],
    answers,
    updated_at: nowIso(),
  };
  await writeStore(store);
}

export async function localSubmitByToken(token: string, answers: FormAnswers): Promise<void> {
  const store = await readStore();
  const bundle = await localGetProjectByToken(token);
  if (!bundle) throw new Error("Invalid link");

  const idx = store.submissions.findIndex((s) => s.id === bundle.submission.id);
  store.submissions[idx] = {
    ...store.submissions[idx],
    answers,
    status: "submitted",
    submitted_at: nowIso(),
    updated_at: nowIso(),
  };
  await writeStore(store);
}

export async function localGetSubmissionById(id: string): Promise<{
  project: ProjectRow;
  submission: SubmissionRow;
} | null> {
  const store = await readStore();
  const submission = store.submissions.find((s) => s.id === id);
  if (!submission) return null;
  const project = store.projects.find((p) => p.id === submission.project_id);
  if (!project) return null;
  return { project, submission };
}

export async function localListSubmissions(): Promise<Array<SubmissionRow & { project: ProjectRow }>> {
  const store = await readStore();
  return store.submissions
    .map((submission) => {
      const project = store.projects.find((p) => p.id === submission.project_id);
      if (!project) return null;
      return { ...submission, project };
    })
    .filter((row): row is SubmissionRow & { project: ProjectRow } => row !== null)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function localSaveUpload(
  projectId: string,
  fieldId: string,
  fileName: string,
  bytes: Buffer,
): Promise<{ path: string; name: string }> {
  const uploadsDir = path.join(DATA_DIR, "uploads", projectId, fieldId);
  await mkdir(uploadsDir, { recursive: true });
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const relPath = path.join("uploads", projectId, fieldId, `${Date.now()}-${safeName}`);
  const absPath = path.join(DATA_DIR, relPath);
  await writeFile(absPath, bytes);
  return { path: relPath.replace(/\\/g, "/"), name: fileName };
}

import { FormQuestionnaire } from "@/components/form/FormQuestionnaire";
import { getPublishedFormSchema, getSiteSettings } from "@/lib/db/repository";
import { DEFAULT_SITE_SETTINGS } from "@/lib/form/types";

export const dynamic = "force-dynamic";

export default async function FormPreviewPage() {
  const [schema, settings] = await Promise.all([getPublishedFormSchema(), getSiteSettings()]);

  return (
    <div className="min-h-screen bg-[var(--surface)] px-4 py-10">
      <p className="mb-6 text-center text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-2">
        Preview mode — answers are not saved
      </p>
      <FormQuestionnaire
        token="preview"
        schema={schema}
        initialAnswers={{}}
        settings={settings ?? DEFAULT_SITE_SETTINGS}
        initialStatus="draft"
        projectName="Preview"
        previewMode
      />
    </div>
  );
}

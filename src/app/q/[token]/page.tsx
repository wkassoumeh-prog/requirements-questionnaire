import { notFound } from "next/navigation";
import { FormQuestionnaire } from "@/components/form/FormQuestionnaire";
import { getProjectByToken, getSiteSettings } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function CustomerQuestionnairePage(context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const bundle = await getProjectByToken(token);
  if (!bundle) notFound();

  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--surface)] px-4 py-8 sm:px-6 lg:px-8">
      <FormQuestionnaire
        token={token}
        schema={bundle.submission.form_schema_snapshot}
        initialAnswers={bundle.submission.answers ?? {}}
        settings={settings}
        initialStatus={bundle.submission.status}
        projectName={bundle.project.name}
      />
    </div>
  );
}

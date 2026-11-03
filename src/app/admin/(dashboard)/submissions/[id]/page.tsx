import Link from "next/link";
import { notFound } from "next/navigation";
import { generateBrief } from "@/lib/brief/generate-brief";
import { getSubmissionById } from "@/lib/db/repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bundle = await getSubmissionById(id);
  if (!bundle) notFound();

  const brief = generateBrief(bundle.submission.form_schema_snapshot, bundle.submission.answers, {
    projectName: bundle.project.name,
    clientName: bundle.project.client_name,
    submittedAt: bundle.submission.submitted_at,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{bundle.project.name}</h1>
          <p className="text-secondary">
            {bundle.project.client_name ?? "Client"} · {bundle.submission.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={`/api/export/${bundle.submission.id}?format=md`}>Export Markdown</a>
          </Button>
          <Button asChild variant="outline">
            <a href={`/api/export/${bundle.submission.id}?format=json`}>Export JSON</a>
          </Button>
          <Button asChild variant="outline">
            <a href={`/api/export/${bundle.submission.id}?format=cursor`}>Cursor brief</a>
          </Button>
          <Button asChild>
            <Link href={`/admin/submissions/${id}/print`} target="_blank">
              Printable view
            </Link>
          </Button>
        </div>
      </div>

      {bundle.project.admin_notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Internal notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 whitespace-pre-wrap">{bundle.project.admin_notes}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specification preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">
            {brief.markdown}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

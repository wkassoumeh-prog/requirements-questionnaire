import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/PrintButton";
import { generateBrief } from "@/lib/brief/generate-brief";
import { getSubmissionById } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function PrintSubmissionPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bundle = await getSubmissionById(id);
  if (!bundle) notFound();

  const brief = generateBrief(bundle.submission.form_schema_snapshot, bundle.submission.answers, {
    projectName: bundle.project.name,
    clientName: bundle.project.client_name,
    submittedAt: bundle.submission.submitted_at,
  });

  return (
    <div className="print-document mx-auto max-w-3xl px-8 py-10 text-slate-900">
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none; }
        }
      `}</style>
      <PrintButton />
      <article className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed">
        {brief.markdown}
      </article>
    </div>
  );
}

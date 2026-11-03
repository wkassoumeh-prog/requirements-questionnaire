import { NextResponse } from "next/server";
import { generateBrief } from "@/lib/brief/generate-brief";
import { getSubmissionById } from "@/lib/db/repository";

export async function GET(
  request: Request,
  context: { params: Promise<{ submissionId: string }> },
) {
  const { submissionId } = await context.params;
  const format = new URL(request.url).searchParams.get("format") ?? "md";

  const bundle = await getSubmissionById(submissionId);
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brief = generateBrief(bundle.submission.form_schema_snapshot, bundle.submission.answers, {
    projectName: bundle.project.name,
    clientName: bundle.project.client_name,
    submittedAt: bundle.submission.submitted_at,
  });

  if (format === "json") {
    return NextResponse.json(brief.json);
  }
  if (format === "cursor") {
    return new NextResponse(brief.cursorBrief, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${bundle.project.name}-cursor-brief.md"`,
      },
    });
  }

  return new NextResponse(brief.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${bundle.project.name}-specification.md"`,
    },
  });
}

export const dynamic = "force-dynamic";

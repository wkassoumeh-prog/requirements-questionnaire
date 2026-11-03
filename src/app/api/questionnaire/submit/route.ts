import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_FORM_SCHEMA } from "@/lib/form/templates";
import { getProjectByToken, submitByToken } from "@/lib/db/repository";
import { validateSchema } from "@/lib/form/validation";

const bodySchema = z.object({
  token: z.string().min(16),
  answers: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const bundle = await getProjectByToken(parsed.data.token);
    if (!bundle) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

    const schema = bundle.submission.form_schema_snapshot ?? DEFAULT_FORM_SCHEMA;
    const errors = validateSchema(schema, parsed.data.answers);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
    }

    await submitByToken(parsed.data.token, parsed.data.answers);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";

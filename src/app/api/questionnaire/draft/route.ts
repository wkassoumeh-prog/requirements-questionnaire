import { NextResponse } from "next/server";
import { z } from "zod";
import { saveDraftByToken } from "@/lib/db/repository";

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

    await saveDraftByToken(parsed.data.token, parsed.data.answers);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";

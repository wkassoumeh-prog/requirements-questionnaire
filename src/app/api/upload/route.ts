import { NextResponse } from "next/server";
import { z } from "zod";
import { getProjectByToken, saveClientUpload } from "@/lib/db/repository";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const token = String(form.get("token") ?? "");
    const fieldId = String(form.get("fieldId") ?? "");
    const file = form.get("file");

    z.string().min(16).parse(token);
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const bundle = await getProjectByToken(token);
    if (!bundle) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveClientUpload(bundle.project.id, fieldId, file.name, buffer);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";

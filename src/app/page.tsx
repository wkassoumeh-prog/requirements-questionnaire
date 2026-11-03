import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="surface-page relative min-h-screen overflow-hidden">
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold text-brand">Website requirements & specification engineer</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Turn client conversations into implementation-ready website briefs.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
          Send clients a guided questionnaire, collect content and design preferences in plain language, and export
          structured specifications for Cursor and your build workflow.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/admin">Open admin dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/projects">Create client link</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

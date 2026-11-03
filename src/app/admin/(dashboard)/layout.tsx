import Link from "next/link";
import { signOutAction } from "@/app/admin/actions";
import { LocalDevBanner } from "@/components/admin/LocalDevBanner";
import { Button } from "@/components/ui/button";
import { ensureBootstrapData } from "@/lib/db/repository";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await ensureBootstrapData();

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-subtle)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-brand">Requirements Builder</p>
            <p className="text-xs text-secondary">Admin dashboard</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <Link href="/admin" className="rounded-md px-2 py-1 text-[var(--text-primary)] hover:bg-slate-100">
              Overview
            </Link>
            <Link href="/admin/form-builder" className="rounded-md px-2 py-1 text-[var(--text-primary)] hover:bg-slate-100">
              Form builder
            </Link>
            <Link href="/admin/projects" className="rounded-md px-2 py-1 text-[var(--text-primary)] hover:bg-slate-100">
              Projects
            </Link>
            <Link href="/admin/submissions" className="rounded-md px-2 py-1 text-[var(--text-primary)] hover:bg-slate-100">
              Submissions
            </Link>
            <Link href="/admin/settings" className="rounded-md px-2 py-1 text-[var(--text-primary)] hover:bg-slate-100">
              Settings
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <LocalDevBanner />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

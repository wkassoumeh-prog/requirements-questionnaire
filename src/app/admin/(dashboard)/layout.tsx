import Link from "next/link";
import { LocalDevBanner } from "@/components/admin/LocalDevBanner";
import { ensureBootstrapData } from "@/lib/db/repository";

const nav = [
  { href: "/", label: "Home" },
  { href: "/admin", label: "Overview" },
  { href: "/admin/form-builder", label: "Edit questionnaires" },
  { href: "/admin/projects", label: "Questionnaire links" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await ensureBootstrapData();

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-subtle)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-brand">
            Requirements Builder
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-1 text-[var(--text-primary)] hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <LocalDevBanner />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

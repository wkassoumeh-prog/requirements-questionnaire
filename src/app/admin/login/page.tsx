import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { useLocalDevStore } from "@/lib/supabase/config";

export default function AdminLoginPage() {
  if (useLocalDevStore()) {
    redirect("/admin");
  }

  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--surface)] text-sm text-secondary">Loading…</div>}
    >
      <AdminLoginForm />
    </Suspense>
  );
}

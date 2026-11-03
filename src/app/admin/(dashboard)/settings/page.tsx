import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Branding & settings</h1>
        <p className="text-secondary">Customize the customer-facing questionnaire experience.</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}

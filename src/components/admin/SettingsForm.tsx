"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/lib/form/types";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setMessage(null);
    try {
      await saveSettingsAction(settings);
      setMessage("Settings saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {(
        [
          ["agencyName", "Agency name", "text"],
          ["accentColor", "Accent color (HEX)", "text"],
          ["contactEmail", "Contact email", "email"],
          ["welcomeMessage", "Welcome message", "text"],
          ["formIntroduction", "Form introduction", "textarea"],
          ["confirmationMessage", "Confirmation message", "textarea"],
          ["footerText", "Footer text", "textarea"],
        ] as const
      ).map(([key, label, kind]) => (
        <div key={key}>
          <Label>{label}</Label>
          {kind === "textarea" ? (
            <Textarea
              className="mt-1"
              value={settings[key]}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            />
          ) : (
            <Input
              className="mt-1"
              type={kind}
              value={settings[key]}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            />
          )}
        </div>
      ))}
      <Button type="button" onClick={() => void save()}>
        Save settings
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}

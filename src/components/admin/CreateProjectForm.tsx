"use client";

import { useState } from "react";
import { createProjectAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateProjectForm() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setToken(null);
    const formData = new FormData(event.currentTarget);
    try {
      const newToken = await createProjectAction(formData);
      setToken(newToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create project");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
          <div>
            <Label htmlFor="name">Project name</Label>
            <Input id="name" name="name" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="clientName">Client name</Label>
            <Input id="clientName" name="clientName" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="clientEmail">Client email</Label>
            <Input id="clientEmail" name="clientEmail" type="email" className="mt-1" />
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Create & generate link</Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {token ? (
          <p className="mt-3 break-all text-sm text-slate-700">
            Client link:{" "}
            <a className="text-indigo-600 underline" href={`${origin}/q/${token}`}>
              {origin}/q/{token}
            </a>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

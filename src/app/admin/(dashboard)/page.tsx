import Link from "next/link";
import { listProjects, listSubmissions } from "@/lib/db/repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [projects, submissions] = await Promise.all([listProjects(), listSubmissions()]);
  const submitted = submissions.filter((s) => s.status === "submitted").length;
  const drafts = submissions.filter((s) => s.status === "draft").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Overview</h1>
        <p className="text-secondary">Manage client questionnaires and export website specifications.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects</CardTitle>
            <CardDescription>Active client links</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{projects.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drafts</CardTitle>
            <CardDescription>In progress</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{drafts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submitted</CardTitle>
            <CardDescription>Ready for spec export</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{submitted}</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/projects">Create client project</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/form-builder">Edit questionnaire</Link>
        </Button>
      </div>
    </div>
  );
}

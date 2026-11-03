import { CreateProjectForm } from "@/components/admin/CreateProjectForm";
import { listProjects } from "@/lib/db/repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create a questionnaire link</h1>
        <p className="text-secondary">Each link is private to one client. Share it when the questionnaire is ready.</p>
      </div>

      <CreateProjectForm />

      <div className="space-y-3">
        {projects.map((project) => {
          const link = `${origin}/q/${project.access_token}`;
          return (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {project.name}
                  {project.is_sample ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-900">
                      Sample
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  Client: {project.client_name ?? "—"} · {project.client_email ?? "—"}
                </p>
                <p className="break-all font-mono text-xs text-[var(--text-primary)]">{link}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

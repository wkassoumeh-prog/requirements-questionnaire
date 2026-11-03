import Link from "next/link";
import { listSubmissions } from "@/lib/db/repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const submissions = await listSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Submissions</h1>
        <p className="text-secondary">Review client answers and export specifications.</p>
      </div>

      <div className="space-y-3">
        {submissions.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="text-base">
                <Link href={`/admin/submissions/${s.id}`} className="hover:text-indigo-700">
                  {s.project.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-secondary">
              Status:{" "}
              <span className={s.status === "submitted" ? "text-green-700" : "text-amber-700"}>{s.status}</span>
              {" · "}
              Updated {new Date(s.updated_at).toLocaleString()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

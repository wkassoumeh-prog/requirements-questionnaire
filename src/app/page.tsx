import Link from "next/link";

const choices = [
  {
    href: "/admin/form-builder",
    title: "Edit questionnaires",
    description: "Change sections, questions, and the published form clients will fill in.",
  },
  {
    href: "/admin/projects",
    title: "Create a questionnaire link",
    description: "Make a private link and send it to a client.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="surface-page min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="font-display max-w-xl text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Website requirements
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-secondary">
          Build the questionnaire, then send a client their own link.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {choices.map((choice) => (
            <Link
              key={choice.href}
              href={choice.href}
              className="surface-card group rounded-2xl border p-6 shadow-sm transition-colors hover:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
            >
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-brand">
                {choice.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{choice.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

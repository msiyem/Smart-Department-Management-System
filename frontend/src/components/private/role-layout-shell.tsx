import Link from "next/link";

type RoleLayoutShellProps = {
  role: "student" | "teacher" | "admin";
  title: string;
  description: string;
  children: React.ReactNode;
};

const roleStyles = {
  student: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    panel:
      "from-emerald-50 via-background to-background dark:from-emerald-950/25",
  },
  teacher: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    panel: "from-sky-50 via-background to-background dark:from-sky-950/25",
  },
  admin: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    panel: "from-rose-50 via-background to-background dark:from-rose-950/25",
  },
} as const;

export default function RoleLayoutShell({
  role,
  title,
  description,
  children,
}: RoleLayoutShellProps) {
  const styles = roleStyles[role];

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] bg-gradient-to-br ${styles.panel} px-4 py-6 sm:px-6 lg:px-8`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles.badge}`}
          >
            {role} area
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </div>
        </header>

        <main className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

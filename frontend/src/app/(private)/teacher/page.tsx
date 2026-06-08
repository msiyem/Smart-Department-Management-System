"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileText,
  Loader2,
  Megaphone,
  Users,
} from "lucide-react";

type DashboardData = {
  courses_teaching: number;
  total_assignments: number;
  total_students: number;
  pending_submissions: number;
  today_classes: number;
};

const quickActions = [
  {
    href: "/teacher/courses",
    label: "My Courses",
    description: "Review assigned courses",
    icon: BookOpen,
  },
  {
    href: "/teacher/attendance",
    label: "Attendance",
    description: "Mark daily class attendance",
    icon: CheckSquare,
  },
  {
    href: "/teacher/assignments",
    label: "Assignments",
    description: "Create and manage tasks",
    icon: FileText,
  },
  {
    href: "/teacher/notices",
    label: "Notices",
    description: "Publish course updates",
    icon: Megaphone,
  },
  {
    href: "/teacher/routine",
    label: "Routine",
    description: "View class schedule",
    icon: CalendarDays,
  },
  {
    href: "/teacher/grading",
    label: "Grading",
    description: "Open review workspace",
    icon: ClipboardList,
  },
];

export default function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/teacher`,
          {
            credentials: "include",
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-destructive">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Teacher workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A quick view of your courses, classes, assignments, and review work.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Courses"
          value={data.courses_teaching}
          icon={BookOpen}
        />
        <StatCard
          title="Assignments"
          value={data.total_assignments}
          icon={FileText}
        />
        <StatCard title="Students" value={data.total_students} icon={Users} />
        <StatCard
          title="Pending Review"
          value={data.pending_submissions}
          icon={ClipboardList}
        />
        <StatCard
          title="Today's Classes"
          value={data.today_classes}
          icon={CalendarDays}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="border-b p-5">
            <h2 className="font-semibold">Quick Actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open the tools you use most during the teaching day.
            </p>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border p-4 transition hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <h2 className="font-semibold">Teaching Summary</h2>
          <div className="mt-4 space-y-3">
            <SummaryItem label="Courses assigned" value={data.courses_teaching} />
            <SummaryItem
              label="Assignments created"
              value={data.total_assignments}
            />
            <SummaryItem label="Students enrolled" value={data.total_students} />
            <SummaryItem
              label="Pending submissions"
              value={data.pending_submissions}
            />
            <SummaryItem label="Classes today" value={data.today_classes} />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

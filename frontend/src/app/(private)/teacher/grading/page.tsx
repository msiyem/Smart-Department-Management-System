import Link from "next/link";
import { ArrowRight, ClipboardList, FileCheck, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function TeacherGradingPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm font-medium text-primary">Review workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Grading</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Grade student work from each assignment&apos;s submissions page.
        </p>
      </div>

      <section className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="size-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">
              Open assignment submissions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose an assignment, then use View Submissions to review files,
              enter marks, and add feedback.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/teacher/assignments">
                  Go to Assignments
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/teacher/courses">View Courses</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/40 p-4">
            <div className="space-y-4">
              <Step
                icon={ListChecks}
                title="Select assignment"
                text="Open the assignment that needs review."
              />
              <Step
                icon={FileCheck}
                title="Review submissions"
                text="Open the submissions table and grade each student."
              />
              <Step
                icon={ClipboardList}
                title="Save feedback"
                text="Marks and comments are saved from the grading form."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

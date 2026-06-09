"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Search, UserRound } from "lucide-react";

import { getMyCourses } from "@/action/student.action";
import type { Course } from "@/types";
import { Input } from "@/components/ui/input";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const response = await getMyCourses();
      setCourses(response.data);
      setError(response.success ? "" : response.message || "Failed to load courses");
      setLoading(false);
    };

    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return courses;

    return courses.filter((course) =>
      [course.course_code, course.course_title, course.teachers]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [courses, query]);

  const totalCredits = courses.reduce(
    (sum, course) => sum + Number(course.credit || 0),
    0,
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View all courses you are currently enrolled in.
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search courses..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Courses" value={courses.length} />
        <StatCard label="Total Credits" value={totalCredits} />
        <StatCard
          label="Semesters"
          value={new Set(courses.map((course) => course.semester)).size}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCourses.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="rounded-xl border bg-background p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {course.course_code}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold">
                    {course.course_title}
                  </h2>
                </div>
                <BookOpen className="size-5 text-muted-foreground" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info label="Credit" value={`${course.credit} cr`} />
                <Info label="Semester" value={`Semester ${course.semester}`} />
              </div>

              <div className="mt-5 flex items-start gap-2 border-t pt-4 text-sm text-muted-foreground">
                <UserRound className="mt-0.5 size-4" />
                <span>{course.teachers || "Teacher not assigned"}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No courses found" />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-background p-10 text-center">
      <BookOpen className="mx-auto mb-3 size-10 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Enrolled courses will appear here.
      </p>
    </div>
  );
}

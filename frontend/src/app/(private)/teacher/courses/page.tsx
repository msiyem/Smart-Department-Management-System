"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Loader2,
  Megaphone,
  Search,
} from "lucide-react";

import { serverRequest } from "@/action/server-request.action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ApiResponse, Course } from "@/types";

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState("all");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await serverRequest<ApiResponse<Course[]>>(
          "/courses/teacher/my",
          { method: "GET", auth: true },
        );

        setCourses(response.data || []);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const semesters = useMemo(
    () =>
      Array.from(new Set(courses.map((course) => course.semester)))
        .sort((a, b) => a - b)
        .map(String),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSemester =
        semester === "all" || String(course.semester) === semester;
      const matchesQuery =
        !needle ||
        [course.course_code, course.course_title, course.credit]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));

      return matchesSemester && matchesQuery;
    });
  }, [courses, query, semester]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Teacher workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review your assigned courses and jump into the daily teaching work.
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[1fr_160px] lg:max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search courses..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All semesters</option>
            {semesters.map((item) => (
              <option key={item} value={item}>
                Semester {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Assigned courses" value={courses.length} />
        <Stat
          label="Semesters covered"
          value={new Set(courses.map((course) => course.semester)).size}
        />
        <Stat
          label="Total credits"
          value={courses.reduce(
            (total, course) => total + Number(course.credit || 0),
            0,
          )}
        />
      </div>

      {loading ? (
        <div className="flex justify-center rounded-xl border bg-background py-14">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCourses.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="rounded-xl border bg-background p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {course.course_code}
                    </span>
                    <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      Semester {course.semester}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">
                    {course.course_title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.credit} credit course
                  </p>
                </div>
                <BookOpen className="size-8 text-primary/70" />
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/teacher/attendance">
                    <ClipboardCheck className="size-4" />
                    Attendance
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/teacher/assignments">
                    <FileText className="size-4" />
                    Assignments
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/teacher/notices">
                    <Megaphone className="size-4" />
                    Notice
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background p-12 text-center">
          <BookOpen className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">No courses found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assigned courses will appear here after the admin connects you to a
            course.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

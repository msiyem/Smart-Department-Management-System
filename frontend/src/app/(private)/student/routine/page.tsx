"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2, MapPin, Search } from "lucide-react";

import { getMyCourses, getStudentRoutine } from "@/action/student.action";
import type { Course, RoutineSlot } from "@/types";
import { Input } from "@/components/ui/input";

const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export default function StudentRoutinePage() {
  const [routine, setRoutine] = useState<RoutineSlot[]>([]);
  const [courseIds, setCourseIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("All");

  useEffect(() => {
    const loadRoutine = async () => {
      setLoading(true);
      const [routineRes, coursesRes] = await Promise.all([
        getStudentRoutine(),
        getMyCourses(),
      ]);

      setCourseIds(new Set(coursesRes.data.map((course: Course) => course.id)));
      setRoutine(routineRes.data);
      setError(routineRes.success ? "" : routineRes.message || "Failed to load routine");
      setLoading(false);
    };

    loadRoutine();
  }, []);

  const filteredRoutine = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return routine
      .filter((slot) => courseIds.has(slot.course_id))
      .filter((slot) => selectedDay === "All" || slot.day === selectedDay)
      .filter((slot) => {
        if (!needle) return true;

        return [
          slot.course_code,
          slot.course_title,
          slot.teacher_name,
          slot.room_no,
          slot.day,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      });
  }, [courseIds, query, routine, selectedDay]);

  const slotsByDay = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        slots: filteredRoutine.filter((slot) => slot.day === day),
      })).filter((group) => selectedDay !== "All" || group.slots.length),
    [filteredRoutine, selectedDay],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Class Routine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly schedule for your enrolled courses.
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search routine..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", ...DAYS].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              selectedDay === day
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted/50"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : slotsByDay.length ? (
        <div className="space-y-5">
          {slotsByDay.map((group) => (
            <section
              key={group.day}
              className="rounded-xl border bg-background shadow-sm"
            >
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold">{group.day}</h2>
              </div>
              <div className="divide-y">
                {group.slots.length ? (
                  group.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="grid gap-3 p-5 md:grid-cols-[1.2fr_1fr_0.8fr]"
                    >
                      <div>
                        <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {slot.course_code}
                        </span>
                        <h3 className="mt-2 font-semibold">
                          {slot.course_title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {slot.teacher_name || "Teacher not assigned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>
                          {formatTime(slot.start_time)} -{" "}
                          {formatTime(slot.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4" />
                        <span>{slot.room_no || "Room not assigned"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-sm text-muted-foreground">
                    No classes scheduled.
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <CalendarDays className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">No routine slots found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your enrolled course schedule will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function formatTime(value: string) {
  if (!value) return "-";
  const [hour = "0", minute = "00"] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

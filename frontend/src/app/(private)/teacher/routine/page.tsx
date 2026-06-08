"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2, MapPin, Search } from "lucide-react";

import { getRoutines } from "@/lib/api/routines.api";
import { Input } from "@/components/ui/input";
import type { RoutineSlot } from "@/types";

const days = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export default function TeacherRoutinePage() {
  const [routines, setRoutines] = useState<RoutineSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("all");

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        const response = await getRoutines();
        setRoutines(response.data || []);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load routine");
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, []);

  const filteredRoutines = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return routines.filter((slot) => {
      const matchesDay = day === "all" || slot.day === day;
      const matchesQuery =
        !needle ||
        [
          slot.course_code,
          slot.course_title,
          slot.teacher_name,
          slot.room_no,
          slot.day,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));

      return matchesDay && matchesQuery;
    });
  }, [day, query, routines]);

  const grouped = useMemo(
    () =>
      days.map((item) => ({
        day: item,
        slots: filteredRoutines.filter((slot) => slot.day === item),
      })),
    [filteredRoutines],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Class schedule</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Routine</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            View scheduled class slots, rooms, and course timing.
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[1fr_150px] lg:max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search routine..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select
            value={day}
            onChange={(event) => setDay(event.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All days</option>
            {days.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-xl border bg-background py-14">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRoutines.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {grouped
            .filter((group) => group.slots.length)
            .map((group) => (
              <section
                key={group.day}
                className="rounded-xl border bg-background shadow-sm"
              >
                <div className="flex items-center gap-3 border-b p-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="size-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{group.day}</h2>
                    <p className="text-sm text-muted-foreground">
                      {group.slots.length} class slots
                    </p>
                  </div>
                </div>

                <div className="divide-y">
                  {group.slots.map((slot) => (
                    <article key={slot.id} className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold">
                              {slot.course_code}
                            </span>
                            {slot.room_no && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                <MapPin className="size-3" />
                                {slot.room_no}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 font-semibold">
                            {slot.course_title}
                          </h3>
                          {slot.teacher_name && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {slot.teacher_name}
                            </p>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
                          <Clock className="size-4 text-primary" />
                          {formatTime(slot.start_time)} -{" "}
                          {formatTime(slot.end_time)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background p-12 text-center">
          <CalendarDays className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">No routine slots found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Scheduled classes will appear here after the admin creates routine
            slots.
          </p>
        </div>
      )}
    </div>
  );
}

function formatTime(value: string) {
  return value?.slice(0, 5) || "--:--";
}

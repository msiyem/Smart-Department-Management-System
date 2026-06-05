
"use client";

import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Sparkles,
  Users2,
  Zap,
} from "lucide-react";
import LoginModal from "@/components/auth/login-modal";
import RegisterModal from "@/components/auth/register-modal";
import { useState } from "react";

const highlights = [
  {
    title: "Faculty Management",
    description:
      "Manage faculty profiles, teaching assignments, and academic responsibilities.",
    icon: Users2,
  },
  {
    title: "Academic Administration",
    description:
      "Coordinate courses, schedules, examinations, and departmental notices.",
    icon: CalendarDays,
  },
  {
    title: "Research & Innovation",
    description:
      "Track publications, projects, grants, and research achievements.",
    icon: Layers3,
  },
];

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register" | null>(null);

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-background ">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-12 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

      <section className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-5 py-6 sm:px-8 lg:px-10 lg:py-8 space-y-5">
        {/* Badge */}
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-emerald-500" />
          Academic Excellence & Administration
        </div>

        <div className="mt-5 grid h-full min-h-0 items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          {/* Left Side */}
          <div className="space-y-6 self-center">
            <h1 className="max-w-3xl text-balance text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
              Modern Management Platform for
              <span className="block text-sky-600 dark:text-sky-400">
                Software Engineering Departments
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Streamline academic administration, faculty coordination,
              student management, course planning, research activities,
              and departmental communications through a unified digital
              platform built for higher education institutions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <RegisterModal
                label="Get Started"
                open={mode === "register"}
                onOpenChange={(open) => setMode(open ? "register" : null)}
                switchToLogin={() => setMode("login")}
              />

              <LoginModal
                label="Sign In"
                variant="outline"
                open={mode === "login"}
                onOpenChange={(open) => setMode(open ? "login" : null)}
                switchToRegister={() => setMode("register")}
              />
            </div>

            {/* Stats */}
            <div className="grid max-w-xl grid-cols-3 gap-3 pt-6">
              <div className="rounded-xl border border-border/65 bg-card/80 p-4 backdrop-blur">
                <p className="text-2xl font-bold text-foreground">35+</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Faculty Members
                </p>
              </div>

              <div className="rounded-xl border border-border/65 bg-card/80 p-4 backdrop-blur">
                <p className="text-2xl font-bold text-foreground">850+</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enrolled Students
                </p>
              </div>

              <div className="rounded-xl border border-border/65 bg-card/80 p-4 backdrop-blur">
                <p className="text-2xl font-bold text-foreground">120+</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Research Projects
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Dashboard */}
          <aside className="relative hidden self-center overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl shadow-black/10 backdrop-blur lg:block">
            <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative space-y-4">
              {/* Department Performance */}
              <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Department Performance
                    </p>

                    <p className="mt-1 text-2xl font-bold text-foreground">
                      96% Academic Efficiency
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
                    <Zap className="size-4" />
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-cyan-500" />
                </div>
              </div>

              {/* Academic Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Students
                  </p>

                  <p className="mt-1 text-xl font-bold text-foreground">
                    872 Active
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Current semester enrollment
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Faculty
                  </p>

                  <p className="mt-1 text-xl font-bold text-foreground">
                    38 Members
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Teaching & research staff
                  </p>
                </div>
              </div>

              {/* Meeting Card */}
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Upcoming Academic Meeting
                </p>

                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  Curriculum Review & Research Planning
                </h3>

                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4 text-sky-500" />
                  Monday, 10:00 AM
                </p>
              </div>

              {/* Academic Capabilities */}
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Academic Capabilities
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {highlights.map((feature) => {
                    const Icon = feature.icon;

                    return (
                      <article
                        key={feature.title}
                        className="rounded-xl border border-border/70 bg-card/80 p-3"
                      >
                        <Icon className="mb-2 size-5 text-sky-600 dark:text-sky-400" />

                        <h3 className="text-xs font-semibold leading-tight text-foreground">
                          {feature.title}
                        </h3>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Accreditation */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                <GraduationCap className="size-8 text-emerald-500" />

                <div>
                  <p className="font-medium text-foreground">
                    Accredited Academic Programs
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Supporting excellence in education, research, and innovation.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}


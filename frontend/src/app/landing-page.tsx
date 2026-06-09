"use client";

import { useState } from "react";
import {
  GraduationCap,
  Users2,
  BookOpen,
  CalendarDays,
  FileText,
  CheckCircle2,
  ClipboardList,
  Bell,
  Library,
  Building2,
  Sparkles,
  School,
  Briefcase,
  Database,
  FolderKanban,
  NotebookPen,
  Award,
  ShieldCheck,
  Presentation,
  MonitorSmartphone,
  UserRoundCheck,
  BookMarked,
  Network,
  Cpu,
  Workflow,
} from "lucide-react";

import LoginModal from "@/components/auth/login-modal";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | null>(null);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Grid */}{" "}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Glow Effects */}
      <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute left-0 top-0 h-[350px] w-[350px] rounded-full bg-green-500/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-emerald-400/5 blur-[120px]" />
      {/* Left Side Icons */}
      <GraduationCap className="absolute left-[6%] top-[10%] h-12 w-12 text-emerald-500/25 dark:animate-pulse" />
      <Users2 className="absolute left-[10%] top-[45%] h-10 w-10 text-green-500/20 dark:animate-pulse" />
      <BookOpen className="absolute left-[18%] bottom-[20%] h-9 w-9 text-emerald-500/20 dark:animate-pulse" />
      <Library className="absolute left-[25%] top-[25%] h-8 w-8 text-green-500/15 dark:animate-pulse" />
      <NotebookPen className="absolute left-[32%] bottom-[10%] h-8 w-8 text-emerald-500/15 dark:animate-pulse" />
      <FolderKanban className="absolute left-[15%] bottom-[40%] h-8 w-8 text-green-500/15 dark:animate-pulse" />
      <Award className="absolute left-[38%] top-[15%] h-8 w-8 text-emerald-500/15 dark:animate-pulse" />
      <ClipboardList className="absolute left-[5%] bottom-[30%] h-7 w-7 text-green-500/15 dark:animate-pulse" />
      <Building2 className="absolute left-[8%] top-[83%] h-7 w-7 text-emerald-500/15 dark:animate-pulse" />
      {/* Right Side Icons */}
      <CalendarDays className="absolute right-[8%] top-[15%] h-11 w-11 text-green-500/20 dark:animate-pulse" />
      <FileText className="absolute right-[14%] bottom-[25%] h-10 w-10 text-emerald-500/20 dark:animate-pulse" />
      <CheckCircle2 className="absolute right-[24%] top-[32%] h-8 w-8 text-green-500/15 dark:animate-pulse" />
      <Presentation className="absolute right-[30%] bottom-[12%] h-8 w-8 text-emerald-500/15 dark:animate-pulse" />
      <Database className="absolute right-[35%] top-[12%] h-8 w-8 text-green-500/15 dark:animate-pulse" />
      <ShieldCheck className="absolute right-[20%] bottom-[40%] h-8 w-8 text-emerald-500/15 dark:animate-pulse" />
      <Workflow className="absolute right-[15%] bottom-[11%] h-8 w-8 text-green-500/15 dark:animate-pulse" />
      <Bell className="absolute right-[10%] bottom-[45%] h-7 w-7 text-emerald-500/15 dark:animate-pulse" />
      {/* Center Decorative Icons */}
      <School className="absolute left-[22%] top-[6%] h-7 w-7 text-emerald-500/10 dark:animate-pulse" />
      <Briefcase className="absolute right-[42%] bottom-[18%] h-7 w-7 text-green-500/10 dark:animate-pulse" />
      <Cpu className="absolute left-[46%] bottom-[14%] h-7 w-7 text-emerald-500/10 dark:animate-pulse" />
      <Network className="absolute right-[20%] top-[20%] h-7 w-7 text-green-500/10 dark:animate-pulse" />
      <MonitorSmartphone className="absolute left-[50%] top-[8%] h-7 w-7 text-emerald-500/10 dark:animate-pulse" />
      <UserRoundCheck className="absolute right-[50%] bottom-[10%] h-7 w-7 text-green-500/10 dark:animate-pulse" />
      <BookMarked className="absolute left-[5%] top-[30%] h-7 w-7 text-emerald-500/10 dark:animate-pulse" />

      <Briefcase className="absolute left-[15%] top-[22%] h-7 w-7 text-green-500/10 dark:animate-pulse" />
      <Cpu className="absolute left-[46%] bottom-[14%] h-7 w-7 text-emerald-500/10 dark:animate-pulse" />
      <Network className="absolute right-[25%] top-[8%] h-7 w-7 text-green-500/10 dark:animate-pulse" />
      <MonitorSmartphone className="absolute left-[50%] top-[8%] h-7 w-7 text-emerald-500/10 dark:animate-pulse" />
      {/* Main Content */}
      <GraduationCap className="absolute left-[48%] top-[15%] h-20 w-20 text-emerald-500 " />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 backdrop-blur">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-muted-foreground">
            Department Management System
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          Software Engineering
          <span className="mt-2 block text-emerald-600 dark:text-emerald-400">
            Department Portal
          </span>
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Students • Faculty • Courses • Attendance
        </p>

        <div className="mt-2 flex justify-center">
          
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-5 text-emerald-500">
          <Users2 className="h-5 w-5" />
          <GraduationCap className="h-5 w-5" />
          <BookOpen className="h-5 w-5" />
          <CalendarDays className="h-5 w-5" />
          <FileText className="h-5 w-5" />
          <CheckCircle2 className="h-5 w-5" />
          <Library className="h-5 w-5" />
          <Award className="h-5 w-5" />
        </div>
      </div>
    </main>
  );
}
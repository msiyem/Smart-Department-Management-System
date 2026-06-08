"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Bell,
  Calendar,
  GraduationCap,
  BookMarked,
  PenSquare,
  CheckSquare,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Role = "admin" | "teacher" | "student";

interface User {
  role: Role;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/routines", label: "Routines", icon: Calendar },
    { href: "/admin/notices", label: "Notices", icon: Bell },
    // { href: "/admin/results", label: "Results", icon: BarChart3 },
  ],

  teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/courses", label: "Courses", icon: BookOpen },
    { href: "/teacher/attendance", label: "Attendance", icon: CheckSquare },
    { href: "/teacher/assignments", label: "Assignments", icon: PenSquare },
    { href: "/teacher/grading", label: "Grading", icon: ClipboardList },
    { href: "/teacher/notices", label: "Notices", icon: Bell },
    // { href: "/teacher/results", label: "Results", icon: BarChart3 },
    { href: "/teacher/routine", label: "Routine", icon: Calendar },
  ],

  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "Courses", icon: BookMarked },
    { href: "/student/attendance", label: "Attendance", icon: CheckSquare },
    { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/student/results", label: "Results", icon: GraduationCap },
    { href: "/student/notices", label: "Notices", icon: Bell },
    { href: "/student/routine", label: "Routine", icon: Calendar },
  ],
};

export function Sidebar({
  user,
  collapsed,
  onCollapse,
}: {
  user: User;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const role = user.role;

  const items = NAV[role] ?? [];

  return (
    <motion.aside
      animate={{ width: collapsed ? 70 : 240 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col bg-sidebar border-r border-sidebar-border shadow-sm"
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-3 border-b border-sidebar-border">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>

        {!collapsed && (
          <span className="min-w-0 flex-1 truncate font-semibold text-sm text-sidebar-foreground">
            DeptMS
          </span>
        )}

        <button
          onClick={() => onCollapse(!collapsed)}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Open sidebar" : "Close sidebar"}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2 text-center text-xs text-sidebar-foreground/50">
        {collapsed ? (
          <ChevronRight className="mx-auto h-4 w-4" />
        ) : (
          "Smart Department"
        )}
      </div>
    </motion.aside>
  );
}

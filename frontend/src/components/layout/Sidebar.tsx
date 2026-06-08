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
  ChevronLeft,
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
    { href: "/teacher/attendance", label: "Attendance", icon: CheckSquare },
    { href: "/teacher/assignments", label: "Assignments", icon: PenSquare },
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
      className="h-full flex flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-sidebar-border">
        <GraduationCap className="h-5 w-5 text-primary" />

        {!collapsed && (
          <span className="ml-2 font-semibold text-sm">
            DeptMS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
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

      {/* Collapse Button */}
      <button
        onClick={() => onCollapse(!collapsed)}
        className="border-t border-sidebar-border p-3 flex justify-center hover:bg-sidebar-accent/40"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
          <ChevronLeft className="h-4 w-4" />
        </motion.div>
      </button>
    </motion.aside>
  );
}

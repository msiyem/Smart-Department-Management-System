"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

type AuthUser = {
  id: string;
  role: "student" | "teacher" | "admin";
  full_name?: string;
  email: string;
};

export default function PrivateShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-muted/30 dark:bg-background">
      {/* Pass role-based user to sidebar */}
      <Sidebar
        user={user}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

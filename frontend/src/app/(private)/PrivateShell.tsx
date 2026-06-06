"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function PrivateShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
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
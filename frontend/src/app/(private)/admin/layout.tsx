import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import RoleLayoutShell from "@/components/private/role-layout-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "admin") {
    redirect(`/${user.role}`);
  }

  return (
    <RoleLayoutShell
      role="admin"
      title="Admin Dashboard"
      description="Oversight area for users, notices, academic structure, and system-level administration."
    >
      {children}
    </RoleLayoutShell>
  );
}

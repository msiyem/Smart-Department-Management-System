import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import RoleLayoutShell from "@/components/private/role-layout-shell";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "teacher") {
    redirect(`/${user.role}`);
  }

  return (
    <RoleLayoutShell
      role="teacher"
      title="Teacher Dashboard"
      description="Manage classes, attendance, coursework, and student activity from one place."
    >
      {children}
    </RoleLayoutShell>
  );
}

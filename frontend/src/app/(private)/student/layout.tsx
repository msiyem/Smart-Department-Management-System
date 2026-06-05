import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import RoleLayoutShell from "@/components/private/role-layout-shell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "student") {
    redirect(`/${user.role}`);
  }

  return (
    <RoleLayoutShell
      role="student"
      title="Student Dashboard"
      description="Academic notices, assignments, results, and routine updates for students live here."
    >
      {children}
    </RoleLayoutShell>
  );
}

import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";

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

  return <>{children}</>;
}

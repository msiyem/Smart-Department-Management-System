import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import HomePage from "./landing-page";

export default async function Home() {
  const user = await getUser();

  if (user) {
    if (user.role === "admin") {
      redirect("/admin");
    }

    if (user.role === "teacher") {
      redirect("/teacher");
    }

    if (user.role === "student") {
      redirect("/student");
    }
    return null;
  }

  return <HomePage />;
}
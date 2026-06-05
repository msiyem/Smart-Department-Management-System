import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";

export default async function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getUser();

	if (!user) {
		redirect("/");
	}

	return <>{children}</>;
}

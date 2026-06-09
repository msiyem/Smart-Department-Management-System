// components/shared/navbar.tsx

import { getUser } from "@/lib/auth/getUser";
import NavbarClient from "./navbar-client";
import { getCookie } from "@/lib/cookies";
import { getCurrentProfile } from "@/action/profile.action";

export default async function NavBar() {
  let refreshed = false;
  let user = await getUser();
  const refreshToken = await getCookie("refreshToken");
  const sessionId = await getCookie("sessionId");
  const accessToken = await getCookie("accessToken");
  if (refreshToken && sessionId && !accessToken) {
    refreshed = true;
  }

  if (user) {
    const profile = await getCurrentProfile();
    if (profile.data) {
      user = {
        ...user,
        full_name: profile.data.full_name,
        email: profile.data.email,
        profile_image: profile.data.profile_image,
      };
    }
  }

  return <NavbarClient user={user} refreshed={refreshed} />;
}

import { getCurrentProfile } from "@/action/profile.action";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const profileResult = await getCurrentProfile();
  const profile = profileResult.data;

  if (!profile) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-dashed bg-background p-8 text-center">
          <p className="font-medium">Settings unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profileResult.message || "Unable to load your profile."}
          </p>
        </div>
      </div>
    );
  }

  return <SettingsClient profile={profile} />;
}

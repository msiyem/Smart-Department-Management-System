import Link from "next/link";
import { CalendarDays, GraduationCap, Mail, Settings, UserRound } from "lucide-react";

import { getCurrentProfile } from "@/action/profile.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getInitials(name?: string) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString();
}

export default async function ProfilePage() {
  const profileResult = await getCurrentProfile();
  const profile = profileResult.data;

  if (!profile) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-dashed bg-background p-8 text-center">
          <p className="font-medium">Profile unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profileResult.message || "Unable to load your profile."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Account</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account identity and academic details.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings">
            <Settings className="size-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <section className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 rounded-xl">
            <AvatarImage
              src={profile.profile_image ?? undefined}
              alt={profile.full_name}
              className="rounded-xl"
            />
            <AvatarFallback className="rounded-xl text-xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-semibold">
                {profile.full_name}
              </h2>
              <Badge className="capitalize">{profile.role}</Badge>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              {profile.email}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <h2 className="text-base font-semibold">Account Details</h2>
          <div className="mt-4 divide-y rounded-lg border">
            <ProfileRow label="Status" value={profile.is_active ? "Active" : "Inactive"} />
            <ProfileRow label="Last login" value={formatDate(profile.last_login_at)} />
            <ProfileRow label="Joined" value={formatDate(profile.created_at)} />
          </div>
        </section>

        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <h2 className="text-base font-semibold">Role Details</h2>
          <div className="mt-4 divide-y rounded-lg border">
            {profile.role === "student" ? (
              <>
                <ProfileRow label="Registration" value={profile.registration_no || "-"} />
                <ProfileRow label="Session" value={profile.session || "-"} />
                <ProfileRow label="Semester" value={profile.semester || "-"} />
                <ProfileRow label="CGPA" value={profile.cgpa ?? "-"} />
              </>
            ) : profile.role === "teacher" ? (
              <ProfileRow label="Designation" value={profile.designation || "-"} />
            ) : (
              <ProfileRow label="Access" value="Department administration" />
            )}
          </div>
        </section>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <MiniStat
          icon={UserRound}
          label="Profile source"
          value="Department account"
        />
        <MiniStat
          icon={CalendarDays}
          label="Academic role"
          value={profile.role}
        />
      </section>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold capitalize">{value}</p>
      </div>
    </div>
  );
}

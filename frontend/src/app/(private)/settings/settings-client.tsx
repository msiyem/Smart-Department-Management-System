"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Save, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";

import {
  updateCurrentProfile,
  updateCurrentProfileImage,
} from "@/action/profile.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";

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

export default function SettingsClient({ profile }: { profile: User }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [profileImage, setProfileImage] = useState(profile.profile_image);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [compactMode, setCompactMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [isPending, startTransition] = useTransition();

  const previewUrl = useMemo(() => {
    if (!imageFile) return profileImage;
    return URL.createObjectURL(imageFile);
  }, [imageFile, profileImage]);

  const handleProfileSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("full_name", fullName);

      const response = await updateCurrentProfile(formData);

      if (!response.success) {
        toast.error(response.message || "Failed to update profile");
        return;
      }

      toast.success(response.message || "Profile updated");
      router.refresh();
    });
  };

  const handleImageSave = () => {
    if (!imageFile) {
      toast.error("Please choose an image");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("profile_image", imageFile);

      const response = await updateCurrentProfileImage(formData);

      if (!response.success) {
        toast.error(response.message || "Failed to update image");
        return;
      }

      if (response.data?.profile_image) {
        setProfileImage(response.data.profile_image);
      }
      setImageFile(null);
      toast.success(response.message || "Profile image updated");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your mini-profile and account preferences.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Camera className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Mini Profile Photo</h2>
              <p className="text-sm text-muted-foreground">
                This appears in the navbar.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-4">
            <Avatar className="size-24 rounded-xl">
              <AvatarImage
                src={previewUrl ?? undefined}
                alt={profile.full_name}
                className="rounded-xl"
              />
              <AvatarFallback className="rounded-xl text-2xl">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="w-full space-y-2">
              <Label htmlFor="profile_image">Image</Label>
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] || null)
                }
              />
            </div>

            <Button
              type="button"
              onClick={handleImageSave}
              disabled={isPending || !imageFile}
              className="w-full"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
              Update Photo
            </Button>
          </div>
        </section>

        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Profile Information</h2>
              <p className="text-sm text-muted-foreground">
                Keep your displayed name current.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              onClick={handleProfileSave}
              disabled={isPending || !fullName.trim()}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Changes
            </Button>
          </div>
        </section>
      </div>

      {/* <section className="rounded-xl border bg-background p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Stored for this browser session.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <span>
              <span className="block text-sm font-medium">Compact lists</span>
              <span className="text-xs text-muted-foreground">
                Use denser spacing where supported.
              </span>
            </span>
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(event) => setCompactMode(event.target.checked)}
              className="size-4"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <span>
              <span className="block text-sm font-medium">Email updates</span>
              <span className="text-xs text-muted-foreground">
                Keep academic reminders enabled.
              </span>
            </span>
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(event) => setEmailUpdates(event.target.checked)}
              className="size-4"
            />
          </label>
        </div>
      </section> */}
    </div>
  );
}

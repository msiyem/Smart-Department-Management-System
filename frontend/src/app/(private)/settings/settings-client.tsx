"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, LockKeyhole, Save, UserRound } from "lucide-react";
import { toast } from "sonner";

import {
  changeCurrentPassword,
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handlePasswordSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("current_password", currentPassword);
      formData.append("new_password", newPassword);
      formData.append("confirm_password", confirmPassword);

      const response = await changeCurrentPassword(formData);

      if (!response.success) {
        toast.error(response.message || "Failed to change password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(response.message || "Password changed");
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
       
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

      <section className="rounded-xl border bg-background p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Change Password</h2>
            <p className="text-sm text-muted-foreground">
              You will need to log in again after updating your password.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current password</Label>
            <Input
              id="current_password"
              type="password"
              value={currentPassword}
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              autoComplete="new-password"
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            onClick={handlePasswordSave}
            disabled={
              isPending ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LockKeyhole className="size-4" />
            )}
            Change Password
          </Button>
        </div>
      </section>
    </div>
  );
}

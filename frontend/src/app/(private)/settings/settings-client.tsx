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
import { logout } from "@/action/auth.action";
import { deleteMyAccount } from "@/lib/api/users.api";
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

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function SettingsClient({ profile }: { profile: User }) {
  const router = useRouter();

  // Profile fields
  const [fullName, setFullName]             = useState(profile.full_name);
  const [profileImage, setProfileImage]     = useState(profile.profile_image);
  const [imageFile, setImageFile]           = useState<File | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]          = useState("");
  const [confirmPassword, setConfirmPassword]  = useState("");

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isPending, startTransition] = useTransition();

  const previewUrl = useMemo(() => {
    if (!imageFile) return profileImage;
    return URL.createObjectURL(imageFile);
  }, [imageFile, profileImage]);

  /* ── Handlers ──────────────────────────────────────── */

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

  const handleConfirmDelete = () => {
    startTransition(async () => {
      // 1. Delete the account
      const response = await deleteMyAccount();

      if (!response.success) {
        toast.error(response.message || "Failed to delete account");
        setShowDeleteConfirm(false);
        return;
      }

      // 2. Clear all cookies (accessToken, refreshToken, sessionId)
      try {
        await logout();
      } catch {
        // logout failure is non-critical; account is already deleted
      }

      // 3. Redirect to login
      toast.success("Account deleted. Goodbye!");
      router.push("/");
      router.refresh();
    });
  };

  /* ── Render ────────────────────────────────────────── */

  return (
    <div className="space-y-6 p-6">

      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, photo and security settings.
        </p>
      </div>

      {/* Photo + Profile info row */}
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">

        {/* ── Profile Photo ── */}
        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Camera className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Profile Photo</h2>
              <p className="text-sm text-muted-foreground">
                Upload a new profile picture.
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
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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

        {/* ── Profile Information ── */}
        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Profile Information</h2>
              <p className="text-sm text-muted-foreground">
                Update your display name.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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

      {/* ── Change Password ── */}
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
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              autoComplete="new-password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
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

      {/* ── Delete Account (student & teacher only) ── */}
      {profile.role !== "admin" && (
        <section className="rounded-xl border border-red-100 dark:border-red-900/40 bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500">
              <TrashIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-red-600 dark:text-red-400">
                Delete Account
              </h2>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account and all associated data.
              </p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-4 py-3">
            <svg
              className="size-4 text-red-500 mt-0.5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">
              This action is <strong>irreversible</strong>. Your account,
              profile, enrolled courses, and all data will be permanently
              deleted. You will be logged out immediately.
            </p>
          </div>

          {/* Action row */}
          <div className="mt-4 flex items-center justify-end gap-3">
            {!showDeleteConfirm ? (
              /* Step 1 — initial delete button */
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 hover:border-red-400 dark:hover:border-red-600"
              >
                <TrashIcon className="size-4" />
                Delete My Account
              </Button>
            ) : (
              /* Step 2 — confirmation row */
              <>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mr-1">
                  Are you absolutely sure?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isPending}
                  className="bg-red-500 hover:bg-red-600 focus-visible:ring-red-500 text-white border-none gap-2"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <TrashIcon className="size-4" />
                  )}
                  {isPending ? "Deleting…" : "Yes, Delete Forever"}
                </Button>
              </>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
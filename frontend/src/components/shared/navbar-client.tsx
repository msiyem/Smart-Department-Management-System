"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import deptDark from "../../../public/dept-text-dark.png";
import deptLight from "../../../public/dept-text-light.png";

import { ModeToggle } from "./mode-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ChevronDown, Settings, User } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { refreshSession } from "@/action/session.action";
import { logout } from "@/action/auth.action";

type AuthUser = {
  id: string | number;
  role: "student" | "teacher" | "admin";
  email: string;
  full_name?: string;
  profile_image?: string | null;
  gender?: "male" | "female" | "other";
};

export default function NavbarClient({
  user,
  refreshed,
}: {
  user: AuthUser | null;
  refreshed?: boolean;
}) {
  const router = useRouter();
  const openLogin = useAuthModalStore((state) => state.openLogin);

  React.useEffect(() => {
    if (refreshed) {
      const sessionRefresh = async () => {
        await refreshSession();
      };
      sessionRefresh();
    }
  }, [refreshed]);

  const isLoggedIn = !!user;
  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";


  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-emerald-50/90 dark:bg-emerald-800/70 backdrop-blur-md px-4">
      <div className="flex items-center gap-4 relative">
        <>
          <Image
            onClick={() => router.push("/")}
            src={deptLight}
            alt="Department Management Icon"
            width={120}
            height={50}
            className="h-auto w-auto  cursor-pointer block dark:hidden"
            priority
          />
          <Image
            onClick={() => router.push("/")}
            src={deptDark}
            alt="Department Management Icon"
            width={120}
            height={50}
            className="h-auto w-auto  cursor-pointer hidden dark:block"
            priority
          />
        </>
      </div>

      <div className="relative flex gap-2 items-center">
        <ModeToggle />

        {!isLoggedIn ? (
          <Button variant="default" onClick={openLogin}>
            Login
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* <div className="w-8 h-8 bg-[rgb(69,12,88)] rounded-full flex items-center justify-center cursor-pointer">
                <span className="text-white text-sm font-medium">
                  {getUserInitials()}
                </span>
              </div> */}
              {user?.full_name ? (
                <div
                  title={user.full_name}
                  className="flex h-10 max-w-48 cursor-pointer items-center gap-2 rounded-md border border-ring px-2"
                >
                  <Avatar className="size-7 rounded-md">
                    <AvatarImage
                      src={user.profile_image ?? undefined}
                      alt={user.full_name}
                    />
                    <AvatarFallback className="rounded-md text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold leading-4">
                      {user.full_name}
                    </div>
                    <div className="truncate text-[11px] capitalize text-muted-foreground">
                      {user.role}
                    </div>
                  </div>

                  <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
                </div>
              ) : null}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10 rounded-md">
                    <AvatarImage
                      src={user?.profile_image ?? undefined}
                      alt={user?.full_name || "User"}
                    />
                    <AvatarFallback className="rounded-md">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.full_name || "User"}
                    </p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={async () => await logout()}
                className="text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

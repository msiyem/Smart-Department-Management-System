"use client";

import { useEffect, useState } from "react";
import {
  getUsers,
  toggleUser,
  deleteUser,
} from "@/lib/api/users.api";
import CreateUserModal from "./CreateUserModal";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

type User = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  profile_image?: string;
  is_active: number;
  created_at: string;
};

const roleColor: Record<string, string> = {
  admin: "default",
  teacher: "secondary",
  student: "outline",
};

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString();

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const fetchUsers = async () => {
  setPending(true);

  const res = await getUsers(1); 

  setUsers(res?.data?.users || []);

  setPending(false);
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggle = async (id: number) => {
    await toggleUser(id);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    fetchUsers();
  };

  return (
    <div className="space-y-6 px-16 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">
            {users.length} users registered
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          + Add User
        </Button>
      </div>

      {/* DATA TABLE */}
      <DataTable
        data={users as unknown as Record<string, unknown>[]}
        searchable
        searchKeys={["full_name", "email"]}
        columns={[
          {
            key: "full_name",
            header: "User",
            render: (row) => {
              const u = row as User;

              const initials = u.full_name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={u.profile_image ?? undefined}
                    />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium text-sm">
                      {u.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                </div>
              );
            },
          },

          {
            key: "role",
            header: "Role",
            render: (row) => {
              const u = row as User;

              return (
                <Badge
                  variant={
                    roleColor[u.role] as
                      | "default"
                      | "secondary"
                      | "outline"
                  }
                >
                  {capitalize(u.role)}
                </Badge>
              );
            },
          },

          {
            key: "is_active",
            header: "Status",
            render: (row) => {
              const u = row as User;

              return (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    u.is_active
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      u.is_active
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {u.is_active ? "Active" : "Inactive"}
                </span>
              );
            },
          },

          {
            key: "created_at",
            header: "Joined",
            render: (row) =>
              formatDate((row as User).created_at),
          },

          {
            key: "actions",
            header: "Actions",
            render: (row) => {
              const u = row as User;

              return (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleToggle(u.id)}
                    disabled={pending}
                  >
                    {u.is_active ? (
                      <ToggleRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(u.id)}
                    disabled={pending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            },
          },
        ]}
      />

      {/* MODAL */}
      {open && (
        <CreateUserModal
          onClose={() => setOpen(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
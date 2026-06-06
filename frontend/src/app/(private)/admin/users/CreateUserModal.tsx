"use client";

import { useState } from "react";
import { createUser } from "@/lib/api/users.api";

export default function CreateUserModal({ onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
    registration_no: "",
    session: "",
    semester: "",
    designation: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || ""
      : "";

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createUser(form, token);
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isStudent = form.role === "student";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Card */}
      <div className="w-full max-w-[460px] rounded-[20px] overflow-hidden border border-white/10 bg-[#0f0f14] shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(99,102,241,0.06)] animate-[fadeIn_0.2s_ease]">

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/10 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-md border border-white/10 bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10 flex items-center justify-center"
          >
            ✕
          </button>

          <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-indigo-400 mb-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 shadow-[0_0_8px_#6366f1]" />
            User Management
          </div>

          <h2 className="text-[28px] leading-tight text-[#f1f1f5] font-serif">
            Create <em className="text-indigo-300 italic">new</em> user
          </h2>
        </div>

        {/* Body */}
        <div className="px-8 py-7 flex flex-col gap-4">

          {/* Role Toggle */}
          <div className="grid grid-cols-2 p-1 gap-1 rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => setForm({ ...form, role: "student" })}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
                form.role === "student"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              🎓 Student
            </button>

            <button
              onClick={() => setForm({ ...form, role: "teacher" })}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
                form.role === "teacher"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              🏫 Teacher
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/30">
              Basic Info
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Full Name</label>
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="e.g. John Doe"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Email</label>
            <input
              type="email"
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="name@university.edu"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-xs text-white/50">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Set a strong password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-white/40 hover:text-white/70"
            >
              👁
            </button>
          </div>

          {/* Conditional Fields */}
          {isStudent ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Academic Details
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <input
                className="w-full pl-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                placeholder="Registration No"
                value={form.registration_no}
                onChange={(e) =>
                  setForm({ ...form, registration_no: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  placeholder="Session"
                  value={form.session}
                  onChange={(e) =>
                    setForm({ ...form, session: e.target.value })
                  }
                />

                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  placeholder="Semester"
                  value={form.semester}
                  onChange={(e) =>
                    setForm({ ...form, semester: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Faculty Details
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <input
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                placeholder="Designation"
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-indigo-500 text-white font-semibold shadow-md hover:bg-indigo-600 disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
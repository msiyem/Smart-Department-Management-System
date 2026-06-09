"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Eye, EyeOff, KeyRound, LoaderCircle, Lock, User } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import googleLogo from "../../../public/google-logo.png";
import { LoginUserData, loginUserSchema } from "@/lib/validations/login";

import { login } from "@/action/auth.action";

export default function LoginModal({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginUserData>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginUserSchema),
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [googleSubmitting, setGoogleSubmitting] = React.useState(false);
  const router = useRouter();
  const onsubmit = async (data: LoginUserData) => {
    try {
      const promise = login(data);

      toast.promise(promise, {
        loading: "Logging in...",
        success: "Logged in successfully!",
        error: (err) => err.message || "Failed to log in.",
        richColors: true,
      });

      onOpenChange?.(false);

      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <DialogDescription className="sr-only">user login</DialogDescription>
        <DialogTitle className="sr-only">Login</DialogTitle>
        <Card className="border-none shadow-none">
          {/* Header */}
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-primary rounded-full flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Login to your account</CardDescription>
          </CardHeader>

          {/* Google Button */}
          <CardContent className="space-y-4">
            
            {/* Divider */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onsubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <Label>Email</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label>Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    {...register("password")}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="animate-spin w-4 h-4" />
                    Logging in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

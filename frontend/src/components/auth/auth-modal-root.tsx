"use client";

import LoginModal from "./login-modal";
import { useAuthModalStore } from "@/store/auth-modal-store";

export default function AuthModalRoot() {
  const modal = useAuthModalStore((state) => state.modal);
  const closeModal = useAuthModalStore((state) => state.closeModal);

  return (
    <LoginModal
      open={modal === "login"}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    />
  );
}
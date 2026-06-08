import { create } from "zustand";

type ModalType = "login" | null;

interface AuthModalState {
  modal: ModalType;
  openLogin: () => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  modal: null,
  openLogin: () => set({ modal: "login" }),
  closeModal: () => set({ modal: null }),
}));
import { type Wallet } from "@/types";
import { create } from "zustand";
import { BaseState } from "./transactions";

interface WalletStore extends BaseState {
  wallets: Wallet[];
  fetchWallets: () => Promise<void>;
  addWallet: (w: Omit<Wallet, "id">) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: [],
  isLoading: false,
  isUpdating: false,
  id: null,
  error: null,
  fetchWallets: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({
      wallets: [
        { id: "2", name: "Savings", balance: 8000, isDefault: true },
        { id: "3", name: "Investment", balance: 15000, isDefault: true },
        { id: "4", name: "General", balance: 15000, isDefault: true },
        { id: "5", name: "Cash", balance: 15000 },
        { id: "6", name: "ICICI Jaunpur", balance: 1200 },
        { id: "7", name: "PNB Jaunpur", balance: 100 },
      ],
      isLoading: false,
    });
  },

  addWallet: async (w) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      wallets: [
        ...state.wallets,
        { ...w, id: Math.random().toString(36).substr(2, 9) },
      ],
      isUpdating: false,
    }));
  },

  deleteWallet: async (id) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
      isUpdating: false,
    }));
  },
}));

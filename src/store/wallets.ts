import type { Wallet, WalletType } from "@/types";
import { create } from "zustand";
import { BaseState } from "./transactions";
import { getAllWallets } from "@/actions/wallets";

interface WalletStore extends BaseState {
  wallets: Record<WalletType, Wallet[]>;
  fetchWallets: () => Promise<void>;
  addWallet: (w: Omit<Wallet, "id">) => Promise<void>;
  deleteWallet: (type: WalletType, id: string) => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: {
    DEFAULT: [],
    CUSTOM: [],
  },
  isLoading: false,
  isUpdating: false,
  id: null,
  error: null,
  fetchWallets: async () => {
    try {
      set({ isLoading: true });
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await getAllWallets();

      set({
        wallets: res.data,
        isLoading: false,
      });
    } catch (error) {
      console.log(error);
      set({
        wallets: {
          DEFAULT: [
            {
              id: "1",
              name: "Savings",
              type: "DEFAULT",
              balance: 8000,
              createdAt: new Date(2024, 9, 1),
              updatedAt: new Date(2024, 9, 1),
            },
            {
              id: "2",
              name: "General",
              type: "DEFAULT",
              balance: 15000,
              createdAt: new Date(2024, 9, 1),
              updatedAt: new Date(2024, 9, 1),
            },
          ],

          CUSTOM: [
            {
              id: "3",
              name: "Cash",
              type: "CUSTOM",
              balance: 15000,
              createdAt: new Date(2025, 8, 23),
              updatedAt: new Date(2025, 9, 23),
            },
            {
              id: "4",
              name: "ICICI Jaunpur",
              type: "CUSTOM",
              balance: 1200,
              createdAt: new Date(2025, 3, 17),
              updatedAt: new Date(2025, 7, 22),
            },
            {
              id: "5",
              name: "PNB Jaunpur",
              type: "CUSTOM",
              balance: 100,
              createdAt: new Date(2025, 9, 11),
              updatedAt: new Date(2025, 12, 11),
            },
          ],
        },

        isLoading: false,
      });
    }
  },

  addWallet: async (w) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      wallets: {
        ...state.wallets,
        [w.type]: [
          ...state.wallets[w.type],
          { ...w, id: Math.random().toString(36).substr(2, 9) },
        ],
      },
      isUpdating: false,
    }));
  },

  deleteWallet: async (type, id) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      wallets: {
        ...state.wallets,
        [type]: [...state.wallets[type].filter((w) => w.id !== id)],
      },
      isUpdating: false,
    }));
  },
}));

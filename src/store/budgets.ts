import { UserBudget, type Budget } from "@/types";
import { create } from "zustand";
import { BaseState } from "./transactions";

interface BudgetStore extends BaseState {
  budgets: UserBudget[];
  fetchBudgets: () => Promise<void>;
  addBudget: (b: Partial<Budget>) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  budgets: [],
  isLoading: false,
  isUpdating: false,
  id: null,
  error: null,
  fetchBudgets: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({
      budgets: [
        {
          id: "1",
          spent: 120,
          group: "FOOD_AND_DRINKS",
          category: "Restaurant",
          limit: 800,
          userID: " 1",
          createdAt: new Date(2025, 8, 12),
          updatedAt: new Date(2026, 0, 12),
        },
        {
          id: "2",
          group: "TRANSPORTATION",
          category: "Public_Transport",
          spent: 120,
          limit: 200,
          userID: "1",
          createdAt: new Date(2025, 8, 12),
          updatedAt: new Date(2026, 0, 12),
        },
        {
          id: "3",
          category: "Clothes",
          group: "SHOPPING",
          spent: 120,
          limit: 150,
          userID: "1",
          createdAt: new Date(2025, 8, 12),
          updatedAt: new Date(2026, 0, 12),
        },
      ],
      isLoading: false,
    });
  },
  addBudget: async (b) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    // set((state) => ({
    //   budgets: [
    //     ...state.budgets,
    //     { ...b, id: Math.random().toString(36).substr(2, 9), spent: 0 },
    //   ],
    //   isUpdating: false,
    // }));
  },
  updateBudget: async (id, b) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      budgets: state.budgets.map((item) =>
        item.id === id ? { ...item, ...b } : item,
      ),
      isUpdating: false,
    }));
  },
  deleteBudget: async (id) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
      isUpdating: false,
    }));
  },
}));

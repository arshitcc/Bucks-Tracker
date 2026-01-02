import { type Budget } from "@/types";
import { create } from "zustand";
import { BaseState } from "./transactions";

interface BudgetStore extends BaseState {
  budgets: Budget[];
  fetchBudgets: () => Promise<void>;
  addBudget: (b: Omit<Budget, "id" | "spent">) => Promise<void>;
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
        { id: "1", category: "Food & Dining", spent: 450, limit: 800 },
        { id: "2", category: "Transportation", spent: 120, limit: 200 },
        { id: "3", category: "Entertainment", spent: 80, limit: 150 },
      ],
      isLoading: false,
    });
  },
  addBudget: async (b) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      budgets: [
        ...state.budgets,
        { ...b, id: Math.random().toString(36).substr(2, 9), spent: 0 },
      ],
      isUpdating: false,
    }));
  },
  updateBudget: async (id, b) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      budgets: state.budgets.map((item) =>
        item.id === id ? { ...item, ...b } : item
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

import { type Transaction } from "@/types";
import { create } from "zustand";

export interface BaseState {
  isLoading: boolean;
  isUpdating: boolean;
  id: string | null;
  error: string | null;
}

interface TransactionStore extends BaseState {
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;
  addTransaction: (
    t: Omit<Transaction, "id" | "currentBalance" | "dateTime">
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  isUpdating: false,
  id: null,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const sampleTransactions: Transaction[] = [
      {
        id: "1",
        type: "Expense",
        category: "Groceries",
        amount: 50.25,
        walletName: "Main Wallet",
        currentBalance: 12450.0,
        dateTime: "2023-12-28 10:30",
        description: "Weekly grocery shopping at Whole Foods.",
      },
      {
        id: "2",
        type: "Income",
        category: "Business_Trips",
        amount: 1200.0,
        walletName: "Main Wallet",
        currentBalance: 13650.0,
        dateTime: "2023-12-27 15:45",
        description: "Bonus payment for Q4.",
      },
      {
        id: "3",
        type: "Expense",
        category: "Rent",
        amount: 1500.0,
        walletName: "Main Wallet",
        currentBalance: 12150.0,
        dateTime: "2023-12-01 09:00",
        description: "Monthly apartment rent.",
      },
    ];
    set({ transactions: sampleTransactions, isLoading: false });
  },

  addTransaction: async (t) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      currentBalance: 0, // Simplified for mock
      dateTime: new Date().toISOString(),
    };
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
      isUpdating: false,
    }));
  },
  deleteTransaction: async (id) => {
    set({ isUpdating: true, id });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      isUpdating: false,
    }));
  },
}));

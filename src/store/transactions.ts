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
    t: Omit<Transaction, "id" | "currentBalance" | "dateTime">,
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
        type: "EXPENSE",
        category: "Groceries",
        amount: 50.25,
        walletID: "1",
        createdAt: new Date(2023, 11, 27, 15, 45),
        userID: "1",
        group: "EDUCATION",
        receipts: [],
        isRecurring: false,
        updatedAt: new Date(2023, 11, 27, 15, 45),
        description: "Weekly grocery shopping at Whole Foods.",
      },
      {
        id: "2",
        type: "INCOME",
        category: "Business_Trips",
        amount: 1200.0,
        walletID: "2",
        createdAt: new Date(2023, 11, 27, 15, 45),
        userID: "1",
        group: "INVESTMENTS",
        receipts: [],
        isRecurring: true,
        updatedAt: new Date(2023, 11, 27, 15, 45),
        description: "Bonus payment for Q4.",
      },
      {
        id: "3",
        type: "EXPENSE",
        category: "Rent",
        amount: 1500.0,
        walletID: "2",
        createdAt: new Date(2023, 12, 1, 9, 0),
        userID: "1",
        group: "INVESTMENTS",
        receipts: [],
        isRecurring: true,
        updatedAt: new Date(2023, 12, 1, 9, 0),
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

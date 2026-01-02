import { type OverviewData } from "@/types";
import { create } from "zustand";
import { BaseState } from "./transactions";

interface OverviewStore extends BaseState {
  data: OverviewData | null;
  fetchOverviewData: () => Promise<void>;
}

export const useOverviewStore = create<OverviewStore>((set) => ({
  data: null,
  isLoading: false,
  isUpdating: false,
  id: null,
  error: null,
  fetchOverviewData: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({
      data: {
        spendAnalytics: {
          daily: [
            { date: "Mon", amount: 120 },
            { date: "Tue", amount: 250 },
            { date: "Wed", amount: 180 },
            { date: "Thu", amount: 320 },
            { date: "Fri", amount: 280 },
            { date: "Sat", amount: 420 },
            { date: "Sun", amount: 190 },
          ],
          weekly: [
            { week: "Week 1", amount: 1200 },
            { week: "Week 2", amount: 1450 },
            { week: "Week 3", amount: 980 },
            { week: "Week 4", amount: 1680 },
          ],
          monthly: [
            { month: "Jan", amount: 3200 },
            { month: "Feb", amount: 2800 },
            { month: "Mar", amount: 3600 },
            { month: "Apr", amount: 3100 },
            { month: "May", amount: 3400 },
            { month: "Jun", amount: 2950 },
          ],
          yearly: [
            { year: "2021", amount: 32000 },
            { year: "2022", amount: 38000 },
            { year: "2023", amount: 41000 },
            { year: "2024", amount: 45000 },
          ],
        },
        categorySpends: [
          { category: "Groceries", amount: 850, fill: "var(--chart-1)" },
          { category: "Restaurant", amount: 640, fill: "var(--chart-2)" },
          {
            category: "Transportation",
            amount: 520,
            fill: "var(--chart-3)",
          },
          { category: "Utilities", amount: 380, fill: "var(--chart-4)" },
          {
            category: "Entertainment",
            amount: 290,
            fill: "var(--chart-5)",
          },
          {
            category: "Others",
            amount: 560,
            fill: "var(--muted-foreground)",
          },
        ],
      },
      isLoading: false,
    });
  },
}));

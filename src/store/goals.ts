import { type Goal } from "@/types";
import { create } from "zustand";
import { BaseState } from "./transactions";

interface GoalStore extends BaseState {
  goals: Goal[];
  fetchGoals: () => Promise<void>;
  addGoal: (
    g: Omit<Goal, "id" | "currentSaved" | "completed">
  ) => Promise<void>;
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  isLoading: false,
  isUpdating: false,
  id: null,
  error: null,
  
  fetchGoals: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    set({
      goals: [
        {
          id: "1",
          name: "Emergency Fund",
          deadline: "2024-12-31",
          currentSaved: 5000,
          targetAmount: 5000,
          completed: true,
        },
        {
          id: "2",
          name: "Vacation to Japan",
          deadline: "2025-06-30",
          currentSaved: 1200,
          targetAmount: 4000,
          completed: false,
        },
        {
          id: "3",
          name: "New Laptop",
          deadline: "2024-09-15",
          currentSaved: 800,
          targetAmount: 1500,
          completed: false,
        },
      ],
      isLoading: false,
    });
  },
  addGoal: async (g) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      goals: [
        ...state.goals,
        {
          ...g,
          id: Math.random().toString(36).substr(2, 9),
          currentSaved: 0,
          completed: false,
        },
      ],
      isUpdating: false,
    }));
  },
  updateGoal: async (id, g) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      goals: state.goals.map((item) =>
        item.id === id ? { ...item, ...g } : item
      ),
      isUpdating: false,
    }));
  },
  deleteGoal: async (id) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
      isUpdating: false,
    }));
  },
}));

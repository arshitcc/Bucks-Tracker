import { type Goal } from "@/types";
import { create } from "zustand";
import { BaseState } from "./transactions";
import {
  contributeToGoal,
  createGoal,
  getGoals,
  updateExistingGoal,
  withdrawFromGoal,
} from "@/actions/goals";
import {
  ContributeToGoalForm,
  NewGoalForm,
  WithdrawFromGoalForm,
} from "@/schemas/goals";

interface GoalStore extends BaseState {
  goals: Goal[];
  fetchGoals: () => Promise<void>;
  addGoal: (g: NewGoalForm) => Promise<void>;
  updateGoal: (id: string, g: NewGoalForm) => Promise<void>;
  contributeToGoal: (id: string, g: ContributeToGoalForm) => Promise<void>;
  withdrawFromGoal: (id: string, g: WithdrawFromGoalForm) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  isLoading: false,
  isUpdating: false,
  id: null,
  error: null,

  fetchGoals: async () => {
    try {
      set({ isLoading: true });
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await getGoals();
      if (res.success) {
        set({
          goals: res.data as Goal[],
          isLoading: false,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      set({ isLoading: false });
    }
  },
  addGoal: async (g) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await createGoal(g);
      if (res.success) {
        set((state) => ({
          goals: [...state.goals, res.data],
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },
  updateGoal: async (id, goal) => {
    try {
      set({ isUpdating: true, id: id });
      // await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await updateExistingGoal(id, goal);
      if (res.success && res.data?.updatedGoal) {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? res.data?.updatedGoal : g,
          ),
          isUpdating: false,
          id: null,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  },
  contributeToGoal: async (id, g) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      goals: state.goals.map((item) =>
        item.id === id ? { ...item, ...g } : item,
      ),
      isUpdating: false,
    }));
  },
  withdrawFromGoal: async (id, g) => {
    set({ isUpdating: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      goals: state.goals.map((item) =>
        item.id === id ? { ...item, ...g } : item,
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

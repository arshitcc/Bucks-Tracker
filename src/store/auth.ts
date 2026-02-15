import { User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BaseState } from "./transactions";

interface UserStore extends BaseState {
  user: User | null;

  fetchProfile: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isUpdating: false,
      error: null,
      id: null,

      fetchProfile: async () => {


        try {
            const res = await get
        } catch (error) {
            
        }


      },
    }),
    { name: "x-auth" },
  ),
);

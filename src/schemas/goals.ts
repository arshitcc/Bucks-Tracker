import z from "zod/v4";

const newGoalSchema = z.object({
  name: z
    .string({ error: "Goal name is required" })
    .trim()
    .min(1, { error: "Enter Goal name" }),

  targetAmount: z
    .string({ error: "Target amount is required" })
    .trim()
    .refine(
      (v) => {
        return !isNaN(Number(v)) && Number(v) > 0;
      },
      { error: "Target must be a positive number" },
    ),

  deadline: z
    .date({ error: "Deadline is required" })
    .min(new Date(), { error: "Deadline must be in the future" }),
});

const updateGoalSchema = newGoalSchema.extend({
  goalID: z
    .string({ error: "Goal id is required" })
    .min(12, { error: "Select a valid goal" }),
});

const contributeToGoalSchema = z.object({
  amount: z
    .string({ error: "Target amount is required" })
    .trim()
    .refine(
      (v) => {
        return !isNaN(Number(v)) && Number(v) > 0;
      },
      { error: "Contribution must be a positive amount" },
    ),

  walletID: z
    .string({ error: "Choose from which wallet to contribute" })
    .trim()
    .min(12, { error: "Select a valid wallet" }),

  goalID: z
    .string({ error: "Select a goal" })
    .trim()
    .min(12, { error: "Select a valid goal" }),
});

const withdrawFromGoalSchema = z.object({
  amount: z
    .string({ error: "Target amount is required" })
    .trim()
    .refine(
      (v) => {
        return !isNaN(Number(v)) && Number(v) > 0;
      },
      { error: "Withdrawal must be a positive amount" },
    ),

  goalID: z
    .string({ error: "Select a goal" })
    .trim()
    .min(12, { error: "Select a valid goal" }),

  walletID: z
    .string({ error: "Choose from which wallet to withdraw" })
    .trim()
    .min(12, { error: "Select a valid wallet" }),
});

export type NewGoalForm = z.infer<typeof newGoalSchema>;
export type UpdateGoalForm = z.infer<typeof updateGoalSchema>;
export type ContributeToGoalForm = z.infer<typeof contributeToGoalSchema>;
export type WithdrawFromGoalForm = z.infer<typeof withdrawFromGoalSchema>;

export { newGoalSchema, contributeToGoalSchema, withdrawFromGoalSchema };

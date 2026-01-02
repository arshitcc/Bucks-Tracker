import z from "zod/v4";

const newBudgetSchema = z.object({
  category: z
    .string({ error: "Category is required" })
    .min(1, { error: "Enter a category" }),
  limit: z
    .string({ error: "Limit is required" })
    .min(1, { error: "Enter a valid budget limit" })
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      error: "Enter a valid budget limit",
    }),
});

export type BudgetFormValues = z.infer<typeof newBudgetSchema>;

export { newBudgetSchema };

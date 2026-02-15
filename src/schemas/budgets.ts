import z from "zod/v4";

export const expenseCategoryEnum = z.enum([
  "Bar",
  "Cafe",
  "Groceries",
  "Restaurant",
  "Fast_Food",
  "Clothes",
  "Shoes",
  "Electronics",
  "Gifts",
  "Stationary",
  "Tools",
  "Books",
  "Rent",
  "Energy",
  "Utilities",
  "Maintainance",
  "Business_Trips",
  "Public_Transport",
  "Taxi",
  "Fuel",
  "Leasing",
  "Rental",
  "Vehicle_Insurance",
  "Vehicle_Maintenance",
]);

export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;

const newBudgetSchema = z.object({
  category: expenseCategoryEnum,
  limit: z
    .string({ error: "Limit is required" })
    .min(1, { error: "Enter a valid budget limit" })
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      error: "Enter a valid budget limit",
    }),
});

export type BudgetFormValues = z.infer<typeof newBudgetSchema>;

export { newBudgetSchema };

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import type { ExpenseGroup, ExpenseCategory } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function createBudget(data: {
  group: ExpenseGroup;
  category: ExpenseCategory;
  limit: number;
}) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { error: "Account not found" };

    const budget = await db.budget.create({
      data: {
        userID: user.id,
        group: data.group,
        category: data.category,
        limit: data.limit,
      },
    });

    revalidatePath("/dashboard/budgets");
    return { success: true, budget };
  } catch (error) {
    console.error("Error creating budget:", error);
    return { error: "Failed to create budget" };
  }
}

export async function updateBudget(
  id: string,
  data: { group?: ExpenseGroup; category?: ExpenseCategory; limit?: number },
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { error: "Account not found" };

    const budget = await db.budget.update({
      where: { id, userID: user.id },
      data,
    });

    revalidatePath("/dashboard/budgets");
    return { success: true, budget };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { error: "Failed to update budget" };
  }
}

export async function deleteBudget(id: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { error: "Account not found" };

    await db.budget.delete({ where: { id, userID: user.id } });

    revalidatePath("/dashboard/budgets");
    return { success: true };
  } catch (error) {
    console.error("Error deleting budget:", error);
    return { error: "Failed to delete budget" };
  }
}

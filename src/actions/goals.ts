"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  GoalTransactionType,
  GoalStatus,
  WalletType,
} from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { ContributeToGoalForm, NewGoalForm } from "@/schemas/goals";

export async function createGoal(data: NewGoalForm) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { error: "Account not found" };

    const goal = await db.goal.create({
      data: {
        userID: user.id,
        name: data.name,
        targetAmount: Number(data.targetAmount),
        deadline: data.deadline,
      },
    });

    revalidatePath("/dashboard/goals");
    return { success: true, data: goal };
  } catch (error) {
    console.error("[v0] Error creating goal:", error);
    return { error: "Failed to create goal" };
  }
}

export async function getGoals() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return {
      success: false,
      error: "Session expired. Please login again",
      data: [],
    };
  }

  const user = await db.user.findUnique({
    where: { clerkUserID: userId },
  });

  if (!user) {
    return {
      success: false,
      error: "Account not found",
      data: [],
    };
  }

  const goals = await db.goal.findMany();

  return {
    success: true,
    error: null,
    data: goals,
  };
}

export async function contributeToGoal(data: ContributeToGoalForm) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { error: "Account not found" };

    const txnAmount = Number(data.amount) || 0;

    const result = await db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: data.walletID, userID: user.id },
      });
      if (!wallet || wallet.balance < txnAmount)
        throw new Error("Insufficient funds in wallet");

      const goal = await tx.goal.findUnique({
        where: { id: data.goalID, userID: user.id },
      });
      if (!goal) throw new Error("Goal not found");

      const goalTransaction = await tx.goalTransaction.create({
        data: {
          goalID: data.goalID,
          walletID: data.walletID,
          type: GoalTransactionType.DEPOSIT,
          amount: txnAmount,
        },
      });

      const updatedGoal = await tx.goal.update({
        where: { id: data.goalID },
        data: {
          savedAmount: { increment: txnAmount },
          status:
            goal.savedAmount + txnAmount >= goal.targetAmount
              ? GoalStatus.COMPLETED
              : GoalStatus.IN_PROGRESS,
        },
      });

      await tx.wallet.update({
        where: { id: data.walletID },
        data: { balance: { decrement: txnAmount } },
      });

      return { goalTransaction, updatedGoal };
    });

    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard/wallets");
    return { success: true, ...result };
  } catch (error: any) {
    console.error("[v0] Error contributing to goal:", error);
    return { error: error.message || "Failed to contribute to goal" };
  }
}

export async function withdrawFromGoal(data: {
  goalID: string;
  walletID: string;
  amount: number;
}) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { error: "Account not found" };

    const result = await db.$transaction(async (tx) => {
      const goal = await tx.goal.findUnique({
        where: { id: data.goalID, userID: user.id },
      });
      if (!goal || goal.savedAmount < data.amount)
        throw new Error("Insufficient funds in goal");

      const goalTransaction = await tx.goalTransaction.create({
        data: {
          goalID: data.goalID,
          walletID: data.walletID,
          type: GoalTransactionType.WITHDRAW,
          amount: data.amount,
        },
      });

      const updatedGoal = await tx.goal.update({
        where: { id: data.goalID },
        data: {
          savedAmount: { decrement: data.amount },
          status:
            goal.savedAmount - data.amount >= goal.targetAmount
              ? GoalStatus.COMPLETED
              : GoalStatus.IN_PROGRESS,
        },
      });

      await tx.wallet.update({
        where: { id: data.walletID },
        data: { balance: { increment: data.amount } },
      });

      return { goalTransaction, updatedGoal };
    });

    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard/wallets");
    return { success: true, ...result };
  } catch (error: any) {
    console.error("[v0] Error withdrawing from goal:", error);
    return { error: error.message || "Failed to withdraw from goal" };
  }
}

export async function updateExistingGoal(id: string, data: NewGoalForm) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { success: false, error: "Account not found" };

    const goal = await db.goal.findUnique({ where: { id, userID: user.id } });
    if (!goal) return { success: false, error: "Goal not found" };

    const result = await db.$transaction(async (tx) => {
      let excessTransfer = null;

      const targetAmount = Number(data.targetAmount) || 0;

      if (data.targetAmount !== undefined && targetAmount < goal.savedAmount) {
        const excessAmount = goal.savedAmount - targetAmount;

        const defaultWallet = await tx.wallet.findFirst({
          where: { userID: user.id, type: WalletType.DEFAULT },
        });

        if (!defaultWallet)
          throw new Error("Default wallet not found for excess transfer");

        await tx.goalTransaction.create({
          data: {
            goalID: id,
            walletID: defaultWallet.id,
            type: GoalTransactionType.WITHDRAW,
            amount: excessAmount,
          },
        });

        await tx.wallet.update({
          where: { id: defaultWallet.id },
          data: { balance: { increment: excessAmount } },
        });

        excessTransfer = { amount: excessAmount, walletID: defaultWallet.id };
      }

      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          ...data,
          targetAmount: targetAmount,
          savedAmount:
            targetAmount !== undefined && targetAmount < goal.savedAmount
              ? targetAmount
              : undefined,
          status:
            (targetAmount ?? goal.targetAmount) <=
            (targetAmount !== undefined && targetAmount < goal.savedAmount
              ? targetAmount
              : goal.savedAmount)
              ? GoalStatus.COMPLETED
              : GoalStatus.IN_PROGRESS,
        },
      });

      return { updatedGoal, excessTransfer };
    });

    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard/wallets");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[v0] Error updating goal:", error);
    return { error: error.message || "Failed to update goal" };
  }
}

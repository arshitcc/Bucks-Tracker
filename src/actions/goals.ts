"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  GoalTransactionType,
  GoalStatus,
  WalletType,
} from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function createGoal(data: {
  name: string;
  targetAmount: number;
  deadline: Date;
}) {
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
        targetAmount: data.targetAmount,
        deadline: data.deadline,
      },
    });

    revalidatePath("/dashboard/goals");
    return { success: true, goal };
  } catch (error) {
    console.error("[v0] Error creating goal:", error);
    return { error: "Failed to create goal" };
  }
}

export async function contributeToGoal(data: {
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
      const wallet = await tx.wallet.findUnique({
        where: { id: data.walletID, userID: user.id },
      });
      if (!wallet || wallet.balance < data.amount)
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
          amount: data.amount,
        },
      });

      const updatedGoal = await tx.goal.update({
        where: { id: data.goalID },
        data: {
          currentAmount: { increment: data.amount },
          status:
            goal.currentAmount + data.amount >= goal.targetAmount
              ? GoalStatus.COMPLETED
              : GoalStatus.IN_PROGRESS,
        },
      });

      await tx.wallet.update({
        where: { id: data.walletID },
        data: { balance: { decrement: data.amount } },
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
      if (!goal || goal.currentAmount < data.amount)
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
          currentAmount: { decrement: data.amount },
          status:
            goal.currentAmount - data.amount >= goal.targetAmount
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

export async function updateGoal(
  id: string,
  data: { name?: string; targetAmount?: number; deadline?: Date }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { error: "Account not found" };

    const goal = await db.goal.findUnique({ where: { id, userID: user.id } });
    if (!goal) return { error: "Goal not found" };

    const result = await db.$transaction(async (tx) => {
      let excessTransfer = null;

      if (
        data.targetAmount !== undefined &&
        data.targetAmount < goal.currentAmount
      ) {
        const excessAmount = goal.currentAmount - data.targetAmount;

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
          currentAmount:
            data.targetAmount !== undefined &&
            data.targetAmount < goal.currentAmount
              ? data.targetAmount
              : undefined,
          status:
            (data.targetAmount ?? goal.targetAmount) <=
            (data.targetAmount !== undefined &&
            data.targetAmount < goal.currentAmount
              ? data.targetAmount
              : goal.currentAmount)
              ? GoalStatus.COMPLETED
              : GoalStatus.IN_PROGRESS,
        },
      });

      return { updatedGoal, excessTransfer };
    });

    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard/wallets");
    return { success: true, ...result };
  } catch (error: any) {
    console.error("[v0] Error updating goal:", error);
    return { error: error.message || "Failed to update goal" };
  }
}

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  GoalTransactionType,
  GoalStatus,
  WalletType,
} from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import {
  ContributeToGoalForm,
  NewGoalForm,
  WithdrawFromGoalForm,
} from "@/schemas/goals";

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
    console.error("Error creating goal:", error);
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

export async function contributeAmountToGoal(data: ContributeToGoalForm) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { success: false, error: "Account not found" };

    const txnAmount = Number(data.amount) || 0;

    const result = await db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: data.walletID, userID: user.id },
      });
      if (!wallet || wallet.balance < txnAmount) {
        return {
          success: false,
          error: "Insufficient funds in wallet",
        };
      }

      const goal = await tx.goal.findUnique({
        where: { id: data.goalID, userID: user.id },
      });
      if (!goal) {
        return {
          success: false,
          error: "Goal not found",
        };
      }

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
    return { success: true, data: { ...result } };
  } catch (error: any) {
    console.error("Error contributing to goal:", error);
    return { error: error.message || "Failed to contribute to goal" };
  }
}

export async function withdrawAmountFromGoal(data: WithdrawFromGoalForm) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) return { success: false, error: "Account not found" };

    const txnAmount = Number(data.amount) || 0;

    const result = await db.$transaction(async (tx) => {
      const goal = await tx.goal.findUnique({
        where: { id: data.goalID, userID: user.id },
      });
      if (!goal || goal.savedAmount < txnAmount) {
        return {
          success: false,
          error: "Insufficient funds in goal",
        };
      }

      const goalTransaction = await tx.goalTransaction.create({
        data: {
          goalID: data.goalID,
          walletID: data.walletID,
          type: GoalTransactionType.WITHDRAW,
          amount: txnAmount,
        },
      });

      const updatedGoal = await tx.goal.update({
        where: { id: data.goalID },
        data: {
          savedAmount: { decrement: txnAmount },
          status:
            goal.savedAmount - txnAmount >= goal.targetAmount
              ? GoalStatus.COMPLETED
              : GoalStatus.IN_PROGRESS,
        },
      });

      await tx.wallet.update({
        where: { id: data.walletID },
        data: { balance: { increment: txnAmount } },
      });

      return { goalTransaction, updatedGoal };
    });

    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard/wallets");
    return { success: true, data: { ...result } };
  } catch (error: any) {
    console.error("Error withdrawing from goal:", error);
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
    console.error("Error updating goal:", error);
    return { error: error.message || "Failed to update goal" };
  }
}

export async function deleteExistingGoal(id: string, walletID: string) {
  try {
    await db.$transaction(async (tx) => {
      const goal = await tx.goal.findUnique({
        where: { id },
      });

      if (!goal) {
        return {
          success: false,
          error: "Goal not found",
        };
      }

      const amountToReturn = goal.savedAmount;

      await tx.wallet.update({
        where: { id: walletID },
        data: {
          balance: {
            increment: amountToReturn,
          },
        },
      });

      await tx.transaction.create({
        data: {
          walletID,
          userID: goal.userID,
          type: "INCOME",
          group: "INVESTMENTS",
          category: "GOAL_REFUND",
          amount: amountToReturn,
          description: `Goal refund: ${goal.name}`,
        },
      });

      await tx.goal.delete({
        where: { id },
      });
    });

    revalidatePath("/dashboard/goals");

    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: "Failed to delete goal" };
  }
}

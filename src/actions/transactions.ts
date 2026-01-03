"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  TransactionType,
  type ExpenseGroup,
  type ExpenseCategory,
  type RecurringInterval,
} from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

type CreateTransactionData = {
  walletID: string;
  type: TransactionType;
  group: ExpenseGroup;
  category: ExpenseCategory;
  receipts?: string[];
  description?: string;
  amount: number;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  nextRecurringAt?: Date;
  lastProcessedAt?: Date;
};

type UpdateTransactionData = {
  walletID?: string;
  type?: TransactionType;
  group?: ExpenseGroup;
  category?: ExpenseCategory;
  receipts?: string[];
  description?: string;
  amount?: number;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  nextRecurringAt?: Date;
  lastProcessedAt?: Date;
};

export async function createTransaction(data: CreateTransactionData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (data.amount <= 0) {
      return { error: "Amount must be greater than 0" };
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "Account not found" };
    }

    // Verify wallet belongs to user
    const wallet = await db.wallet.findUnique({
      where: {
        id: data.walletID,
        userID: user.id,
      },
    });

    if (!wallet) {
      return { error: "Wallet not found" };
    }

    // Calculate new balance
    const balanceChange =
      data.type === TransactionType.INCOME ? data.amount : -data.amount;

    // Create transaction and update wallet balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          userID: user.id,
          walletID: data.walletID,
          type: data.type,
          group: data.group,
          category: data.category,
          receipts: data.receipts || [],
          description: data.description,
          amount: data.amount,
          isRecurring: data.isRecurring || false,
          recurringInterval: data.recurringInterval,
          nextRecurringAt: data.nextRecurringAt,
          lastProcessedAt: data.lastProcessedAt,
        },
      });

      await tx.wallet.update({
        where: { id: data.walletID },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard/overview");
    return { success: true, transaction };
  } catch (error) {
    console.error("[v0] Error creating transaction:", error);
    return { error: "Failed to create transaction" };
  }
}

export async function updateTransaction(
  transactionId: string,
  data: UpdateTransactionData
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (data.amount !== undefined && data.amount <= 0) {
      return { error: "Amount must be greater than 0" };
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "Account not found" };
    }

    // Get existing transaction
    const existingTransaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    if (!existingTransaction) {
      return { error: "Transaction not found" };
    }

    // Verify wallet belongs to user
    if (existingTransaction.wallet.userID !== user.id) {
      return { error: "Unauthorized" };
    }

    // If wallet is changing, verify new wallet belongs to user
    if (data.walletID && data.walletID !== existingTransaction.walletID) {
      const newWallet = await db.wallet.findUnique({
        where: {
          id: data.walletID,
          userID: user.id,
        },
      });

      if (!newWallet) {
        return { error: "New wallet not found" };
      }
    }

    const transaction = await db.$transaction(async (tx) => {
      // Reverse the old transaction's effect on the old wallet
      const oldBalanceChange =
        existingTransaction.type === TransactionType.INCOME
          ? -existingTransaction.amount
          : existingTransaction.amount;

      await tx.wallet.update({
        where: { id: existingTransaction.walletID },
        data: {
          balance: {
            increment: oldBalanceChange,
          },
        },
      });

      // Apply the new transaction's effect on the appropriate wallet
      const newWalletId = data.walletID || existingTransaction.walletID;
      const newType = data.type || existingTransaction.type;
      const newAmount = data.amount || existingTransaction.amount;

      const newBalanceChange =
        newType === TransactionType.INCOME ? newAmount : -newAmount;

      await tx.wallet.update({
        where: { id: newWalletId },
        data: {
          balance: {
            increment: newBalanceChange,
          },
        },
      });

      // Update the transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          walletID: data.walletID,
          type: data.type,
          group: data.group,
          category: data.category,
          receipts: data.receipts,
          description: data.description,
          amount: data.amount,
          isRecurring: data.isRecurring,
          recurringInterval: data.recurringInterval,
          nextRecurringAt: data.nextRecurringAt,
          lastProcessedAt: data.lastProcessedAt,
        },
      });

      return updatedTransaction;
    });

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard/overview");
    return { success: true, transaction };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "Account not found" };
    }

    const existingTransaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    if (!existingTransaction) {
      return { error: "Transaction not found" };
    }

    if (existingTransaction.wallet.userID !== user.id) {
      return { error: "Unauthorized" };
    }

    await db.$transaction(async (tx) => {
      // Reverse the transaction's effect on the wallet
      const balanceChange =
        existingTransaction.type === TransactionType.INCOME
          ? -existingTransaction.amount
          : existingTransaction.amount;

      await tx.wallet.update({
        where: { id: existingTransaction.walletID },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      // Delete the transaction
      await tx.transaction.delete({
        where: { id: transactionId },
      });
    });

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard/overview");
    return { success: true };
  } catch (error) {
    console.error("[v0] Error deleting transaction:", error);
    return { error: "Failed to delete transaction" };
  }
}

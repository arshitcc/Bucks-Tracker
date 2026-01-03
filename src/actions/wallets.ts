"use server";

import { WalletType } from "@/generated/prisma/enums";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createWallet(data: { name: string; balance: number }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (data.balance < 0) {
      return { error: "Add a minimum balance" };
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "Account not found" };
    }

    const newWallet = await db.wallet.create({
      data: {
        userID: user.id,
        name: data.name,
        type: WalletType.CUSTOM,
        balance: data.balance,
      },
    });

    revalidatePath("/dashboard/wallets");
    return { success: true, wallet: newWallet };
  } catch (error) {
    console.error("[v0] Error creating wallet:", error);
    return { error: "Failed to create wallet" };
  }
}

export async function updateWallet(walletId: string, data: { name: string }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "Account not found" };
    }

    const wallet = await db.wallet.update({
      where: {
        id: walletId,
        userID: user.id,
      },
      data: {
        name: data.name,
      },
    });

    revalidatePath("/dashboard/wallets");
    return { success: true, wallet };
  } catch (error) {
    console.error("[v0] Error updating wallet:", error);
    return { error: "Failed to update wallet" };
  }
}

export async function deleteWallet(walletId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "Account not found" };
    }

    // Get wallet to check type
    const wallet = await db.wallet.findUnique({
      where: {
        id: walletId,
        userID: user.id,
      },
    });

    if (!wallet) {
      return { error: "Wallet not found" };
    }

    if (wallet.type === WalletType.DEFAULT) {
      return { error: "Default Wallets cannot be deleted" };
    }

    await db.wallet.delete({
      where: {
        id: walletId,
        userID: user.id,
      },
    });

    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (error) {
    console.error("[v0] Error deleting wallet:", error);
    return { error: "Failed to delete wallet" };
  }
}

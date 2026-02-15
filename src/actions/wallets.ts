"use server";

import { WalletType } from "@/generated/prisma/enums";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createDefaultWallets(userID: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // const user = await db.user.findUnique({
    //   where: { clerkUserID: clerkUserId },
    // });

    // if (!user) {
    //   return { error: "Account not found" };
    // }

    const existingWallets = await db.wallet.findFirst({
      where: {
        userID,
        type: WalletType.DEFAULT,
      },
    });

    if (existingWallets) {
      return { success: true, error: "Default wallets already exist" };
    }

    const wallets = await db.wallet.createMany({
      data: [
        {
          userID,
          name: "Default Wallet",
          type: WalletType.DEFAULT,
          balance: 0,
        },
        {
          userID,
          name: "Savings Wallet",
          type: WalletType.DEFAULT,
          balance: 0,
        },
        {
          userID,
          name: "Emergency Wallet",
          type: WalletType.DEFAULT,
          balance: 0,
        },
      ],
      skipDuplicates: true,
    });

    return { success: true, data: wallets };
  } catch (error) {
    console.error("Error creating wallet:", error);
    return { success: false, error: "Failed to create wallet" };
  }
}

export async function getAllWallets() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return {
      success: false,
      error: "Session expired. Please login again",
    };
  }

  const user = await db.user.findUnique({
    where: { clerkUserID: userId },
  });

  if (!user) {
    return {
      success: false,
      error: "Account not found",
    };
  }

  const wallets = await db.wallet.findMany({
    where: { userID: user.id },
    orderBy: { createdAt: "asc" },
  });

  const groupedWallets = wallets.reduce(
    (acc, wallet) => {
      acc[wallet.type].push(wallet);
      return acc;
    },
    {
      DEFAULT: [] as typeof wallets,
      CUSTOM: [] as typeof wallets,
    },
  );

  return {
    success: true,
    data: groupedWallets,
  };
}

export async function createWallet(data: { name: string; balance: number }) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return { error: "Session expired. Please login again" };
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
    console.error("Error creating wallet:", error);
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

"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createDefaultWallets, getAllWallets } from "./wallets";
import { createFreeSubscription, getUserSubscription } from "./subscription";
import { Subscription, User, Wallet } from "@/generated/prisma/client";
import { success } from "zod";

export async function updateUserPassword(newPassword: string) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated) {
      return { error: "Unauthorized. Please login" };
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser.passwordEnabled) {
      return {
        success: false,
        error:
          "Password update is only available for users with email/password authentication",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    // Update password in Clerk
    await client.users.updateUser(userId, {
      password: newPassword,
      signOutOfOtherSessions: true,
    });

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      message:
        "Password updated successfully. All other sessions have been signed out.",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update password",
    };
  }
}

export async function createNewUserAccount(clerkUserID: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserID);

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not found in Clerk",
      };
    }

    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    const newUser = await db.user.create({
      data: {
        clerkUserID: user.id,
        email: email ?? "",
        name: user.fullName || "",
      },
    });

    const userID = newUser.id;

    const [walletsResponse, subscriptionResponse] = await Promise.all([
      createDefaultWallets(userID),
      createFreeSubscription(userID),
    ]);

    let data = {
      wallets: [],
      subscription: null as Subscription | null,
    };

    if (walletsResponse.success) {
      data.wallets = walletsResponse.data;
    }

    if (subscriptionResponse?.success) {
      data.subscription = subscriptionResponse.data;
    }

    return {
      success: true,
      data: { ...newUser, ...data },
    };
  } catch (err: any) {
    const clerkError = err.errors?.[0];
    return {
      success: false,
      error: clerkError?.message || "An error occurred during sign up",
    };
  }
}

/*
 * Delete user account completely
 * Removes user from Clerk and deletes all associated data from database
 */
export async function deleteUserAccount() {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated) {
      return { error: "Unauthorized. Please login" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found in database",
      };
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    // Delete all associated data in a transaction
    await db.$transaction(async (tx) => {
      // Delete goal transactions
      await tx.goalTransaction.deleteMany({
        where: {
          goal: {
            userID: user.id,
          },
        },
      });

      // Delete goals
      await tx.goal.deleteMany({
        where: { userID: user.id },
      });

      // Delete budgets
      await tx.budget.deleteMany({
        where: { userID: user.id },
      });

      // Delete transactions
      await tx.transaction.deleteMany({
        where: { userID: user.id },
      });

      // Delete wallets
      await tx.wallet.deleteMany({
        where: { userID: user.id },
      });

      // Delete subscriptions
      await tx.subscription.deleteMany({
        where: { userID: user.id },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete account",
    };
  }
}

export async function getUserAccount() {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated) {
      return { error: "Unauthorized. Please login" };
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

    const userID = user.id;

    const today = new Date();

    const [walletsResponse, subscriptionResponse] = await Promise.all([
      getAllWallets(),
      getUserSubscription(),
    ]);

    let data = {
      wallets: {
        DEFAULT: [] as Wallet[],
        CUSTOM: [] as Wallet[],
      },
      subscription: null as Subscription | null | undefined,
    };

    if (walletsResponse.success) {
      data.wallets = walletsResponse.data!;
    }

    if (subscriptionResponse?.success) {
      data.subscription = subscriptionResponse?.data;
    }

    return {
      success: true,
      data: {
        ...user,
        ...data,
      },
    };
  } catch (error) {}
}

export async function createNewAccount(data: {
  clerkUserID: string;
  email: string;
  name: string;
}) {
  try {
    const existingAccount = await db.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (existingAccount) {
      return {
        success: true,
        error: "Account already exists",
        data: existingAccount,
      };
    }

    const newUser = await db.user.create({ data });

    return {
      success: true,
      data: newUser,
    }
  } catch (error) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create account",
    };
  }
}

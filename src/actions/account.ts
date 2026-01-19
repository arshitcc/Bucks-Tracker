"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createDefaultWallets } from "./wallets";

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
    console.log(user);

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not found in Clerk",
      };
    }

    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    const newUser = await db.user.create({
      data: {
        clerkUserID: user.id,
        email: email ?? "",
        name: user.fullName || "",
      },
    });

    const res = await createDefaultWallets(newUser.id);

    let wallets = [];
    if (res.success) {
      wallets = res.wallets;
    }
    return {
      success: true,
      user: { ...newUser, wallets },
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

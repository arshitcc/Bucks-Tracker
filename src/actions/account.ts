"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/");

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

/**
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

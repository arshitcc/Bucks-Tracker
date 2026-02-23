"use server";

import { Goal, Subscription } from "@/generated/prisma/client";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PlanType, SubscriptionStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

// Get user subscription status
export async function getUserSubscription() {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const today = new Date();

    const subscription = await db.subscription.findFirst({
      where: {
        userID: user.id,
        validFrom: { lte: today },
        OR: [
          { validUntil: null },
          {
            validUntil: {
              gte: today,
            },
          },
        ],
      },
    });

    if (!subscription) {
      const freeSubscription = await db.subscription.findFirst({
        where: {
          userID: user.id,
          planType: PlanType.FREE,
        },
      });

      return {
        success: true,
        data: freeSubscription,
      };
    }

    const isActive =
      subscription.planType === PlanType.PREMIUM &&
      subscription.status === SubscriptionStatus.ACTIVE &&
      (!subscription.validUntil || subscription.validUntil > today);

    return {
      success: true,
      data: {
        ...subscription,
        isActive,
      },
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { error: "Failed to fetch subscription" };
  }
}

// Create Free Subscription for new users
export async function createFreeSubscription(userID: string) {
  try {
    const existingFreeSubscription = await db.subscription.findFirst({
      where: {
        userID,
        planType: PlanType.FREE,
      },
    });

    if (existingFreeSubscription) {
      return {
        success: true,
        message: "Free Subscription : exists",
        data: existingFreeSubscription,
      };
    }

    const newSubscription = await db.subscription.create({
      data: {
        userID,
        amount: 0,
        validUntil: null,
        planType: PlanType.FREE,
      },
    });

    return {
      success: true,
      message: "Free Subscription : created",
      data: newSubscription,
    };
  } catch (error) {
    console.log("Error while creating free subscription : ", error);
  }
}

// Create Razorpay order
export async function createRazorpayOrder(amount: number = 2000) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Check existing subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userID: user.id,
        status: SubscriptionStatus.ACTIVE,
        validUntil: { gte: new Date() },
      },
    });

    if (existingSubscription) {
      return { error: "User already has an active premium subscription" };
    }

    // In production, call Razorpay API here
    // For now, generate a mock order ID
    const mockOrderId = `order_${Date.now()}`;

    // Create or update subscription with PENDING status
    const existing = await db.subscription.findFirst({
      where: {
        userID: user.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    const subscription = existing
      ? await db.subscription.update({
          where: { id: existing.id },
          data: {
            planType: PlanType.PREMIUM,
            status: SubscriptionStatus.TRIALING,
            amount,
          },
        })
      : await db.subscription.create({
          data: {
            userID: user.id,
            planType: PlanType.PREMIUM,
            status: SubscriptionStatus.TRIALING,
            amount,
          },
        });

    return {
      success: true,
      data: {
        orderId: mockOrderId,
        amount,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
        subscription,
      },
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return { error: "Failed to create payment order" };
  }
}

// Verify and complete payment
export async function verifyAndCompletePayment(
  orderId: string,
  paymentId: string,
  signature: string,
  amount: number = 2000,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // verify signature with Razorpay API
    // crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    //   .update(`${orderId}|${paymentId}`)
    //   .digest('hex')

    // Update subscription with 30-day validity
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const existingSubscription = await db.subscription.findFirst({
      where: {
        userID: user.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    const subscription = existingSubscription
      ? await db.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType: PlanType.PREMIUM,
            status: SubscriptionStatus.ACTIVE,
            // razorpayOrderId: orderId,
            // razorpayPaymentId: paymentId,
            validFrom,
            validUntil,
            amount,
          },
        })
      : await db.subscription.create({
          data: {
            userID: user.id,
            planType: PlanType.PREMIUM,
            status: SubscriptionStatus.ACTIVE,
            // razorpayOrderId: orderId,
            // razorpayPaymentId: paymentId,
            validFrom,
            validUntil,
            amount,
          },
        });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account");

    return {
      success: true,
      subscription: {
        planType: subscription.planType,
        status: subscription.status,
        validUntil: subscription.validUntil,
      },
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { error: "Failed to verify payment" };
  }
}

// Handle payment failure
export async function handlePaymentFailure(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Update subscription status to canceled
    await db.subscription.updateMany({
      where: {
        userID: user.id,
        // razorpayOrderId: orderId,
      },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });

    revalidatePath("/upgrade");

    return { success: true };
  } catch (error) {
    console.error("Error handling payment failure:", error);
    return { error: "Failed to handle payment failure" };
  }
}

// Get user stats for account page
export async function getUserStats() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
      include: {
        goals: true,
        subscriptions: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    const subscription = user.subscriptions[0] || null;

    // Count completed goals on or before deadline
    const completedGoalsOnTime = user.goals.filter(
      (goal: Goal) =>
        goal.status === "COMPLETED" &&
        goal.savedAmount >= goal.targetAmount &&
        goal.deadline >= goal.updatedAt,
    ).length;

    // Calculate total spends from transactions (simplified)
    const wallets = await db.wallet.findMany({
      where: { userID: user.id },
    });

    let totalSpends = 0;
    for (const wallet of wallets) {
      const transactions = await db.transaction.findMany({
        where: { walletID: wallet.id, type: "EXPENSE" },
      });
      totalSpends += transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    return {
      success: true,
      stats: {
        completedGoalsOnTime,
        totalSpends,
        subscription: subscription
          ? {
              planType: subscription.planType,
              validUntil: subscription.validUntil,
              isActive:
                subscription.planType === "PREMIUM" &&
                subscription.status === "ACTIVE" &&
                (!subscription.validUntil ||
                  subscription.validUntil > new Date()),
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { error: "Failed to fetch user stats" };
  }
}

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from "date-fns";

type DailySpend = {
  date: string;
  amount: number;
};

type WeeklySpend = {
  week: string;
  amount: number;
};

type MonthlySpend = {
  month: string;
  amount: number;
};

type YearlySpend = {
  year: string;
  amount: number;
};

export type CategorySpend = {
  category: string;
  amount: number;
  fill: string;
};

export type SpendAnalytics = {
  daily: DailySpend[];
  weekly: WeeklySpend[];
  monthly: MonthlySpend[];
  yearly: YearlySpend[];
};

/**
 * Get comprehensive spend analytics for the authenticated user
 * Returns daily, weekly, monthly, and yearly spending data
 */
export async function getSpendAnalytics() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found in database",
      };
    }

    const now = new Date();

    // Get daily data for the last 7 days
    const dailyData = await getDailySpendData(user.id, now);

    // Get weekly data for the last 4 weeks
    const weeklyData = await getWeeklySpendData(user.id, now);

    // Get monthly data for the last 6 months
    const monthlyData = await getMonthlySpendData(user.id, now);

    // Get yearly data for the last 4 years
    const yearlyData = await getYearlySpendData(user.id, now);

    return {
      success: true,
      data: {
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData,
      },
    };
  } catch (error) {
    console.error("Error fetching spend analytics:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch analytics",
    };
  }
}

/**
 * Get daily spend data for the last 7 days
 */
async function getDailySpendData(userId: string, now: Date) {
  const days = eachDayOfInterval({
    start: subDays(now, 6),
    end: now,
  });

  const dailySpends = await Promise.all(
    days.map(async (day) => {
      const result = await db.transaction.aggregate({
        where: {
          userID: userId,
          type: "EXPENSE",
          createdAt: {
            gte: startOfDay(day),
            lte: endOfDay(day),
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        date: format(day, "EEE"), // Mon, Tue, Wed, etc.
        amount: result._sum.amount || 0,
      };
    })
  );

  return dailySpends;
}

/**
 * Get weekly spend data for the last 4 weeks
 */
async function getWeeklySpendData(
  userId: string,
  now: Date
): Promise<WeeklySpend[]> {
  const weeks = Array.from({ length: 4 }, (_, i) => subWeeks(now, 3 - i));

  const weeklySpends = await Promise.all(
    weeks.map(async (week, index) => {
      const result = await db.transaction.aggregate({
        where: {
          userID: userId,
          type: "EXPENSE",
          createdAt: {
            gte: startOfWeek(week, { weekStartsOn: 1 }), // Start on Monday
            lte: endOfWeek(week, { weekStartsOn: 1 }),
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        week: `Week ${index + 1}`,
        amount: result._sum.amount || 0,
      };
    })
  );

  return weeklySpends;
}

/**
 * Get monthly spend data for the last 6 months
 */
async function getMonthlySpendData(
  userId: string,
  now: Date
): Promise<MonthlySpend[]> {
  const months = eachMonthOfInterval({
    start: subMonths(now, 5),
    end: now,
  });

  const monthlySpends = await Promise.all(
    months.map(async (month) => {
      const result = await db.transaction.aggregate({
        where: {
          userID: userId,
          type: "EXPENSE",
          createdAt: {
            gte: startOfMonth(month),
            lte: endOfMonth(month),
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        month: format(month, "MMM"), // Jan, Feb, Mar, etc.
        amount: result._sum.amount || 0,
      };
    })
  );

  return monthlySpends;
}

/**
 * Get yearly spend data for the last 4 years
 */
async function getYearlySpendData(
  userId: string,
  now: Date
): Promise<YearlySpend[]> {
  const years = eachYearOfInterval({
    start: subYears(now, 3),
    end: now,
  });

  const yearlySpends = await Promise.all(
    years.map(async (year) => {
      const result = await db.transaction.aggregate({
        where: {
          userID: userId,
          type: "EXPENSE",
          createdAt: {
            gte: startOfYear(year),
            lte: endOfYear(year),
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        year: format(year, "yyyy"), // 2021, 2022, 2023, 2024
        amount: result._sum.amount || 0,
      };
    })
  );

  return yearlySpends;
}

/**
 * Get category-wise spending breakdown
 * Groups transactions by expense group and sums amounts for EXPENSE type transactions
 */
export async function getCategorySpends() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found in database",
      };
    }

    // Get all expense transactions grouped by expense group
    const groupedTransactions = await db.transaction.groupBy({
      by: ["group"],
      where: {
        userID: user.id,
        type: "EXPENSE",
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    // Map expense groups to readable category names and assign chart colors
    const categorySpends: CategorySpend[] = groupedTransactions.map(
      (item, index) => {
        const chartColorIndex = Math.min(index + 1, 5); // Use chart-1 through chart-5
        const fill =
          chartColorIndex <= 5
            ? `var(--chart-${chartColorIndex})`
            : "var(--muted-foreground)";

        return {
          category: formatExpenseGroup(item.group),
          amount: item._sum.amount || 0,
          fill,
        };
      }
    );

    categorySpends.sort((a, b) => b.amount - a.amount);

    return {
      success: true,
      data: categorySpends,
    };
  } catch (error) {
    console.error("Error fetching category spends:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch category spends",
    };
  }
}

/**
 * Format expense group enum to readable category name
 */
function formatExpenseGroup(group: string): string {
  const groupMap: Record<string, string> = {
    FOOD_AND_DRINKS: "Food & Drinks",
    SHOPPING: "Shopping",
    HOUSING: "Housing",
    TRANSPORTATION: "Transportation",
    VEHICLE: "Vehicle",
    ENTERTAINMENT: "Entertainment",
    INVESTMENTS: "Investments",
    INCOME: "Income",
    LIFE_AND_ENTERTAINMENT: "Life & Entertainment",
    HEALTH: "Health",
    EDUCATION: "Education",
    PERSONAL: "Personal",
    MISCELLANEOUS: "Miscellaneous",
    OTHER: "Others",
  };

  return groupMap[group] || group;
}

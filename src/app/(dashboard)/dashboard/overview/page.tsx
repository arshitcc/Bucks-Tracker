"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useOverviewStore } from "@/store/overview";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewPage() {
  const { data, isLoading, fetchOverviewData } = useOverviewStore();
  const [timeframe, setTimeframe] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  if (isLoading || !data) {
    return <OverviewLoading />;
  }

  const chartData = data?.spendAnalytics?.[timeframe] ?? [];
  const totalSpends = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.amount, 0),
    [chartData],
  );

  const totalCategorySpends = useMemo(
    () => data.categorySpends?.reduce((acc, curr) => acc + curr.amount, 0),
    [data.categorySpends],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Overview</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Spending Analytics Bar Chart */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left">
              <CardTitle>Spending Analytics</CardTitle>
              <CardDescription>Track your expenses over time</CardDescription>
            </div>
            <Tabs
              value={timeframe}
              onValueChange={(v) => setTimeframe(v as any)}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="daily">D</TabsTrigger>
                <TabsTrigger value="weekly">W</TabsTrigger>
                <TabsTrigger value="monthly">M</TabsTrigger>
                <TabsTrigger value="yearly">Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex h-100 items-center justify-center p-6">
            <ResponsiveContainer width="100%" height="100%">
              {totalSpends > 0 ? (
                <BarChart data={chartData}>
                  <XAxis
                    dataKey={
                      timeframe === "daily"
                        ? "date"
                        : timeframe === "weekly"
                          ? "week"
                          : timeframe === "monthly"
                            ? "month"
                            : "year"
                    }
                    stroke="#888888"
                    fontSize={12}
                    tickLine={true}
                    axisLine
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="amount"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <span className="text-muted-foreground flex h-full items-center justify-center rounded-xl border-3 border-dotted font-mono text-xl">
                  No {timeframe} spends
                </span>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categorical Spends Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Categorical Spends</CardTitle>
            <CardDescription>
              Top spending categories this month
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-100 items-center justify-center p-6">
            <ResponsiveContainer width="100%" height="100%">
              {totalCategorySpends > 0 ? (
                <PieChart>
                  <Pie
                    data={data.categorySpends}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {data.categorySpends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend height={36} />
                </PieChart>
              ) : (
                <span className="text-muted-foreground flex h-full items-center justify-center rounded-xl border-3 border-dotted font-mono text-xl">
                  No spends this month
                </span>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OverviewLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-125">
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex h-75 items-end justify-end gap-x-7 px-10">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-12"
                  style={{ height: `${20 + i * 10}%` }}
                />
              ))}
          </CardContent>
        </Card>
        <Card className="h-125">
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex h-75 items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

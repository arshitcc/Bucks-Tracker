"use client";

import { useEffect, useState } from "react";
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

  const chartData = data.spendAnalytics[timeframe];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Overview</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending Analytics Bar Chart */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
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
          <CardContent className="h-100">
            <ChartContainer
              config={{
                amount: { label: "Amount", color: "hsl(var(--primary))" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
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
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="amount"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
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
          <CardContent className="h-100 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
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
                    // fill = entry.fill
                    <Cell key={`cell-${index}`} fill={"var(--primary)"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-125">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex items-end justify-between h-75 px-10">
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-12"
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
          </CardContent>
        </Card>
        <Card className="h-125">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex items-center justify-center h-75">
            <Skeleton className="h-48 w-48 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

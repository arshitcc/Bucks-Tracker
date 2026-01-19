"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import {
  LayoutDashboardIcon,
  LogOutIcon,
  PieChartIcon,
  TargetIcon,
  WalletIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  if (!user?.hasVerifiedEmailAddress) {
    toast.error("Please verify your email address before logging in.", {
      position: "top-right",
    });
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.firstName ?? "User"}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your finances.
            </p>
          </div>
          <SignOutButton>
            <Button variant="outline" className="gap-2 bg-transparent">
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </SignOutButton>
        </header>

        <div className="grid gap-3 items-center grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Total Balance"
            value="$12,450.00"
            icon={<WalletIcon className="size-5" />}
            description="+2.5% from last month"
          />
          <DashboardCard
            title="Active Goals"
            value="4 / 10"
            icon={<TargetIcon className="size-5" />}
            description="2 goals near completion"
          />
          <DashboardCard
            title="Monthly Spending"
            value="$3,240.50"
            icon={<PieChartIcon className="size-5" />}
            description="15% below budget"
          />
          <DashboardCard
            title="AI Insights"
            value="3 New"
            icon={<LayoutDashboardIcon className="size-5" />}
            description="Optimizations available"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activity across all wallets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-75 items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              No Transactions Found
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  description,
  className,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="h-40 justify-between">
        <CardHeader className="flex flex-row items-center justify-between px-3">
          <CardTitle className="text-xs md:text-sm font-medium">{title}</CardTitle>
          <div className="hidden sm:flex text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent className="px-3">
          <div className="text-lg md:text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

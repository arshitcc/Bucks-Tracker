"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";
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
import { useUserStore } from "@/store/auth";

export default function DashboardPage() {
  const { isLoaded, user: clerkProfile } = useUser();
  const { fetchProfile } = useUserStore();
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  if (!clerkProfile?.hasVerifiedEmailAddress) {
    toast.error("Please verify your email address before logging in.", {
      position: "top-right",
    });
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back {clerkProfile?.firstName ?? null}!
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

        <div className="grid grid-cols-2 items-center gap-3 xl:grid-cols-4">
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
            <div className="text-muted-foreground flex h-75 items-center justify-center rounded-lg border-2 border-dashed">
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
          <CardTitle className="text-xs font-medium md:text-sm">
            {title}
          </CardTitle>
          <div className="text-muted-foreground hidden sm:flex">{icon}</div>
        </CardHeader>
        <CardContent className="px-3">
          <div className="text-lg font-bold md:text-2xl">{value}</div>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

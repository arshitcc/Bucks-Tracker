"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/store/wallets";
import { Skeleton } from "@/components/ui/skeleton";
import {
  WalletIcon,
  PlusIcon,
  Trash2Icon,
  ArrowUpRightIcon,
} from "lucide-react";

export default function WalletsPage() {
  const { wallets, isLoading, fetchWallets, deleteWallet } = useWalletStore();
  const router = useRouter();

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const defaultWallets = wallets.filter((w) => w.isDefault);
  const customWallets = wallets.filter((w) => !w.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallets</h1>
        <Button className="gap-2">
          <PlusIcon className="h-4 w-4" /> New Wallet
        </Button>
      </div>

      <Tabs defaultValue="default" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="default">Default</TabsTrigger>
          <TabsTrigger value="my-wallets">My Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => <WalletSkeleton key={i} />)
                : defaultWallets.map((wallet) => (
                    <motion.div
                      key={wallet.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="overflow-hidden border-2 border-primary/20 bg-linear-to-br from-primary/5 to-transparent shadow-md transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-lg font-medium">
                            {wallet.name}
                          </CardTitle>
                          <WalletIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            ${wallet.balance.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Default Wallet
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="my-wallets" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <WalletSkeleton key={i} />)
              ) : customWallets.length > 0 ? (
                customWallets.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative"
                  >
                    <Card className="overflow-hidden border-2 border-primary/40 bg-card shadow-xl">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">
                          {wallet.name}
                        </CardTitle>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteWallet(wallet.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${wallet.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-primary font-medium mt-1">
                          Premium Wallet
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <ArrowUpRightIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Unlock Custom Wallets</h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    Create up to 20 custom wallets with unique themes and shine
                    effects by upgrading to Pro.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => router.push("/upgrade")}
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

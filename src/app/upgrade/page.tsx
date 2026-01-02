"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CheckCircle2,
  CreditCard,
  Smartphone,
  Loader2,
  Check,
  XCircle,
} from "lucide-react";

type Step = "plans" | "payment" | "processing" | "status";

export default function UpgradePage() {
  const [step, setStep] = useState<Step>("plans");
  const [status, setStatus] = useState<"success" | "fail">("success");
  const router = useRouter();

  const handlePayment = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("status");
      setTimeout(() => {
        router.replace("/dashboard/overview");
      }, 3000);
    }, 2500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <AnimatePresence mode="wait">
        {step === "plans" && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold">Upgrade to Pro</h1>
              <p className="mt-2 text-muted-foreground">
                Unlock the full power of Bucks Tracker
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="flex flex-col border-2">
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>
                    Perfect for individuals starting out
                  </CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    $0
                    <span className="text-lg font-normal text-muted-foreground">
                      /mo
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <FeatureItem text="General Wallets" />
                  <FeatureItem text="Set Goals" />
                  <FeatureItem text="Set Budgets for Categories" />
                  <FeatureItem text="Visualize Transactions" />
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled
                  >
                    Current Plan
                  </Button>
                </CardFooter>
              </Card>

              <Card className="relative flex flex-col border-2 border-primary shadow-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  RECOMMENDED
                </div>
                <CardHeader>
                  <CardTitle>Pro Plan</CardTitle>
                  <CardDescription>
                    Advance tracking for power users
                  </CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    $20
                    <span className="text-lg font-normal text-muted-foreground">
                      /mo
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <FeatureItem text="Everything in Free" />
                  <FeatureItem text="AI Receipt Scanner" />
                  <FeatureItem text="Email Alerts" />
                  <FeatureItem text="Up to 10 Goals" />
                  <FeatureItem text="Up to 20 Wallets" />
                  <FeatureItem text="Expense Recommendations" />
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setStep("payment")}>
                    Upgrade Now
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Select your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  defaultValue="card"
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="card"
                      id="card"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="card"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      Card
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="upi"
                      id="upi"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="upi"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Smartphone className="mb-3 h-6 w-6" />
                      UPI
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handlePayment}>
                  Pay $20.00
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("plans")}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <h2 className="mt-6 text-2xl font-bold">Processing Payment...</h2>
            <p className="mt-2 text-muted-foreground">
              Please do not refresh the page.
            </p>
          </motion.div>
        )}

        {step === "status" && (
          <motion.div
            key="status"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <Card className="text-center">
              <CardContent className="pt-10">
                {status === "success" ? (
                  <>
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">
                      Payment Successful!
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Your account has been upgraded. Redirecting to
                      dashboard...
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Payment Failed</CardTitle>
                    <CardDescription className="mt-2">
                      Something went wrong. Please try again later.
                    </CardDescription>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-primary" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

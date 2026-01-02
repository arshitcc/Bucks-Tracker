"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Pencil,
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  Trash2Icon,
  PencilIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContributeToGoalForm,
  contributeToGoalSchema,
  NewGoalForm,
  newGoalSchema,
  WithdrawFromGoalForm,
  withdrawFromGoalSchema,
} from "@/schemas/goals";
import { useGoalStore } from "@/store/goals";
import { useWalletStore } from "@/store/wallets";
import { Goal } from "@/types";
import GoalsCardSkeleton from "./_components/goals-skeleton";

export default function GoalsPage() {
  const {
    goals,
    isLoading: goalsLoading,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
  } = useGoalStore();
  
  const { wallets, isLoading: walletsLoading, fetchWallets } = useWalletStore();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
    fetchWallets();
  }, [fetchGoals, fetchWallets]);

  const goalForm = useForm<NewGoalForm>({
    resolver: zodResolver(newGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: "0",
    },
  });

  const contributeForm = useForm<ContributeToGoalForm>({
    resolver: zodResolver(contributeToGoalSchema),
    defaultValues: {
      amount: "0",
      goalID: "",
      walletID: "",
    },
  });

  const withdrawForm = useForm<WithdrawFromGoalForm>({
    resolver: zodResolver(withdrawFromGoalSchema),
    defaultValues: {
      amount: "0",
      goalID: "",
      walletID: "",
    },
  });

  const onGoalSubmit = (data: NewGoalForm) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: data.name,
        deadline: format(data.deadline, "yyyy-MM-dd"),
        targetAmount: Number(data.targetAmount),
      });
    } else {
      addGoal({
        name: data.name,
        deadline: format(data.deadline, "yyyy-MM-dd"),
        targetAmount: Number(data.targetAmount),
      });
    }
    setIsGoalDialogOpen(false);
    setEditingGoal(null);
    goalForm.reset();
  };

  const onContributeSubmit = (data: ContributeToGoalForm) => {
    const goal = goals.find((g) => g.id === data.goalID);
    if (goal) {
      updateGoal(goal.id, {
        currentSaved: goal.currentSaved + Number(data.amount),
      });
    }
    setIsContributeDialogOpen(false);
    contributeForm.reset();
  };

  const onWithdrawSubmit = (data: WithdrawFromGoalForm) => {
    const goal = goals.find((g) => g.id === data.goalID);
    if (goal) {
      updateGoal(goal.id, {
        currentSaved: Math.max(0, goal.currentSaved - Number(data.amount)),
      });
    }
    setIsWithdrawDialogOpen(false);
    withdrawForm.reset();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    goalForm.setValue("name", goal.name);
    goalForm.setValue("deadline", new Date(goal.deadline));
    goalForm.setValue("targetAmount", goal.targetAmount.toString());
    setIsGoalDialogOpen(true);
  };

  const handleDelete = (goal: Goal) => {
    deleteGoal(goal.id);
  };

  const handleNewGoal = () => {
    setEditingGoal(null);
    goalForm.reset();
    setIsGoalDialogOpen(true);
  };

  const incompleteGoals = goals.filter((g) => !g.completed);

  if (goalsLoading) {
    return <GoalsCardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">
            Set and track your financial goals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewGoal}>
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? "Edit Goal" : "Create New Goal"}
                </DialogTitle>
                <DialogDescription>
                  {editingGoal
                    ? "Update your goal details."
                    : "Set a new financial goal to work towards."}
                </DialogDescription>
              </DialogHeader>
              <Form {...goalForm}>
                <form
                  onSubmit={goalForm.handleSubmit(onGoalSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={goalForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Emergency Fund"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={goalForm.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Deadline</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={goalForm.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsGoalDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingGoal ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isContributeDialogOpen}
            onOpenChange={setIsContributeDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4" />
                Contribute
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contribute to Goal</DialogTitle>
                <DialogDescription>
                  Add money to one of your incomplete goals.
                </DialogDescription>
              </DialogHeader>
              <Form {...contributeForm}>
                <form
                  onSubmit={contributeForm.handleSubmit(onContributeSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={contributeForm.control}
                    name="goalID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Goal</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incompleteGoals.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id}>
                                {goal.name} (${goal.currentSaved} / $
                                {goal.targetAmount})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contributeForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contributeForm.control}
                    name="walletID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Wallet</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select wallet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wallets.map((wallet) => (
                              <SelectItem key={wallet.id} value={wallet.id}>
                                {wallet.name} (${wallet.balance})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsContributeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Contribute</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isWithdrawDialogOpen}
            onOpenChange={setIsWithdrawDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingDown className="h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw from Goal</DialogTitle>
                <DialogDescription>
                  Remove money from one of your goals.
                </DialogDescription>
              </DialogHeader>
              <Form {...withdrawForm}>
                <form
                  onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={withdrawForm.control}
                    name="goalID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Goal</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {goals.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id}>
                                {goal.name} (${goal.currentSaved} / $
                                {goal.targetAmount})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={withdrawForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={withdrawForm.control}
                    name="walletID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Wallet</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select wallet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wallets.map((wallet) => (
                              <SelectItem key={wallet.id} value={wallet.id}>
                                {wallet.name} (${wallet.balance})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsWithdrawDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Withdraw</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const percentage = (goal.currentSaved / goal.targetAmount) * 100;
          const isCompleted = percentage >= 100;
          return (
            <Card
              key={goal.id}
              className={cn(
                "relative group overflow-hidden transition-all duration-300",
                isCompleted &&
                  "bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/10"
              )}
            >
              {isCompleted && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
              <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEdit(goal)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(goal)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader>
                <CardTitle className="text-lg pr-8">{goal.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-semibold text-primary">
                      ${goal.currentSaved.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">
                      ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {isCompleted
                      ? "Goal completed!"
                      : `$${(goal.targetAmount - goal.currentSaved).toFixed(
                          2
                        )} remaining`}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

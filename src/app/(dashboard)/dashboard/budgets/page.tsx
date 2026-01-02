"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useBudgetStore } from "@/store/budgets";
import BudgetsCardSkeleton from "./_components/budgets-skeleton";
import { Budget } from "@/types";
import { BudgetFormValues, newBudgetSchema } from "@/schemas/budgets";

const categories = [
  {
    group: "Essential",
    items: [
      "Food & Dining",
      "Transportation",
      "Bills & Utilities",
      "Healthcare",
    ],
  },
  {
    group: "Lifestyle",
    items: ["Entertainment", "Shopping", "Travel", "Hobbies"],
  },
  { group: "Other", items: ["Investments", "Savings", "Miscellaneous"] },
];

export default function BudgetsPage() {
  const {
    budgets,
    isLoading,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useBudgetStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(newBudgetSchema),
    defaultValues: {
      category: "",
      limit: "",
    },
  });

  const onSubmit = (data: BudgetFormValues) => {
    console.log("Budget form submitted:", data);
    if (editingBudget) {
      updateBudget(editingBudget.id, {
        category: data.category,
        limit: Number(data.limit),
      });
    } else {
      addBudget({ category: data.category, limit: Number(data.limit) });
    }
    setIsDialogOpen(false);
    setEditingBudget(null);
    form.reset();
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    form.setValue("category", budget.category);
    form.setValue("limit", budget.limit.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = (budget: Budget) => {
    deleteBudget(budget.id);
  };

  const handleNewBudget = () => {
    setEditingBudget(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <BudgetsCardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Track your spending across different categories.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBudget}>
              <PlusIcon className="h-4 w-4" />
              New Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </DialogTitle>
              <DialogDescription>
                {editingBudget
                  ? "Update your budget details."
                  : "Set a spending limit for a category."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((group) => (
                            <SelectGroup key={group.group}>
                              <SelectLabel>{group.group}</SelectLabel>
                              {group.items.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Limit ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBudget ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage > 100;
          return (
            <Card key={budget.id} className="relative group">
              <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEdit(budget)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(budget)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{budget.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span
                      className={
                        isOverBudget
                          ? "text-destructive font-semibold"
                          : "font-medium"
                      }
                    >
                      ${budget.spent.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={isOverBudget ? "bg-destructive/20" : ""}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">
                      ${budget.limit.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isOverBudget
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isOverBudget
                      ? `$${(budget.spent - budget.limit).toFixed(
                          2
                        )} over budget`
                      : `$${(budget.limit - budget.spent).toFixed(
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

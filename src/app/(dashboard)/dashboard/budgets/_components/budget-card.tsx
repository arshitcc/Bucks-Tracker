import { UserBudget } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type BudgetCardProps = {
  budget: UserBudget;
  percentage: number;
  isOverBudget: boolean;
  handleEdit: (budget: UserBudget) => void;
  handleDelete: (budget: UserBudget) => void;
};

function BudgetCard({ budget, percentage, isOverBudget, handleEdit, handleDelete }: BudgetCardProps) {
  return (
    <Card key={budget.id} className="group relative">
      <div className="absolute top-4 right-4 flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                isOverBudget ? "text-destructive font-semibold" : "font-medium"
              }
            >
              ₹{budget.spent.toFixed(2)}
            </span>
          </div>
          <Progress
            value={Math.min(percentage, 100)}
            className={isOverBudget ? "bg-destructive/20" : ""}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">₹{budget.limit.toFixed(2)}</span>
          </div>
        </div>
        <div className="pt-2 text-center">
          <p
            className={`text-sm font-medium ${
              isOverBudget ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {isOverBudget
              ? `₹${(budget.spent - budget.limit).toFixed(2)} over budget`
              : `₹${(budget.limit - budget.spent).toFixed(2)} remaining`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default BudgetCard;

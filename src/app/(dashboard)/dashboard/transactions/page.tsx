"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Info,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTransactionStore } from "@/store/transactions";
import { type Transaction } from "@/types";
import TransactionSkeleton from "./_components/transactions-skeleton";

export default function TransactionsPage() {
  const { transactions, isLoading, fetchTransactions, deleteTransaction } =
    useTransactionStore();
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return <TransactionSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track your financial history.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Wallet Name</TableHead>
              <TableHead>Current Balance</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Badge
                    variant={t.type === "Income" ? "secondary" : "destructive"}
                    className="gap-1"
                  >
                    {t.type === "Income" ? (
                      <Plus className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {t.category.replace("_", " ")}
                </TableCell>
                <TableCell
                  className={
                    t.type === "Income" ? "text-green-600" : "text-red-600"
                  }
                >
                  {t.type === "Income" ? "+" : "-"}${t.amount.toFixed(2)}
                </TableCell>
                <TableCell>{"t.walletName"}</TableCell>
                <TableCell className="font-mono">
                  ${t.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.dateTime}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTransaction(t)}
                  >
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Details</span>
                  </Button>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => deleteTransaction(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex items-center justify-between px-2 py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, transactions.length)}{" "}
                    of {transactions.length} entries
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <Button
                            key={p}
                            variant={currentPage === p ? "default" : "outline"}
                            size="sm"
                            className="w-8"
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Description</DialogTitle>
            <DialogDescription>
              Details for transaction #{selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {selectedTransaction?.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
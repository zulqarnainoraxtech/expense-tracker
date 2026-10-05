"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ReceiptText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ExpenseItem } from "./expense-item";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { CATEGORY_NAMES } from "@/lib/categories";
import { Expense, SortOption } from "@/types/expense";
import { formatCurrency } from "@/lib/currency";

interface ExpenseListProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  displayMonth: string;
}

export function ExpenseList({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  displayMonth,
}: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Filter & Sort
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.category.toLowerCase().includes(q) ||
          (item.note && item.note.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [expenses, searchQuery, selectedCategory, sortBy]);

  const handleDeleteConfirm = () => {
    if (deletingExpense) {
      onDeleteExpense(deletingExpense.id);
      setDeletingExpense(null);
    }
  };

  const totalFilteredSum = useMemo(() => {
    return filteredAndSortedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredAndSortedExpenses]);

  return (
    <>
      <Card className="border-[#1b2844] bg-[#0c1424]">
        <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm sm:text-base font-bold text-white truncate">
                  Recent Expenses
                </CardTitle>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                  {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} in {displayMonth}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={onAddExpense}
              className="text-xs font-bold shrink-0 h-8 px-3"
            >
              <Plus className="h-3.5 w-3.5 mr-0.5" />
              <span className="hidden xs:inline">Add Expense</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>

          {/* Filters & Search Toolbar */}
          {expenses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search note or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORY_NAMES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 text-xs"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0">
          {expenses.length === 0 ? (
            /* Empty State */
            <div className="py-10 sm:py-12 text-center rounded-xl border border-dashed border-[#1e2c4a] bg-[#090f1d] px-4">
              <div className="mx-auto h-12 w-12 rounded-xl bg-[#111c32] border border-[#1b2844] flex items-center justify-center text-slate-500 mb-3">
                <ReceiptText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                No expenses yet
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Start tracking your spending by adding your first expense for {displayMonth}.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={onAddExpense}
                className="mt-4 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Expense
              </Button>
            </div>
          ) : filteredAndSortedExpenses.length === 0 ? (
            /* No Results from Search/Filter */
            <div className="py-10 text-center px-4">
              <p className="text-sm font-medium text-slate-300">
                No expenses match your filters.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for something else or clearing the category filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="mt-3 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Optional filter summary if filtering is active */}
              {(searchQuery || selectedCategory !== "ALL") && (
                <div className="flex flex-wrap items-center justify-between gap-1 px-1 text-xs text-slate-400 mb-2">
                  <span>
                    Showing {filteredAndSortedExpenses.length} of {expenses.length} expenses
                  </span>
                  <span className="font-semibold text-slate-200">
                    Filtered: {formatCurrency(totalFilteredSum)}
                  </span>
                </div>
              )}

              {filteredAndSortedExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={onEditExpense}
                  onDelete={(item) => setDeletingExpense(item)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deletingExpense}
        onOpenChange={(open) => {
          if (!open) setDeletingExpense(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense?"
        description={
          deletingExpense
            ? `Are you sure you want to delete this ${deletingExpense.category} expense of ${formatCurrency(
                deletingExpense.amount
              )}? This cannot be undone.`
            : "Are you sure you want to delete this expense?"
        }
      />
    </>
  );
}

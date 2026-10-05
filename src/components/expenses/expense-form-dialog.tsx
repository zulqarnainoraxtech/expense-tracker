"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CATEGORY_NAMES, getCategoryConfig } from "@/lib/categories";
import { Expense } from "@/types/expense";

interface ExpenseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Expense, "id" | "createdAt">) => void;
  editingExpense?: Expense | null;
  defaultDate?: string;
}

export function ExpenseFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  editingExpense,
  defaultDate,
}: ExpenseFormDialogProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});

  // Reset form when dialog opens or editingExpense changes
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setAmount(String(editingExpense.amount));
        setCategory(editingExpense.category || "Food");
        setDate(editingExpense.date || new Date().toISOString().slice(0, 10));
        setNote(editingExpense.note || "");
      } else {
        setAmount("");
        setCategory("Food");
        const todayStr = new Date().toISOString().slice(0, 10);
        // If defaultDate provided matches YYYY-MM, use it with current day or 01
        if (defaultDate && defaultDate.length === 7) {
          const now = new Date();
          const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          if (defaultDate === currentMonthPrefix) {
            setDate(todayStr);
          } else {
            setDate(`${defaultDate}-01`);
          }
        } else {
          setDate(todayStr);
        }
        setNote("");
      }
      setErrors({});
    }
  }, [isOpen, editingExpense, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { amount?: string; category?: string; date?: string } = {};
    const parsedAmount = parseFloat(amount);

    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Amount must be a number greater than 0";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!date.trim()) {
      newErrors.date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      amount: parsedAmount,
      category,
      date,
      note: note.trim() || undefined,
    });

    onOpenChange(false);
  };

  const selectedCategoryConfig = getCategoryConfig(category);
  const CategoryIcon = selectedCategoryConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? "Update the expense details below."
                : "Record an expense for this month in Pakistani Rupees (PKR)."}
            </DialogDescription>
          </DialogHeader>

          {/* Amount Field */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-amount">Amount (PKR) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-semibold text-neutral-400">
                Rs.
              </span>
              <Input
                id="expense-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className="pl-9 text-base font-semibold"
                autoFocus
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{errors.amount}</p>
            )}
          </div>

          {/* Category Field */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-category">Category *</Label>
            <div className="flex items-center gap-2">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800 ${selectedCategoryConfig.bgColor} ${selectedCategoryConfig.textColor}`}
              >
                <CategoryIcon className="h-4 w-4" />
              </div>
              <Select
                id="expense-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                }}
              >
                {CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            {errors.category && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{errors.category}</p>
            )}
          </div>

          {/* Date Field */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-date">Date *</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
            />
            {errors.date && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{errors.date}</p>
            )}
          </div>

          {/* Description / Note */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-note">Description / Note (Optional)</Label>
            <Input
              id="expense-note"
              type="text"
              placeholder="e.g. Lunch with colleagues, Groceries, Electricity bill"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="text-xs">
              {editingExpense ? "Save Changes" : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

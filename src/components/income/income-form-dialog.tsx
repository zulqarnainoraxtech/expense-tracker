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
import { INCOME_SOURCES } from "@/lib/categories";
import { Income } from "@/types/expense";

interface IncomeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Income, "id" | "createdAt">) => Promise<unknown> | void;
  editingIncome?: Income | null;
  defaultDate?: string;
}

export function IncomeFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  editingIncome,
  defaultDate,
}: IncomeFormDialogProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ amount?: string; source?: string; date?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      setIsSubmitting(false);
      if (editingIncome) {
        setAmount(String(editingIncome.amount));
        if (INCOME_SOURCES.includes(editingIncome.source)) {
          setSource(editingIncome.source);
          setCustomSource("");
        } else {
          setSource("Other");
          setCustomSource(editingIncome.source);
        }
        setDate(editingIncome.date || new Date().toISOString().slice(0, 10));
        setNote(editingIncome.note || "");
      } else {
        setAmount("");
        setSource("Salary");
        setCustomSource("");
        const todayStr = new Date().toISOString().slice(0, 10);
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
  }, [isOpen, editingIncome, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { amount?: string; source?: string; date?: string } = {};
    const parsedAmount = parseFloat(amount);

    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Amount must be a number greater than 0";
    }

    const finalSource = source === "Other" && customSource.trim() ? customSource.trim() : source;
    if (!finalSource.trim()) {
      newErrors.source = "Source is required";
    }

    if (!date.trim()) {
      newErrors.date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);
      await onSubmit({
        amount: parsedAmount,
        source: finalSource,
        date,
        note: note.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save to database";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editingIncome ? "Edit Income" : "Add Income"}</DialogTitle>
            <DialogDescription>
              {editingIncome
                ? "Update your income entry in MongoDB."
                : "Add earnings or incoming money directly to MongoDB (PKR)."}
            </DialogDescription>
          </DialogHeader>

          {serverError && (
            <div className="rounded-lg bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300">
              <span className="font-semibold block mb-0.5">Database Error:</span>
              {serverError}
            </div>
          )}

          {/* Amount Field */}
          <div className="space-y-1.5">
            <Label htmlFor="income-amount">Amount (PKR) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-semibold text-neutral-400">
                Rs.
              </span>
              <Input
                id="income-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 75000"
                value={amount}
                disabled={isSubmitting}
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

          {/* Source Field */}
          <div className="space-y-1.5">
            <Label htmlFor="income-source">Source *</Label>
            <Select
              id="income-source"
              value={source}
              disabled={isSubmitting}
              onChange={(e) => {
                setSource(e.target.value);
                if (errors.source) setErrors((prev) => ({ ...prev, source: undefined }));
              }}
            >
              {INCOME_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </Select>

            {source === "Other" && (
              <div className="pt-2">
                <Input
                  placeholder="Specify source name..."
                  value={customSource}
                  disabled={isSubmitting}
                  onChange={(e) => setCustomSource(e.target.value)}
                  maxLength={50}
                />
              </div>
            )}

            {errors.source && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{errors.source}</p>
            )}
          </div>

          {/* Date Field */}
          <div className="space-y-1.5">
            <Label htmlFor="income-date">Date *</Label>
            <Input
              id="income-date"
              type="date"
              value={date}
              disabled={isSubmitting}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
            />
            {errors.date && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{errors.date}</p>
            )}
          </div>

          {/* Note Field */}
          <div className="space-y-1.5">
            <Label htmlFor="income-note">Description / Note (Optional)</Label>
            <Input
              id="income-note"
              type="text"
              placeholder="e.g. Monthly salary, Freelance design contract"
              value={note}
              disabled={isSubmitting}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="text-xs">
              {isSubmitting
                ? "Saving to Database..."
                : editingIncome
                ? "Save Changes"
                : "Save Income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

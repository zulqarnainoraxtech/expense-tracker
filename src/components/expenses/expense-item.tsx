"use client";

import { Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryConfig } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";
import { Expense } from "@/types/expense";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function formatDateDisplay(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const categoryConfig = getCategoryConfig(expense.category);
  const Icon = categoryConfig.icon;

  return (
    <div className="group rounded-xl border border-[#182642] bg-[#090f1d] hover:border-[#24385e] hover:bg-[#0c1426] transition-all p-3 sm:p-4">
      {/* Primary Row: On mobile displays Category & Amount; On desktop displays Category, Note, Date & Amount */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon + Category & Details */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs"
            style={{
              backgroundColor: `${categoryConfig.color}20`,
              borderColor: `${categoryConfig.color}40`,
              color: categoryConfig.color,
            }}
            title={expense.category}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold text-white truncate block">
              {expense.category}
            </span>

            {/* Desktop secondary line: Note and Date */}
            <div className="hidden sm:flex items-center gap-x-2 text-xs text-slate-400 mt-0.5">
              {expense.note ? (
                <span className="truncate max-w-[200px] md:max-w-xs text-slate-300 font-medium">
                  {expense.note}
                </span>
              ) : (
                <span className="italic text-slate-500">No description</span>
              )}
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] shrink-0">
                <Calendar className="h-3 w-3" />
                {formatDateDisplay(expense.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Desktop Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="text-right">
            <span className="text-sm sm:text-base font-black text-[#f43f5e] whitespace-nowrap">
              - {formatCurrency(expense.amount)}
            </span>
          </div>

          {/* Action Buttons for Desktop */}
          <div className="hidden sm:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(expense)}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#15223c]"
              title="Edit Expense"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(expense)}
              className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
              title="Delete Expense"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-only Secondary Row: Note, Date and Mobile Actions without squeezing */}
      <div className="sm:hidden mt-2 pt-2 border-t border-[#142038] flex items-center justify-between text-xs gap-2">
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          {expense.note ? (
            <span className="text-slate-300 font-medium truncate text-xs">
              {expense.note}
            </span>
          ) : (
            <span className="italic text-slate-500 text-[11px]">No description</span>
          )}
          <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
            <Calendar className="h-3 w-3" />
            {formatDateDisplay(expense.date)}
          </span>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(expense)}
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-[#15223c]"
            title="Edit Expense"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(expense)}
            className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
            title="Delete Expense"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

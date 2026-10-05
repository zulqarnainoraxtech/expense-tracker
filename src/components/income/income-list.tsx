"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, DollarSign, WalletCards, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { Income } from "@/types/expense";
import { formatCurrency } from "@/lib/currency";

interface IncomeListProps {
  incomeList: Income[];
  totalIncome: number;
  onAddIncome: () => void;
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
  displayMonth: string;
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

export function IncomeList({
  incomeList,
  totalIncome,
  onAddIncome,
  onEditIncome,
  onDeleteIncome,
  displayMonth,
}: IncomeListProps) {
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);

  const handleDeleteConfirm = () => {
    if (deletingIncome) {
      onDeleteIncome(deletingIncome.id);
      setDeletingIncome(null);
    }
  };

  return (
    <>
      <Card className="border-[#1b2844] bg-[#0c1424]">
        <CardHeader className="p-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-[#00d68f] flex items-center justify-center shrink-0">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">
                  Monthly Income Sources
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total inflow: <strong className="text-[#00d68f]">{formatCurrency(totalIncome)}</strong> for {displayMonth}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onAddIncome}
              className="text-xs font-semibold self-start sm:self-auto border-emerald-500/30 bg-emerald-500/10 text-[#00d68f] hover:bg-emerald-500/20 hover:text-emerald-300"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Income</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          {incomeList.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-[#1e2c4a] bg-[#090f1d]">
              <div className="mx-auto h-12 w-12 rounded-xl bg-[#111c32] border border-[#1b2844] text-[#00d68f] flex items-center justify-center mb-3">
                <WalletCards className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                No income logged yet
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add your salary, freelance earnings, or other income streams for {displayMonth}.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddIncome}
                className="mt-4 text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-[#00d68f] hover:bg-emerald-500/20"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Income
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {incomeList.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-xl border border-[#182642] bg-[#090f1d] hover:border-[#24385e] hover:bg-[#0c1426] transition-all p-3 sm:p-4"
                >
                  {/* Primary Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[#00d68f] flex items-center justify-center shrink-0">
                        <DollarSign className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-white truncate block">
                          {item.source}
                        </span>
                        {/* Desktop Subline */}
                        <div className="hidden sm:flex items-center gap-x-2 text-xs text-slate-400 mt-0.5">
                          {item.note ? (
                            <span className="truncate max-w-[200px] md:max-w-xs text-slate-300 font-medium">
                              {item.note}
                            </span>
                          ) : (
                            <span className="italic text-slate-500">No note</span>
                          )}
                          <span className="text-slate-600">•</span>
                          <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] shrink-0">
                            <Calendar className="h-3 w-3" />
                            {formatDateDisplay(item.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-[#00d68f] whitespace-nowrap">
                          +{formatCurrency(item.amount)}
                        </span>
                      </div>

                      {/* Desktop action buttons */}
                      <div className="hidden sm:flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditIncome(item)}
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#15223c]"
                          title="Edit Income"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingIncome(item)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                          title="Delete Income"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Subline */}
                  <div className="sm:hidden mt-2 pt-2 border-t border-[#142038] flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                      {item.note ? (
                        <span className="text-slate-300 font-medium truncate text-xs">
                          {item.note}
                        </span>
                      ) : (
                        <span className="italic text-slate-500 text-[11px]">No note</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                        <Calendar className="h-3 w-3" />
                        {formatDateDisplay(item.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditIncome(item)}
                        className="h-7 w-7 text-slate-400 hover:text-white hover:bg-[#15223c]"
                        title="Edit Income"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingIncome(item)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                        title="Delete Income"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        isOpen={!!deletingIncome}
        onOpenChange={(open) => {
          if (!open) setDeletingIncome(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Income Entry?"
        description={
          deletingIncome
            ? `Are you sure you want to delete this ${deletingIncome.source} income entry of ${formatCurrency(
                deletingIncome.amount
              )}? This cannot be undone.`
            : "Are you sure you want to delete this income entry?"
        }
      />
    </>
  );
}

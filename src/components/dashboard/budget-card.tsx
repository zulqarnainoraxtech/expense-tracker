"use client";

import { useState } from "react";
import { AlertCircle, Target, SlidersHorizontal, Plus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  budget?: number;
  totalExpenses: number;
  displayMonth: string;
  onSetBudget: (amount: number | undefined) => void;
}

export function BudgetCard({
  budget,
  totalExpenses,
  displayMonth,
  onSetBudget,
}: BudgetCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputVal, setInputVal] = useState(budget ? String(budget) : "");
  const [error, setError] = useState<string | null>(null);

  const hasBudget = budget !== undefined && budget > 0;
  const remaining = hasBudget ? budget - totalExpenses : 0;
  const isExceeded = hasBudget && totalExpenses > budget;
  const percentUsed = hasBudget ? (totalExpenses / budget) * 100 : 0;

  const handleOpen = () => {
    setInputVal(budget ? String(budget) : "");
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      onSetBudget(undefined);
      setIsDialogOpen(false);
      return;
    }

    const parsed = parseFloat(inputVal);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid positive budget amount.");
      return;
    }

    onSetBudget(parsed);
    setIsDialogOpen(false);
  };

  const handleClearBudget = () => {
    onSetBudget(undefined);
    setIsDialogOpen(false);
  };

  let progressColor = "bg-[#00d68f]";
  if (percentUsed >= 100) {
    progressColor = "bg-[#f43f5e]";
  } else if (percentUsed >= 80) {
    progressColor = "bg-amber-400";
  }

  return (
    <>
      <Card className="border-[#1b2844] bg-[#0c1424]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  Monthly Budget
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target spending for {displayMonth}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpen}
              className="h-8 text-xs font-semibold gap-1.5 border-[#203154] bg-[#0c1424] text-slate-200 hover:bg-[#15223c]"
            >
              {hasBudget ? (
                <>
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Adjust</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Set Budget</span>
                </>
              )}
            </Button>
          </div>

          {!hasBudget ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#1e2c4a] bg-[#090f1d] p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Info className="h-4 w-4 text-blue-400 shrink-0" />
                <span>No monthly spending target set for {displayMonth}.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpen}
                className="mt-3 text-xs font-semibold border-[#203154] bg-[#0c1424] text-slate-200 hover:bg-[#15223c]"
              >
                + Set Monthly Budget
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {Math.round(percentUsed)}% spent
                </span>
                <span className="text-slate-400">
                  {formatCurrency(totalExpenses)} of {formatCurrency(budget)}
                </span>
              </div>

              <Progress
                value={Math.min(percentUsed, 100)}
                indicatorClassName={progressColor}
                className="h-2.5 bg-[#142038]"
              />

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#16233c] text-center">
                <div className="p-2.5 rounded-xl bg-[#090f1d] border border-[#142038]">
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">
                    Budget
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {formatCurrency(budget)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#090f1d] border border-[#142038]">
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">
                    Spent
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>

                <div
                  className={cn(
                    "p-2.5 rounded-xl border",
                    isExceeded
                      ? "bg-rose-950/30 border-rose-900/50 text-rose-300"
                      : "bg-emerald-950/30 border-emerald-900/50 text-[#00d68f]"
                  )}
                >
                  <span className="text-[10px] block font-medium uppercase">
                    {isExceeded ? "Over Budget" : "Remaining"}
                  </span>
                  <span className="text-xs sm:text-sm font-bold">
                    {isExceeded
                      ? formatCurrency(Math.abs(remaining))
                      : formatCurrency(remaining)}
                  </span>
                </div>
              </div>

              {isExceeded && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-950/30 border border-rose-800/40 p-2.5 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>
                    Warning: Monthly budget exceeded by{" "}
                    <strong>{formatCurrency(Math.abs(remaining))}</strong>.
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set/Edit Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Monthly Budget for {displayMonth}</DialogTitle>
              <DialogDescription>
                Set a monthly spending limit in Pakistani Rupees. Leave empty or click Remove to disable.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="budget-input">Target Budget (PKR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">
                  Rs.
                </span>
                <Input
                  id="budget-input"
                  type="number"
                  step="any"
                  placeholder="e.g. 50000"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pl-9"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-rose-400">{error}</p>}
            </div>

            <DialogFooter>
              {hasBudget && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearBudget}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 mr-auto text-xs"
                >
                  Remove Budget
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="text-xs">
                Save Target
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

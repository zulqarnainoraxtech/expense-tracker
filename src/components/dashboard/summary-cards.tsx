"use client";

import { Wallet, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  displayMonth: string;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  balance,
  displayMonth,
}: SummaryCardsProps) {
  const isPositiveBalance = balance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Income Card - Dark Emerald Gradient */}
      <div className="relative overflow-hidden rounded-2xl border border-[#13433a] bg-gradient-to-br from-[#0c2824] via-[#091f1c] to-[#061513] p-5 shadow-lg shadow-emerald-950/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#00d68f] text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 block">
                Total Income
              </span>
              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                {formatCurrency(totalIncome)}
              </div>
            </div>
          </div>

          <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-[#00d68f] flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>Inflow for {displayMonth}</span>
        </div>
      </div>

      {/* Total Expenses Card - Dark Crimson Gradient */}
      <div className="relative overflow-hidden rounded-2xl border border-[#4a182f] bg-gradient-to-br from-[#2a0e1b] via-[#200a14] to-[#15060e] p-5 shadow-lg shadow-rose-950/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#f43f5e] text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300/90 block">
                Total Expenses
              </span>
              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
          </div>

          <div className="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          <ArrowDownRight className="h-3.5 w-3.5" />
          <span>Outflow for {displayMonth}</span>
        </div>
      </div>

      {/* Remaining Balance Card - Dark Royal Navy Gradient */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-5 shadow-lg",
          isPositiveBalance
            ? "border border-[#23335e] bg-gradient-to-br from-[#121b38] via-[#0d142b] to-[#080d1f] shadow-indigo-950/30"
            : "border border-rose-900/60 bg-gradient-to-br from-[#2a0e1b] to-[#15060e]"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-md",
                isPositiveBalance
                  ? "bg-[#6366f1] text-white shadow-indigo-500/25"
                  : "bg-rose-600 text-white shadow-rose-500/25"
              )}
            >
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/90 block">
                Remaining Balance
              </span>
              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                {formatCurrency(balance)}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "h-8 w-8 rounded-xl border flex items-center justify-center",
              isPositiveBalance
                ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"
                : "bg-rose-500/15 border-rose-500/25 text-rose-400"
            )}
          >
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          {isPositiveBalance ? (
            <span className="inline-flex items-center text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-[#00d68f] mr-1.5 animate-pulse" />
              Net positive savings
            </span>
          ) : (
            <span className="inline-flex items-center text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 mr-1.5" />
              Deficit: Expenses exceed income
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

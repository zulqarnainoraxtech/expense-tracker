"use client";

import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wallet,
  Settings,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthlyHeaderProps {
  displayMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  onOpenSettings: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export function MonthlyHeader({
  displayMonth,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onOpenSettings,
  onAddExpense,
  onAddIncome,
}: MonthlyHeaderProps) {
  return (
    <header className="border-b border-[#142038] bg-[#080e1a]/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-[#00d68f] text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                  Expense Tracker
                </h1>
                <p className="text-xs text-slate-400">
                  Monthly personal finance & budgeting
                </p>
              </div>
            </div>

            {/* Mobile Settings Icon */}
            <div className="md:hidden flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                title="Data & Backup Settings"
                className="h-9 w-9 text-slate-400"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Month Navigation & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-2.5 w-full sm:w-auto">
            {/* Month Navigator Pill - full width on mobile, auto on desktop */}
            <div className="flex sm:inline-flex items-center justify-between sm:justify-start rounded-xl border border-[#203154] bg-[#0c1424] p-1 shadow-xs w-full sm:w-auto">
              <button
                type="button"
                onClick={onPrevMonth}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#15223c] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Month</span>
              </button>

              <button
                type="button"
                onClick={onCurrentMonth}
                className="flex-1 sm:flex-initial px-3 py-1 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="Click to jump to current month"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{displayMonth}</span>
              </button>

              <button
                type="button"
                onClick={onNextMonth}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#15223c] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Month</span>
              </button>
            </div>

            {/* Action buttons - 50% width each on mobile, auto on desktop */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSettings}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 border-[#203154] bg-[#0c1424]"
                title="Backup & Restore Data"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Settings</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onAddIncome}
                className="w-full sm:w-auto text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-[#00d68f] hover:bg-emerald-500/20 hover:text-[#00e676]"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" />
                <span>Income</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={onAddExpense}
                className="w-full sm:w-auto text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" />
                <span>Expense</span>
              </Button>

              <div className="hidden sm:flex h-9 w-9 rounded-xl border border-[#203154] bg-[#0c1424] text-slate-300 items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

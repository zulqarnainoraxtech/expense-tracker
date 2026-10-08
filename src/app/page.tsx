"use client";

import { useState } from "react";
import { ReceiptText, WalletCards, AlertTriangle, RefreshCw } from "lucide-react";
import { useExpenseTracker } from "@/hooks/use-expense-tracker";
import { MonthlyHeader } from "@/components/dashboard/monthly-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";
import { IncomeList } from "@/components/income/income-list";
import { IncomeFormDialog } from "@/components/income/income-form-dialog";
import { BackupDialog } from "@/components/settings/backup-dialog";
import { Expense, Income } from "@/types/expense";

export default function Home() {
  const {
    isLoaded,
    dbError,
    refreshData,
    currentMonth,
    displayMonth,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    expenses,
    income,
    budget,
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    setBudget,
    exportBackupJSON,
    importBackupJSON,
  } = useExpenseTracker();

  // Active view tab: "expenses" or "income"
  const [activeTab, setActiveTab] = useState<"expenses" | "income">("expenses");

  // Modal dialog states
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Expense Handlers
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseDialogOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  const handleExpenseSubmit = async (expenseData: Omit<Expense, "id" | "createdAt">) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData);
    } else {
      await addExpense(expenseData);
    }
  };

  // Income Handlers
  const handleOpenAddIncome = () => {
    setEditingIncome(null);
    setIsIncomeDialogOpen(true);
  };

  const handleOpenEditIncome = (inc: Income) => {
    setEditingIncome(inc);
    setIsIncomeDialogOpen(true);
  };

  const handleIncomeSubmit = async (incomeData: Omit<Income, "id" | "createdAt">) => {
    if (editingIncome) {
      await updateIncome(editingIncome.id, incomeData);
    } else {
      await addIncome(incomeData);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00d68f] border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Connecting to MongoDB Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080e1a] text-slate-100 pb-20 sm:pb-12">
      {/* Top Header */}
      <MonthlyHeader
        displayMonth={displayMonth}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onCurrentMonth={goToCurrentMonth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onAddExpense={handleOpenAddExpense}
        onAddIncome={handleOpenAddIncome}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Database Connection Warning Banner if DB Error */}
        {dbError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-rose-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-200">MongoDB Atlas Connection Error</p>
                <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">{dbError}</p>
              </div>
            </div>
            <button
              onClick={() => refreshData()}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* 3 Summary Cards with rich color gradients */}
        <SummaryCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
          displayMonth={displayMonth}
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Primary Transactions (Expenses / Income) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Switcher Tabs taking full width */}
            <div className="w-full grid grid-cols-2 rounded-xl bg-[#0c1424] border border-[#1b2844] p-1 shadow-xs gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("expenses")}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "expenses"
                    ? "bg-[#1d4ed8] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ReceiptText className="h-3.5 w-3.5" />
                <span>Expenses ({expenses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("income")}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "income"
                    ? "bg-[#1d4ed8] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <WalletCards className="h-3.5 w-3.5" />
                <span>Income ({income.length})</span>
              </button>
            </div>

            {/* List for Active Tab */}
            {activeTab === "expenses" ? (
              <ExpenseList
                expenses={expenses}
                onAddExpense={handleOpenAddExpense}
                onEditExpense={handleOpenEditExpense}
                onDeleteExpense={deleteExpense}
                displayMonth={displayMonth}
              />
            ) : (
              <IncomeList
                incomeList={income}
                totalIncome={totalIncome}
                onAddIncome={handleOpenAddIncome}
                onEditIncome={handleOpenEditIncome}
                onDeleteIncome={deleteIncome}
                displayMonth={displayMonth}
              />
            )}
          </div>

          {/* Right Column: Monthly Budget & Category Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Monthly Budget Card */}
            <BudgetCard
              budget={budget}
              totalExpenses={totalExpenses}
              displayMonth={displayMonth}
              onSetBudget={setBudget}
            />

            {/* Recharts Donut Breakdown Card */}
            <ExpenseBreakdown
              breakdown={categoryBreakdown}
              totalExpenses={totalExpenses}
              onAddExpense={handleOpenAddExpense}
            />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <ExpenseFormDialog
        isOpen={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        onSubmit={handleExpenseSubmit}
        editingExpense={editingExpense}
        defaultDate={currentMonth}
      />

      <IncomeFormDialog
        isOpen={isIncomeDialogOpen}
        onOpenChange={setIsIncomeDialogOpen}
        onSubmit={handleIncomeSubmit}
        editingIncome={editingIncome}
        defaultDate={currentMonth}
      />

      <BackupDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onExport={exportBackupJSON}
        onImport={importBackupJSON}
      />
    </div>
  );
}

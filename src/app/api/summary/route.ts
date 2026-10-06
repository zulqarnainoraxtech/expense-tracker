import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/Expense";
import { IncomeModel } from "@/models/Income";
import { BudgetModel } from "@/models/Budget";

// GET /api/summary?month=2026-10 (returns aggregated month figures)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: "Valid month query parameter (YYYY-MM) is required" },
        { status: 400 }
      );
    }

    const [expenses, income, budgetRecord] = await Promise.all([
      ExpenseModel.find({ date: { $regex: `^${month}` } }).sort({ date: -1, createdAt: -1 }),
      IncomeModel.find({ date: { $regex: `^${month}` } }).sort({ date: -1, createdAt: -1 }),
      BudgetModel.findOne({ month }),
    ]);

    const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalIncome = income.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const balance = totalIncome - totalExpenses;
    const budget = budgetRecord ? budgetRecord.amount : undefined;

    return NextResponse.json({
      success: true,
      data: {
        month,
        expenses,
        income,
        budget,
        totalExpenses,
        totalIncome,
        balance,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate monthly summary";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

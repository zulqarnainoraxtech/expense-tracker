import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/Expense";
import { IncomeModel } from "@/models/Income";
import { BudgetModel } from "@/models/Budget";

// GET /api/sync - retrieves full backup / tracker data format
export async function GET() {
  try {
    await connectToDatabase();
    const [expenses, income, budgets] = await Promise.all([
      ExpenseModel.find({}),
      IncomeModel.find({}),
      BudgetModel.find({}),
    ]);

    const result: Record<string, { expenses: unknown[]; income: unknown[]; budget?: number }> = {};

    for (const b of budgets) {
      if (!result[b.month]) {
        result[b.month] = { expenses: [], income: [], budget: b.amount };
      } else {
        result[b.month].budget = b.amount;
      }
    }

    for (const e of expenses) {
      const month = e.date.slice(0, 7);
      if (!result[month]) {
        result[month] = { expenses: [], income: [] };
      }
      result[month].expenses.push(e);
    }

    for (const i of income) {
      const month = i.date.slice(0, 7);
      if (!result[month]) {
        result[month] = { expenses: [], income: [] };
      }
      result[month].income.push(i);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load database data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/sync - bulk sync / import data from client into MongoDB
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json({ success: false, error: "Invalid data payload" }, { status: 400 });
    }

    let insertedExpensesCount = 0;
    let insertedIncomeCount = 0;

    for (const [monthKey, mData] of Object.entries(data as Record<string, { expenses?: Array<{ amount: number; category: string; date: string; note?: string }>; income?: Array<{ amount: number; source: string; date: string; note?: string }>; budget?: number }>)) {
      if (mData.budget !== undefined) {
        await BudgetModel.findOneAndUpdate(
          { month: monthKey },
          { month: monthKey, amount: mData.budget },
          { upsert: true }
        );
      }

      if (Array.isArray(mData.expenses)) {
        for (const exp of mData.expenses) {
          await ExpenseModel.create({
            amount: exp.amount,
            category: exp.category,
            date: exp.date,
            note: exp.note || "",
          });
          insertedExpensesCount++;
        }
      }

      if (Array.isArray(mData.income)) {
        for (const inc of mData.income) {
          await IncomeModel.create({
            amount: inc.amount,
            source: inc.source,
            date: inc.date,
            note: inc.note || "",
          });
          insertedIncomeCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced successfully (${insertedExpensesCount} expenses, ${insertedIncomeCount} incomes)`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sync data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

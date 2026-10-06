import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { BudgetModel } from "@/models/Budget";

// GET /api/budget?month=2026-10
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month) {
      const allBudgets = await BudgetModel.find({});
      return NextResponse.json({ success: true, data: allBudgets });
    }

    const budget = await BudgetModel.findOne({ month });
    return NextResponse.json({ success: true, data: budget });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch budget";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/budget - upsert budget for a month
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { month, amount } = body;

    if (!month || amount === undefined) {
      return NextResponse.json(
        { success: false, error: "month and amount are required" },
        { status: 400 }
      );
    }

    const updated = await BudgetModel.findOneAndUpdate(
      { month },
      { month, amount: Number(amount) },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save budget";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

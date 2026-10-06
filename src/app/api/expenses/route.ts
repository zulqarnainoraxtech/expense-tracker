import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/Expense";

// GET /api/expenses?month=2026-10 or /api/expenses
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    const query: Record<string, unknown> = {};
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query.date = { $regex: `^${month}` };
    }

    const expenses = await ExpenseModel.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expenses";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { amount, category, date, note } = body;
    if (!amount || !category || !date) {
      return NextResponse.json(
        { success: false, error: "amount, category, and date are required" },
        { status: 400 }
      );
    }

    const created = await ExpenseModel.create({
      amount: Number(amount),
      category,
      date,
      note: note || "",
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create expense";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { IncomeModel } from "@/models/Income";

// GET /api/income?month=2026-10
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    const query: Record<string, unknown> = {};
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query.date = { $regex: `^${month}` };
    }

    const income = await IncomeModel.find(query).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: income });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch income";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/income
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { amount, source, date, note } = body;
    if (!amount || !source || !date) {
      return NextResponse.json(
        { success: false, error: "amount, source, and date are required" },
        { status: 400 }
      );
    }

    const created = await IncomeModel.create({
      amount: Number(amount),
      source,
      date,
      note: note || "",
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create income";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

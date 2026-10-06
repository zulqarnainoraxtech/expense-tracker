import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { IncomeModel } from "@/models/Income";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/income/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 });
    }

    const body = await request.json();
    const updated = await IncomeModel.findByIdAndUpdate(
      id,
      {
        ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
        ...(body.source !== undefined ? { source: body.source } : {}),
        ...(body.date !== undefined ? { date: body.date } : {}),
        ...(body.note !== undefined ? { note: body.note } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Income not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update income";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/income/[id]
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 });
    }

    const deleted = await IncomeModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Income not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Income deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete income";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBudgetDoc extends Document {
  month: string; // YYYY-MM
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudgetDoc>(
  {
    month: {
      type: String,
      required: [true, "Month (YYYY-MM) is required"],
      unique: true,
      match: [/^\d{4}-\d{2}$/, "Month must follow YYYY-MM format"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0, "Budget cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const BudgetModel: Model<IBudgetDoc> =
  mongoose.models.Budget || mongoose.model<IBudgetDoc>("Budget", BudgetSchema);

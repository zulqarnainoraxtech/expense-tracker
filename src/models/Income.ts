import mongoose, { Schema, Model, Document } from "mongoose";

export interface IIncomeDoc extends Document {
  amount: number;
  source: string;
  date: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncomeDoc>(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    source: {
      type: String,
      required: [true, "Income source is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD format"],
      index: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
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

export const IncomeModel: Model<IIncomeDoc> =
  mongoose.models.Income || mongoose.model<IIncomeDoc>("Income", IncomeSchema);

"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryConfig } from "@/lib/categories";
import { formatCurrency } from "@/lib/currency";

interface BreakdownItem {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

interface ExpenseBreakdownProps {
  breakdown: BreakdownItem[];
  totalExpenses: number;
  onAddExpense?: () => void;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    category: string;
    total: number;
    percentage: number;
    color: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-[#1e2c4a] bg-[#0c1424] p-3 shadow-xl text-xs">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-white">
            {item.category}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4">
          <span className="text-slate-400">Spending:</span>
          <span className="font-bold text-white">
            {formatCurrency(item.total)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-slate-400">Share:</span>
          <span className="font-bold text-[#00d68f]">
            {item.percentage}%
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function ExpenseBreakdown({
  breakdown,
  totalExpenses,
  onAddExpense,
}: ExpenseBreakdownProps) {
  const chartData = useMemo(() => {
    return breakdown.map((item) => {
      const config = getCategoryConfig(item.category);
      return {
        name: item.category,
        category: item.category,
        total: item.total,
        percentage: item.percentage,
        color: config.color,
      };
    });
  }, [breakdown]);

  return (
    <Card className="border-[#1b2844] bg-[#0c1424] flex flex-col">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center">
              <PieChartIcon className="h-3.5 w-3.5" />
            </div>
            <span>Expense Breakdown</span>
          </CardTitle>
          <span className="text-xs text-slate-400">
            {breakdown.length} {breakdown.length === 1 ? "category" : "categories"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
        {breakdown.length === 0 ? (
          <div className="my-auto py-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#111c32] flex items-center justify-center text-slate-500 mb-3 border border-[#1b2844]">
              <PieChartIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              No expenses recorded
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add your first expense for this month to see the category breakdown.
            </p>
            {onAddExpense && (
              <button
                type="button"
                onClick={onAddExpense}
                className="mt-3 text-xs font-bold text-[#00d68f] hover:underline cursor-pointer"
              >
                + Add Expense
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Donut Chart */}
            <div className="relative h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="#0c1424"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Indicator */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total
                </span>
                <span className="text-base font-black text-white px-2 leading-tight mt-0.5">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>

            {/* Category spending list with progress bars matching design */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {breakdown.map((item) => {
                const config = getCategoryConfig(item.category);
                const Icon = config.icon;

                return (
                  <div
                    key={item.category}
                    className="flex items-center space-x-3.5 group"
                  >
                    {/* Category Icon Badge */}
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs"
                      style={{
                        backgroundColor: `${config.color}20`,
                        borderColor: `${config.color}40`,
                        color: config.color,
                      }}
                      title={item.category}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Category Name, Amount, Percentage, and Progress Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-white truncate pr-2">
                          {item.category}
                        </span>

                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="font-bold text-white">
                            {formatCurrency(item.total)}
                          </span>
                          <span className="font-semibold text-slate-400 min-w-[42px] text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Track */}
                      <div className="h-2 w-full rounded-full bg-[#121d33] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min(Math.max(item.percentage, 2), 100)}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

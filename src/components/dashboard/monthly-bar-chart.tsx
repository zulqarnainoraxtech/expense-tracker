"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  ChevronRight,
  ArrowLeftRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseTrackerData } from "@/types/expense";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface MonthlyBarChartProps {
  allData: ExpenseTrackerData;
  currentMonth: string;
  onSelectMonth?: (monthKey: string) => void;
}

type TimeRange = "6m" | "12m" | "all";
type ChartMode = "comparison" | "net";

interface MonthlyDataPoint {
  monthKey: string;
  shortMonth: string;
  fullMonth: string;
  income: number;
  expenses: number;
  net: number;
  budget?: number;
  isCurrent: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    payload: MonthlyDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const isNetPositive = data.net >= 0;

    return (
      <div className="rounded-xl border border-[#1e2c4a] bg-[#0c1424]/95 backdrop-blur-md p-3.5 shadow-2xl text-xs min-w-[210px] space-y-2">
        <div className="flex items-center justify-between border-b border-[#1b2844] pb-2">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            <span>{data.fullMonth}</span>
          </div>
          {data.isCurrent && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Active Month
            </span>
          )}
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00d68f]" />
              Income:
            </span>
            <span className="font-bold text-[#00d68f]">
              {formatCurrency(data.income)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f43f5e]" />
              Expenses:
            </span>
            <span className="font-bold text-[#f43f5e]">
              {formatCurrency(data.expenses)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#1b2844]/60">
            <span className="text-slate-400">Net Cash Flow:</span>
            <span
              className={cn(
                "font-bold",
                isNetPositive ? "text-[#00d68f]" : "text-rose-400"
              )}
            >
              {formatCurrency(data.net, { showSign: true })}
            </span>
          </div>

          {data.budget !== undefined && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Budget Target:</span>
              <span className="font-semibold text-slate-300">
                {formatCurrency(data.budget)}
              </span>
            </div>
          )}
        </div>

        <p className="text-[10px] text-slate-500 italic pt-1 text-center">
          Click bar to switch to this month
        </p>
      </div>
    );
  }
  return null;
}

export function MonthlyBarChart({
  allData,
  currentMonth,
  onSelectMonth,
}: MonthlyBarChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [chartMode, setChartMode] = useState<ChartMode>("comparison");

  // Generate continuous list of months starting only from recorded data
  const monthlyData = useMemo(() => {
    const keysSet = new Set<string>();

    // Only include months that actually have recorded data (expenses, income, or budget)
    Object.entries(allData).forEach(([key, monthObj]) => {
      const expSum = (monthObj.expenses || []).reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      const incSum = (monthObj.income || []).reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      const hasBudget = typeof monthObj.budget === "number" && monthObj.budget > 0;
      if (expSum > 0 || incSum > 0 || hasBudget) {
        keysSet.add(key);
      }
    });

    // Always include the currently viewed/active month
    keysSet.add(currentMonth);

    // If there are multiple months with data, fill any gaps between earliest and latest
    const recordedKeys = Array.from(keysSet).sort();
    if (recordedKeys.length > 1) {
      const firstKey = recordedKeys[0];
      const lastKey = recordedKeys[recordedKeys.length - 1];
      const [startY, startM] = firstKey.split("-").map(Number);
      const [endY, endM] = lastKey.split("-").map(Number);

      const cur = new Date(startY, startM - 1, 1);
      const end = new Date(endY, endM - 1, 1);
      while (cur <= end) {
        const yStr = cur.getFullYear();
        const mStr = String(cur.getMonth() + 1).padStart(2, "0");
        keysSet.add(`${yStr}-${mStr}`);
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    // Sort chronologically
    const sortedKeys = Array.from(keysSet).sort();

    // Map each month key into full metrics
    const fullList: MonthlyDataPoint[] = sortedKeys.map((key) => {
      const monthObj = allData[key] || { expenses: [], income: [] };
      const expSum = (monthObj.expenses || []).reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      const incSum = (monthObj.income || []).reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      const [y, m] = key.split("-").map(Number);
      const date = new Date(y, m - 1, 1);

      const shortMonth = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const fullMonth = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      return {
        monthKey: key,
        shortMonth,
        fullMonth,
        income: incSum,
        expenses: expSum,
        net: incSum - expSum,
        budget: monthObj.budget,
        isCurrent: key === currentMonth,
      };
    });

    return fullList;
  }, [allData, currentMonth]);

  // Apply time range filter
  const filteredData = useMemo(() => {
    if (timeRange === "6m") {
      return monthlyData.slice(-6);
    }
    if (timeRange === "12m") {
      return monthlyData.slice(-12);
    }
    return monthlyData;
  }, [monthlyData, timeRange]);

  // Range summary metrics
  const rangeStats = useMemo(() => {
    const totalInc = filteredData.reduce((acc, d) => acc + d.income, 0);
    const totalExp = filteredData.reduce((acc, d) => acc + d.expenses, 0);
    const netSavings = totalInc - totalExp;
    const avgMonthlyExpense =
      filteredData.length > 0 ? Math.round(totalExp / filteredData.length) : 0;

    return {
      totalInc,
      totalExp,
      netSavings,
      avgMonthlyExpense,
    };
  }, [filteredData]);

  const hasAnyData = useMemo(() => {
    return filteredData.some((d) => d.income > 0 || d.expenses > 0);
  }, [filteredData]);

  return (
    <Card className="border-[#1b2844] bg-[#0c1424] overflow-hidden shadow-lg">
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-[#00d68f] flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span>Monthly Cash Flow & Spending History</span>
            </CardTitle>
            <p className="text-xs text-slate-400">
              Compare monthly income, total expenses, and net savings over time.
            </p>
          </div>

          {/* Controls: Mode & Time Range Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="w-full sm:w-auto grid grid-cols-2 rounded-xl bg-[#080e1a] border border-[#1b2844] p-1 text-xs gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setChartMode("comparison")}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center",
                  chartMode === "comparison"
                    ? "bg-[#1d4ed8] text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Inflow/Outflow</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode("net")}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center",
                  chartMode === "net"
                    ? "bg-[#1d4ed8] text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                <PiggyBank className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Net Savings</span>
              </button>
            </div>

            {/* Time Range Selector */}
            {/* <div className="w-full sm:w-auto grid grid-cols-3 rounded-xl bg-[#080e1a] border border-[#1b2844] p-1 text-xs gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setTimeRange("6m")}
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center",
                  timeRange === "6m"
                    ? "bg-[#1d4ed8] text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                6M
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("12m")}
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center",
                  timeRange === "12m"
                    ? "bg-[#1d4ed8] text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                12M
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("all")}
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center",
                  timeRange === "all"
                    ? "bg-[#1d4ed8] text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                All
              </button>
            </div> */}
          </div>
        </div>

        {/* Quick Range Stats Summary Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1b2844]/60">
          <div className="rounded-xl bg-[#080e1a]/60 border border-[#1b2844]/40 p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Inflow 
              {/* ({timeRange.toUpperCase()}) */}
            </span>
            <span className="text-sm font-extrabold text-[#00d68f] mt-0.5 block truncate">
              {formatCurrency(rangeStats.totalInc)}
            </span>
          </div>

          <div className="rounded-xl bg-[#080e1a]/60 border border-[#1b2844]/40 p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Outflow 
              {/* ({timeRange.toUpperCase()}) */}
            </span>
            <span className="text-sm font-extrabold text-[#f43f5e] mt-0.5 block truncate">
              {formatCurrency(rangeStats.totalExp)}
            </span>
          </div>

          <div className="rounded-xl bg-[#080e1a]/60 border border-[#1b2844]/40 p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Net Savings
               {/* ({timeRange.toUpperCase()}) */}
            </span>
            <span
              className={cn(
                "text-sm font-extrabold mt-0.5 block truncate",
                rangeStats.netSavings >= 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {formatCurrency(rangeStats.netSavings, { showSign: true })}
            </span>
          </div>

          <div className="rounded-xl bg-[#080e1a]/60 border border-[#1b2844]/40 p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Avg. Monthly Outflow
            </span>
            <span className="text-sm font-extrabold text-slate-200 mt-0.5 block truncate">
              {formatCurrency(rangeStats.avgMonthlyExpense)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        {!hasAnyData ? (
          <div className="py-14 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#111c32] flex items-center justify-center text-slate-500 mb-3 border border-[#1b2844]">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              No historical data in this range
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add income or expenses in your dashboard to view your monthly cash flow progression and comparisons.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Legend & Interactive notice */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-4">
                {chartMode === "comparison" ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#00d68f]" />
                      <span className="text-slate-300 font-medium">Income</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#f43f5e]" />
                      <span className="text-slate-300 font-medium">Expenses</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#00d68f]" />
                      <span className="text-slate-300 font-medium">Net Surplus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#f43f5e]" />
                      <span className="text-slate-300 font-medium">Net Deficit</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                <span>Highlighted bar indicates currently active month</span>
              </div>
            </div>

            {/* Responsive Bar Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 12, right: 12, left: -8, bottom: 4 }}
                  onClick={(e: unknown) => {
                    const eventData = e as { activePayload?: Array<{ payload?: MonthlyDataPoint }> } | null;
                    const clickedKey = eventData?.activePayload?.[0]?.payload?.monthKey;
                    if (clickedKey && onSelectMonth) {
                      onSelectMonth(clickedKey);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1b2844"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortMonth"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1b2844" }}
                    dy={4}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1b2844" }}
                    tickFormatter={(value) => {
                      if (Math.abs(value) >= 1000000) {
                        return `${(value / 1000000).toFixed(1)}M`;
                      }
                      if (Math.abs(value) >= 1000) {
                        return `${(value / 1000).toFixed(0)}k`;
                      }
                      return `${value}`;
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                  />

                  {chartMode === "comparison" ? (
                    <>
                      <Bar
                        dataKey="income"
                        name="Income"
                        fill="#00d68f"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      >
                        {filteredData.map((entry, index) => (
                          <Cell
                            key={`inc-cell-${index}`}
                            fill={entry.isCurrent ? "#00f0a0" : "#00d68f"}
                            stroke={entry.isCurrent ? "#ffffff" : "none"}
                            strokeWidth={entry.isCurrent ? 1.5 : 0}
                          />
                        ))}
                      </Bar>

                      <Bar
                        dataKey="expenses"
                        name="Expenses"
                        fill="#f43f5e"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      >
                        {filteredData.map((entry, index) => (
                          <Cell
                            key={`exp-cell-${index}`}
                            fill={entry.isCurrent ? "#fb7185" : "#f43f5e"}
                            stroke={entry.isCurrent ? "#ffffff" : "none"}
                            strokeWidth={entry.isCurrent ? 1.5 : 0}
                          />
                        ))}
                      </Bar>
                    </>
                  ) : (
                    <Bar
                      dataKey="net"
                      name="Net Savings"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={38}
                    >
                      {filteredData.map((entry, index) => {
                        const baseColor = entry.net >= 0 ? "#00d68f" : "#f43f5e";
                        return (
                          <Cell
                            key={`net-cell-${index}`}
                            fill={baseColor}
                            stroke={entry.isCurrent ? "#ffffff" : "none"}
                            strokeWidth={entry.isCurrent ? 1.5 : 0}
                          />
                        );
                      })}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Month Quick-Select Pills footer */}
            <div className="pt-2 border-t border-[#1b2844]/60 flex items-center justify-between flex-wrap gap-2 text-xs">
              {/* <span className="text-slate-400 font-medium">Quick Jump:</span> */}
              <div className="flex flex-wrap items-center gap-1.5">
                {filteredData.map((item) => (
                  <button
                    key={item.monthKey}
                    type="button"
                    onClick={() => onSelectMonth && onSelectMonth(item.monthKey)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1",
                      item.isCurrent
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-[#080e1a] text-slate-400 hover:text-white border border-[#1b2844] hover:border-slate-700"
                    )}
                  >
                    <span>{item.shortMonth}</span>
                    {item.isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

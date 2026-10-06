import { Expense, Income, ExpenseTrackerData } from "@/types/expense";

export async function fetchExpensesApi(month?: string): Promise<Expense[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const res = await fetch(`/api/expenses${query}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to fetch expenses");
  return json.data;
}

export async function createExpenseApi(data: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to create expense");
  return json.data;
}

export async function updateExpenseApi(id: string, data: Partial<Omit<Expense, "id" | "createdAt">>): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to update expense");
  return json.data;
}

export async function deleteExpenseApi(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to delete expense");
}

export async function fetchIncomeApi(month?: string): Promise<Income[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const res = await fetch(`/api/income${query}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to fetch income");
  return json.data;
}

export async function createIncomeApi(data: Omit<Income, "id" | "createdAt">): Promise<Income> {
  const res = await fetch("/api/income", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to create income");
  return json.data;
}

export async function updateIncomeApi(id: string, data: Partial<Omit<Income, "id" | "createdAt">>): Promise<Income> {
  const res = await fetch(`/api/income/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to update income");
  return json.data;
}

export async function deleteIncomeApi(id: string): Promise<void> {
  const res = await fetch(`/api/income/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to delete income");
}

export async function saveBudgetApi(month: string, amount: number): Promise<void> {
  const res = await fetch("/api/budget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month, amount }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to save budget");
}

export async function fetchAllSyncDataApi(): Promise<ExpenseTrackerData> {
  const res = await fetch("/api/sync");
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to load database data");
  return json.data;
}

export async function syncAllDataToApi(data: ExpenseTrackerData): Promise<void> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to sync data");
}

/**
 * Formats a number to Pakistani Rupees (PKR) representation.
 * Examples:
 *   1500 => "Rs. 1,500"
 *   -500 => "-Rs. 500"
 *   0 => "Rs. 0"
 */
export function formatCurrency(amount: number, options?: { showSign?: boolean }): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString("en-PK", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  if (isNegative) {
    return `-Rs. ${formatted}`;
  }

  if (options?.showSign && amount > 0) {
    return `+Rs. ${formatted}`;
  }

  return `Rs. ${formatted}`;
}

export function parseAmount(value: string | number): number {
  if (typeof value === "number") return value;
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

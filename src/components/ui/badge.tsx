import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

const badgeVariantsMap: Record<BadgeVariant, string> = {
  default:
    "border-transparent bg-neutral-900 text-neutral-50 shadow-xs hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900",
  secondary:
    "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100",
  destructive:
    "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  outline:
    "border border-neutral-200 text-neutral-950 dark:border-neutral-800 dark:text-neutral-50",
  success:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  warning:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function badgeVariants({
  variant = "default",
  className = "",
}: {
  variant?: BadgeVariant;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
    badgeVariantsMap[variant] || badgeVariantsMap.default,
    className
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}

export { Badge };

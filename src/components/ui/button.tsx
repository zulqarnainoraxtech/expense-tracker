import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "primary";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[#1d4ed8] text-white shadow-sm hover:bg-[#2563eb]",
  destructive:
    "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white",
  outline:
    "border border-[#203154] bg-[#0c1424] text-slate-200 hover:bg-[#15223c] hover:text-white shadow-xs",
  secondary:
    "bg-[#15223c] text-slate-200 hover:bg-[#1e2f52] text-white",
  ghost:
    "hover:bg-[#15223c] hover:text-white text-slate-300",
  link: "text-[#00d68f] underline-offset-4 hover:underline",
  primary:
    "bg-[#00d68f] text-slate-950 font-bold shadow-md hover:bg-[#00bf7f] active:bg-[#00a870]",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-11 rounded-xl px-6 text-base",
  icon: "h-9 w-9 p-0",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
    variantStyles[variant] || variantStyles.default,
    sizeStyles[size] || sizeStyles.default,
    className
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

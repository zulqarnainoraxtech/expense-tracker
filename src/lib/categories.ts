import {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  Users,
  User,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";

export interface CategoryConfig {
  name: string;
  icon: LucideIcon;
  color: string; // Hex for recharts and accents
  bgColor: string; // Dark theme pill bg
  textColor: string; // Dark theme text
  borderColor: string;
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  Transport: {
    name: "Transport",
    icon: Car,
    color: "#2563eb", // Royal blue
    bgColor: "bg-blue-600/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  Health: {
    name: "Health",
    icon: HeartPulse,
    color: "#00e676", // Neon mint green
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  Food: {
    name: "Food",
    icon: Utensils,
    color: "#f97316", // Bright orange
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/30",
  },
  Bills: {
    name: "Bills",
    icon: Receipt,
    color: "#f43f5e", // Rose red
    bgColor: "bg-rose-500/20",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
  },
  Shopping: {
    name: "Shopping",
    icon: ShoppingBag,
    color: "#ec4899", // Pink
    bgColor: "bg-pink-500/20",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/30",
  },
  Entertainment: {
    name: "Entertainment",
    icon: Film,
    color: "#a855f7", // Purple
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
  },
  Education: {
    name: "Education",
    icon: GraduationCap,
    color: "#06b6d4", // Cyan
    bgColor: "bg-cyan-500/20",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
  },
  Family: {
    name: "Family",
    icon: Users,
    color: "#eab308", // Yellow
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
  Personal: {
    name: "Personal",
    icon: User,
    color: "#6366f1", // Indigo
    bgColor: "bg-indigo-500/20",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
  },
  Other: {
    name: "Other",
    icon: MoreHorizontal,
    color: "#64748b", // Slate
    bgColor: "bg-slate-700/30",
    textColor: "text-slate-300",
    borderColor: "border-slate-600/30",
  },
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

export function getCategoryConfig(categoryName: string): CategoryConfig {
  return (
    CATEGORIES[categoryName] || {
      name: categoryName,
      icon: MoreHorizontal,
      color: "#64748b",
      bgColor: "bg-slate-700/30",
      textColor: "text-slate-300",
      borderColor: "border-slate-600/30",
    }
  );
}

export const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Side business",
  "Investment",
  "Bonus",
  "Gift",
  "Other",
];

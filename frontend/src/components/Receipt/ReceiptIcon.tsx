import {
  Car,
  Film,
  HeartPulse,
  Plane,
  ReceiptText,
  ShoppingBag,
  ShoppingBasket,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";

export function ReceiptIcon({ category }: { category: string }) {
  // 1. Define the configuration for each category
  const configs: Record<
    string,
    { icon: LucideIcon; colorClass: string; bgClass: string }
  > = {
    groceries: {
      icon: ShoppingBasket,
      colorClass: "text-green-400",
      bgClass: "bg-green-100",
    },
    restaurant: {
      icon: UtensilsCrossed,
      colorClass: "text-orange-400",
      bgClass: "bg-orange-100",
    },
    transport: {
      icon: Car,
      colorClass: "text-blue-400",
      bgClass: "bg-blue-100",
    },
    entertainment: {
      icon: Film,
      colorClass: "text-purple-400",
      bgClass: "bg-purple-100",
    },
    health: {
      icon: HeartPulse,
      colorClass: "text-red-400",
      bgClass: "bg-red-100",
    },
    shopping: {
      icon: ShoppingBag,
      colorClass: "text-pink-400",
      bgClass: "bg-pink-100",
    },
    utilities: {
      icon: Zap,
      colorClass: "text-yellow-400",
      bgClass: "bg-yellow-100",
    },
    travel: {
      icon: Plane,
      colorClass: "text-cyan-400",
      bgClass: "bg-cyan-100",
    },
  };

  // 2. Get the config based on the category, or fallback to default
  const {
    icon: Icon,
    colorClass,
    bgClass,
  } = configs[category.toLowerCase()] || {
    icon: ReceiptText,
    colorClass: "text-slate-600",
    bgClass: "bg-slate-100",
  };

  return (
    <div
      className={`${bgClass} p-2.5 rounded-lg inline-flex items-center justify-center`}
    >
      <Icon className={`${colorClass} size-5 stroke-2`} />
    </div>
  );
}

import { fetchReceipts, fetchUserPreferences } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
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
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { Skeleton } from "../ui/skeleton";

export default function Receipts() {
  const { data: receipts, isLoading } = useQuery({
    queryFn: fetchReceipts,
    queryKey: ["receipts"],
  });

  const groupedReceipts = useMemo(() => {
    if (!receipts?.data.receipts) return {};

    return receipts?.data.receipts.reduce(
      (acc, receipt) => {
        let label = "";

        if (isToday(receipt.receipt_date)) {
          label = "TODAY";
        } else if (isYesterday(receipt.receipt_date)) {
          label = "YESTERDAY";
        } else {
          // For older dates, show something like "April 15, 2026"
          label = format(receipt.receipt_date, "MMMM dd, yyyy").toUpperCase();
        }

        if (!acc[label]) {
          acc[label] = [];
        }
        acc[label].push(receipt);

        return acc;
      },
      {} as Record<string, typeof receipts.data.receipts>,
    );
  }, [receipts]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h3 className="text-xs font-semibold text-muted-foreground mb-4 tracking-wider">
          TODAY
        </h3>
        <div className="space-y-3">
          <Skeleton className="w-full h-16 rounded-md" />
          <Skeleton className="w-full h-16 rounded-md" />
        </div>
      </div>
    );
  }

  if (!receipts || receipts?.data.receipts.length === 0) {
    return <ReceiptEmptyState />;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedReceipts).map(([dateLabel, receipts]) => (
        <section key={dateLabel}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 tracking-wider">
            {dateLabel}
          </h3>

          <div className="space-y-3">
            {receipts.map((receipt) => (
              <Receipt
                key={receipt.id}
                merchant={receipt.merchant}
                amount={receipt.amount}
                category={receipt.category}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Receipt({
  merchant,
  category,
  amount,
}: {
  merchant: string;
  category: string;
  amount: number;
}) {
  const { data: preferences } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchUserPreferences,
  });
  return (
    <div className="bg-white flex justify-between items-center p-4 rounded-md">
      <div className="flex items-center gap-4">
        <ReceiptIcon category={category} />
        <div>
          <p className="font-medium capitalize m-0 p-0">{merchant}</p>
          <span className="text-gray-500 capitalize text-sm">{category}</span>
        </div>
      </div>
      <div className="font-medium space-x-0.5">
        <span>-</span>
        <span>{preferences?.data.currency}</span>
        <span>{amount}</span>
      </div>
    </div>
  );
}

function ReceiptIcon({ category }: { category: string }) {
  // 1. Define the configuration for each category
  const configs: Record<
    string,
    { icon: LucideIcon; colorClass: string; bgClass: string }
  > = {
    groceries: {
      icon: ShoppingBasket,
      colorClass: "text-green-600",
      bgClass: "bg-green-100",
    },
    restaurant: {
      icon: UtensilsCrossed,
      colorClass: "text-orange-600",
      bgClass: "bg-orange-100",
    },
    transport: {
      icon: Car,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-100",
    },
    entertainment: {
      icon: Film,
      colorClass: "text-purple-600",
      bgClass: "bg-purple-100",
    },
    health: {
      icon: HeartPulse,
      colorClass: "text-red-600",
      bgClass: "bg-red-100",
    },
    shopping: {
      icon: ShoppingBag,
      colorClass: "text-pink-600",
      bgClass: "bg-pink-100",
    },
    utilities: {
      icon: Zap,
      colorClass: "text-yellow-600",
      bgClass: "bg-yellow-100",
    },
    travel: {
      icon: Plane,
      colorClass: "text-cyan-600",
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
      className={`${bgClass} p-3 rounded-md inline-flex items-center justify-center`}
    >
      <Icon className={`${colorClass} size-5`} />
    </div>
  );
}

function ReceiptEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h3 className="text-lg font-semibold">No receipts yet</h3>
      <p className="max-w-xs mt-1 mb-6 text-sm text-muted-foreground">
        Scan your first receipt to start tracking your spending and getting
        insights.
      </p>
      <Link to="/add-receipt">
        <Button className="gap-2" variant="link">
          Click here to Add Receipt
        </Button>
      </Link>
    </div>
  );
}

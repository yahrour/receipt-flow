import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { fetchReceipts, fetchUserPreferences } from "@/services/api";
import { Spinner } from "../ui/spinner";
import { format } from "date-fns";
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
import { Button } from "../ui/button";
export function ReceiptsTable({
  search,
  category,
  date,
}: {
  search: string | null;
  category: string | null;
  date: Date;
}) {
  const {
    data,
    isLoading: isLoadingReceipts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["receiptsTable", search, category, date],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      fetchReceipts(search, category, date, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage?.data.hasNextPage ? lastPage.data.nextCursor : undefined,
  });

  const receipts =
    data?.pages.flatMap((page) => page?.data.receipts ?? []) ?? [];

  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryFn: fetchUserPreferences,
    queryKey: ["preferences"],
  });

  if (isLoadingReceipts || isLoadingPreferences) {
    return (
      <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <Spinner className="size-7" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-left">Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium text-gray-500">
                  {format(receipt.receipt_date, "MMM dd, yyyy")}
                </TableCell>
                <TableCell
                  className="font-medium capitalize"
                  title={receipt.merchant}
                >
                  {receipt.merchant.slice(0, 20) +
                    (receipt.merchant.length > 20 ? "..." : "")}
                </TableCell>
                <TableCell>
                  <ReceiptIcon category={receipt.category} />
                </TableCell>
                <TableCell className="text-right font-medium space-x-0.5">
                  <span>-</span>
                  <span>{preferences?.data.currency}</span>
                  <span>{receipt.amount}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {receipts.length > 0 && (
        <Button
          variant="outline"
          className="block mx-auto mt-4 cursor-pointer"
          onClick={() => void fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading more..." : "Load More"}
        </Button>
      )}
    </>
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
      colorClass: "text-green-500",
      bgClass: "bg-green-100/50",
    },
    restaurant: {
      icon: UtensilsCrossed,
      colorClass: "text-orange-500",
      bgClass: "bg-orange-100/50",
    },
    transport: {
      icon: Car,
      colorClass: "text-blue-500",
      bgClass: "bg-blue-100/50",
    },
    entertainment: {
      icon: Film,
      colorClass: "text-purple-500",
      bgClass: "bg-purple-100/50",
    },
    health: {
      icon: HeartPulse,
      colorClass: "text-red-500",
      bgClass: "bg-red-100/50",
    },
    shopping: {
      icon: ShoppingBag,
      colorClass: "text-pink-500",
      bgClass: "bg-pink-100/50",
    },
    utilities: {
      icon: Zap,
      colorClass: "text-yellow-500",
      bgClass: "bg-yellow-100/50",
    },
    travel: {
      icon: Plane,
      colorClass: "text-cyan-500",
      bgClass: "bg-cyan-100/50",
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
      className={`${bgClass} py-1 px-2 space-x-2 rounded-md inline-flex items-center justify-center`}
    >
      <Icon className={`${colorClass} size-4`} />
      <span className={`capitalize text-sm ${colorClass}`}>{category}</span>
    </div>
  );
}

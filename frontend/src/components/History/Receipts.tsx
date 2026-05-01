import { fetchReceipts } from "@/services/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { useMemo } from "react";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ReceiptEmptyState } from "../Receipt/ReceiptEmptyState";
import { Receipt } from "../Receipt/Receipt";

export default function Receipts({
  search,
  category,
  date,
}: {
  search: string | null;
  category: string | null;
  date: Date;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["receipts", search, category, date],
      queryFn: ({ pageParam }: { pageParam: string | null }) =>
        fetchReceipts(search, category, date, pageParam),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) =>
        lastPage?.data.hasNextPage ? lastPage.data.nextCursor : undefined,
    });

  const receipts = useMemo(
    () => data?.pages.flatMap((page) => page?.data.receipts ?? []) ?? [],
    [data],
  );

  const groupedReceipts = useMemo(() => {
    if (!receipts) return {};

    return receipts.reduce(
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
      {} as Record<string, typeof receipts>,
    );
  }, [receipts]);

  if (isLoading) {
    return (
      <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <Spinner className="size-7" />
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return <ReceiptEmptyState />;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedReceipts).map(([dateLabel, receipts]) => (
        <section key={dateLabel}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 tracking-wider">
            {dateLabel}
          </h3>

          <div>
            {receipts.map((receipt, index) => (
              <div key={receipt.id}>
                <Receipt
                  receipt={{ ...receipt, date }}
                  firstOne={index === 0}
                  lastOne={index === receipts.length - 1}
                />
                {index !== receipts.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </section>
      ))}
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
    </div>
  );
}

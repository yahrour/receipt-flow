import { Receipt } from "@/components/Receipt/Receipt";
import { ReceiptEmptyState } from "@/components/Receipt/ReceiptEmptyState";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { fetchReceipts } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { useMemo } from "react";

export function Receipts() {
  const { data: receipts, isLoading } = useQuery({
    queryFn: () => fetchReceipts(null, null, new Date()),
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
      <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <Spinner className="size-7" />
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

          <div>
            {receipts.map((receipt, index) => (
              <div key={receipt.id}>
                <Receipt
                  receipt={{ ...receipt, date: receipt.receipt_date }}
                  firstOne={index === 0}
                  lastOne={index === receipts.length - 1}
                />
                {index !== receipts.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

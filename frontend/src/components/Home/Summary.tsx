import { DEFAULT_CURRENCY } from "@/constants";
import { fetchAnalyticsSummary, fetchUserPreferences } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Receipt } from "lucide-react";

export default function Summary() {
  const { data: analytics } = useQuery({
    queryKey: ["analytics", "analyticsSummary"],
    queryFn: fetchAnalyticsSummary,
  });

  const { data: preferences } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchUserPreferences,
  });

  return (
    <div>
      <div className="bg-white flex justify-between items-center py-4 px-8 rounded-lg">
        <div className="flex-1 flex gap-2 flex-col justify-center items-center border-r">
          <div className="bg-green-100 p-2 rounded-md">
            <Receipt className="text-green-500 size-5" />
          </div>
          <span className="font-bold">{analytics?.data.total_receipts}</span>
          <span className="text-gray-500 text-xs font-medium uppercase">
            Receipts
          </span>
        </div>
        <div className="flex-1 flex gap-2 flex-col justify-center items-center">
          <div className="bg-purple-100 p-2 rounded-md">
            <Calculator className="text-purple-500 size-5" />
          </div>
          <span className="font-bold">
            {preferences?.data.currency || DEFAULT_CURRENCY}{" "}
            {analytics?.data.average}
          </span>
          <span className="text-gray-500 text-xs font-medium uppercase">
            Avg / Receipt
          </span>
        </div>
      </div>
    </div>
  );
}

import { DEFAULT_CURRENCY } from "@/constants";
import { fetchAnalyticsSummary, fetchUserPreferences } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Summary from "./Summary";
import Receipts from "./Receipts";
import { Skeleton } from "../ui/skeleton";

export default function Home() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["analytics", "analyticsSummary"],
    queryFn: () => fetchAnalyticsSummary(null, null),
  });

  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchUserPreferences,
  });

  const now = new Date();

  return (
    <div className="space-y-8 mx-auto">
      <h1 className="text-3xl font-medium">Feed</h1>
      <div className="flex flex-col justify-center items-center text-center gap-1">
        <span className="block text-gray-500 uppercase text-sm tracking-wider">
          Total spent · {format(now, "MMMM yyyy")}
        </span>
        <div className="flex justify-center gap-1 text-5xl font-bold">
          {isLoadingPreferences || isLoadingAnalytics ? (
            <Skeleton className="w-40 h-12 rounded-none" />
          ) : (
            <>
              <span>{preferences?.data.currency || DEFAULT_CURRENCY}</span>
              <h2>{analytics?.data.total_amount}</h2>
            </>
          )}
        </div>
      </div>
      <Summary />
      <Receipts />
    </div>
  );
}

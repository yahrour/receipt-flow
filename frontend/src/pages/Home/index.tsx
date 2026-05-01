import AuthRequired from "@/components/AuthRequired";
import LoadingDots from "@/components/LoadingDots";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_CURRENCY } from "@/constants";
import { authClient } from "@/lib/auth";
import { fetchAnalyticsSummary, fetchUserPreferences } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Summary } from "./Summary";
import { Receipts } from "./Receipts";

export function Home() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["analytics", "analyticsSummary"],
    queryFn: () => fetchAnalyticsSummary(null, null),
  });

  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchUserPreferences,
  });

  const now = new Date();

  if (isLoading) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Spinner className="size-7" />
      </div>
    );
  }
  if (!session?.data?.user) {
    return <AuthRequired />;
  }

  return (
    <div className="space-y-8 mx-auto">
      <h1 className="text-3xl font-medium">Feed</h1>
      <div className="flex flex-col justify-center items-center text-center gap-1">
        <span className="block text-gray-500 uppercase text-sm tracking-wider">
          Total spent · {format(now, "MMMM yyyy")}
        </span>
        <div className="flex justify-center gap-1 text-5xl font-bold">
          {isLoadingPreferences || isLoadingAnalytics ? (
            <div className="h-12 flex justify-center items-center">
              <LoadingDots />
            </div>
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

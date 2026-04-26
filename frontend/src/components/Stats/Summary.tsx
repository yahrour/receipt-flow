import { Calculator, DollarSign, Receipt, type LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsSummary, fetchUserPreferences } from "@/services/api";
import { DEFAULT_CURRENCY } from "@/constants";

export function Summary({ date }: { date: Date }) {
  const { data: analytics } = useQuery({
    queryKey: [
      "analytics",
      "analyticsSummary",
      date.getMonth() + 1,
      date.getFullYear(),
    ],
    queryFn: () =>
      fetchAnalyticsSummary(date.getMonth() + 1, date.getFullYear()),
  });
  const { data: preferences } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchUserPreferences,
  });

  return (
    <div className="flex flex-wrap gap-4">
      <StatCard
        icon={DollarSign}
        iconBgClassName="bg-blue-100"
        iconClassName="text-blue-500"
        label="TOTAL SPENT"
        value={
          analytics
            ? `${preferences?.data.currency || DEFAULT_CURRENCY} ${analytics.data.total_amount}`
            : "Loading..."
        }
        className="flex-1 w-full"
      />

      <StatCard
        icon={Receipt}
        iconBgClassName="bg-green-100"
        iconClassName="text-green-500"
        label="RECEIPTS"
        value={analytics ? analytics.data.total_receipts : "Loading..."}
        className="flex-1 w-full"
      />

      <StatCard
        icon={Calculator}
        iconBgClassName="bg-purple-100"
        iconClassName="text-purple-500"
        label="AVG/RECEIPTS"
        value={
          analytics
            ? `${preferences?.data.currency || DEFAULT_CURRENCY} ${analytics.data.average}`
            : "Loading..."
        }
        className="flex-1 w-full"
      />
    </div>
  );
}

type StatCardProps = {
  icon: LucideIcon;
  iconBgClassName: string;
  iconClassName: string;
  label: string;
  value: string | number;
  className?: string;
};

function StatCard({
  icon: Icon,
  iconBgClassName,
  iconClassName,
  label,
  value,
  className,
}: StatCardProps) {
  return (
    <div
      className={`flex gap-4 bg-white w-fit p-4 rounded-md ${className || ""}`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 p-2 rounded-md ${iconBgClassName}`}
      >
        <Icon className={`${iconClassName} size-6`} />
      </div>
      <div className="flex flex-col justify-between">
        <span className="text-gray-500 text-xs font-medium uppercase">
          {label}
        </span>
        <span className="font-bold">{value}</span>
      </div>
    </div>
  );
}

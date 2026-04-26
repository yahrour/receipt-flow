import { fetchUserCategorySpending } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  type ChartConfig,
} from "@/components/ui/chart";

const CATEGORY_COLORS: Record<string, string> = {
  groceries: "#22c55e",
  restaurant: "#f97316",
  transport: "#3b82f6",
  entertainment: "#a855f7",
  health: "#ef4444",
  shopping: "#ec4899",
  utilities: "#eab308",
  travel: "#06b6d4",
  other: "#94a3b8",
};

export function CategorySpending({
  month,
  year,
}: {
  month: number | null;
  year: number | null;
}) {
  const { data: spending } = useQuery({
    queryKey: ["categorySpending", month, year],
    queryFn: () => fetchUserCategorySpending(month, year),
  });

  const chartData =
    spending?.data?.map((item) => ({
      category: item.category,
      total: parseFloat(item.total),
      fill: `var(--color-${item.category})`,
    })) ?? [];

  // Build chartConfig dynamically from the data
  const chartConfig = Object.fromEntries(
    chartData.map((item) => [
      item.category,
      {
        label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        color: CATEGORY_COLORS[item.category] ?? "#94a3b8",
      },
    ]),
  ) satisfies ChartConfig;

  const total = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-white p-4 rounded-md">
      <span className="tracking-wider font-medium mb-4 block">
        Spending by Category
      </span>
      <div className="">
        {spending?.data?.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No spending data for this month.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-62.5 max-w-sm">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total"
                nameKey="category"
                cx="35%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
              />
              <ChartTooltip
                content={<ChartTooltipContent nameKey="category" />}
              />
              <ChartLegend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                content={({ payload }) => (
                  <ul className="flex flex-col gap-2 pl-2">
                    {payload?.map((entry) => {
                      const itemTotal =
                        (
                          entry.payload as
                            | (typeof chartData)[number]
                            | undefined
                        )?.total ?? 0;
                      const percentage =
                        total > 0
                          ? ((itemTotal / total) * 100).toFixed(0)
                          : "0";
                      const fill =
                        (
                          entry.payload as
                            | (typeof chartData)[number]
                            | undefined
                        )?.fill ?? "#94a3b8";

                      return (
                        <li
                          key={entry.value}
                          className="flex items-center gap-2 text-sm min-w-0"
                        >
                          <span
                            className="inline-block size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: fill }}
                          />
                          <span className="text-gray-600 capitalize truncate">
                            {entry.value}
                          </span>
                          <span className="ml-auto pl-3 font-medium text-gray-900 shrink-0">
                            {percentage}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              />
            </PieChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}

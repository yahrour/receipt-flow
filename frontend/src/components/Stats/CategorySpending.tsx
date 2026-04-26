import { fetchUserCategorySpending } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
      <div>
        {spending?.data?.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No spending data for this month.
          </p>
        ) : (
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4">
            {/* Chart — no legend inside */}
            <ChartContainer
              config={chartConfig}
              className="h-50 w-50 shrink-0 [&>svg]:overflow-visible"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                />
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="category" />}
                />
              </PieChart>
            </ChartContainer>

            {/* Legend — plain ul, full Tailwind control */}
            <ul className="flex flex-col gap-2 w-full">
              {chartData.map((item) => {
                const percentage =
                  total > 0 ? ((item.total / total) * 100).toFixed(0) : "0";
                return (
                  <li
                    key={item.category}
                    className="flex items-center gap-2 text-sm sm:max-w-37.5"
                  >
                    <span
                      className="inline-block size-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[item.category] ?? "#94a3b8",
                      }}
                    />
                    <span className="text-gray-600 capitalize">
                      {item.category}
                    </span>
                    <span className="ml-auto font-medium text-gray-900">
                      {percentage}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

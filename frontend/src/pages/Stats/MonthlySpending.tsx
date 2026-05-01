import { fetchUserMonthlySpending } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Total",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export function ChartBarDemoLegend({
  chartData,
}: {
  chartData?: { month: string; total: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          domain={[0, (dataMax: number) => Math.ceil(dataMax / 200) * 200]}
          tickCount={6}
          tickFormatter={(value: number) => `${value}`}
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value: string) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export function MonthlySpending({ year }: { year: number }) {
  const { data } = useQuery({
    queryKey: ["spending", year],
    queryFn: () => fetchUserMonthlySpending(year),
  });

  const transformedData = data?.data?.map(({ month, total }) => ({
    month: new Date(year, month - 1).toLocaleString("default", {
      month: "long",
    }),
    total,
  }));

  return (
    <div className="bg-white p-4 rounded-md">
      <span className="tracking-wider font-medium mb-4 block">
        Monthly Spending
      </span>
      {data?.data?.length === 0 ? (
        <p className="text-gray-500 text-sm">No spending data for this year.</p>
      ) : (
        <ChartBarDemoLegend chartData={transformedData ?? []} />
      )}
    </div>
  );
}

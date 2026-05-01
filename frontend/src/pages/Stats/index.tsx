import { useState } from "react";
import { Summary } from "./Summary";
import { MonthlySpending } from "./MonthlySpending";
import { CategorySpending } from "./CategorySpending";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import AuthRequired from "@/components/AuthRequired";
import { DateNav } from "@/components/DateNav";

export function Stats() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const [date, setDate] = useState(new Date());

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium">Stats</h1>
        <div className="w-fit">
          <DateNav date={date} setDate={setDate} />
        </div>
      </div>
      <Summary date={date} />
      <MonthlySpending year={date.getFullYear()} />
      <CategorySpending month={date.getMonth() + 1} year={date.getFullYear()} />
    </div>
  );
}

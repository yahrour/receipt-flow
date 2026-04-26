import { DateNav } from "../DateNav";
import { useState } from "react";
import { Summary } from "./Summary";
import { MonthlySpending } from "./MonthlySpending";
import { CategorySpending } from "./CategorySpending";

export default function Stats() {
  const [date, setDate] = useState(new Date());

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

import Receipts from "./Receipts";
import { useState } from "react";
import { ActionBar } from "./ActionBar";
import { ReceiptsTable } from "./ReceiptsTable";

export default function History() {
  const [search, setSearch] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="space-y-8 mx-auto">
      <div>
        <h1 className="text-3xl font-medium">History</h1>
      </div>
      <ActionBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        date={date}
        setDate={setDate}
      />
      <div>
        <div className="sm:block hidden">
          <ReceiptsTable date={date} search={search} category={category} />
        </div>
        <div className="max-sm:block hidden">
          <Receipts date={date} search={search} category={category} />
        </div>
      </div>
    </div>
  );
}

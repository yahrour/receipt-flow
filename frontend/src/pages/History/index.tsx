import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import AuthRequired from "@/components/AuthRequired";
import { ActionBar } from "./ActionBar";
import { ReceiptsTable } from "./ReceiptsTable";
import Receipts from "./Receipts";

export function History() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });
  const [search, setSearch] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());

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

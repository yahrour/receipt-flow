import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/config/env";
import { CURRENCIES } from "@/constants";
import { queryClient } from "@/main";
import { fetchUserPreferences } from "@/services/api";
import type { ApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Settings() {
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchUserPreferences,
  });

  const updatePreferences = async (currency: string) => {
    const res = await fetch(env.API_BASE_URL + "/api/preferences", {
      method: "PATCH",
      body: JSON.stringify({ currency }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to update, Please try again");
    }

    const jsonData = (await res.json()) as ApiResponse;
    if (jsonData.success === false) {
      throw new Error(
        jsonData.message || "Failed to update, Please try again.",
      );
    }
  };

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
    onError: () => {
      setError("Failed to update, please try again");
    },
  });

  const handleUpdateCurrency = async (currency: string) => {
    if (currency) {
      await mutation.mutateAsync(currency);
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-medium">Settings</h1>
      <div className="space-y-2">
        <span className="block text-gray-500 text-sm font-medium">
          CURRENCY
        </span>
        <div className="bg-white p-6 space-y-2 rounded-md">
          <FieldLabel htmlFor="currency">Display Currency</FieldLabel>
          {isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              items={CURRENCIES}
              id="currency"
              onValueChange={(currency) =>
                void handleUpdateCurrency(currency as string)
              }
              value={data?.data.currency}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Currencies</SelectLabel>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-gray-500">
            Used to format amounts across the app.
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}

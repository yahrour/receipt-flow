import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/config/env";
import { CURRENCIES } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

type ResponseType = {
  success: boolean;
  message: string;
  data: {
    id: number;
    currency: string;
  };
};

export default function Settings() {
  const [currency, setCurrency] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    const res = await fetch(env.API_BASE_URL + "/api/preferences", {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch preferences");
    }

    const jsonData = (await res.json()) as ResponseType;
    setCurrency(jsonData.data.currency);
    return jsonData;
  };

  useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
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

    const jsonData = (await res.json()) as ResponseType;
    if (jsonData.success === false) {
      throw new Error(
        jsonData.message || "Failed to update, Please try again.",
      );
    }
  };
  const mutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {},
    onError: () => {
      setError("Failed to update, please try again");
    },
  });

  const handleSaveCurrency = async () => {
    console.log("Save Currency: ", currency);
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
          <Select
            items={CURRENCIES}
            id="currency"
            onValueChange={(value) => setCurrency(value as string)}
            value={currency}
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
          <p className="text-xs text-gray-500">
            Used to format amounts across the app.
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            className="block ml-auto"
            variant="outline"
            onClick={() => void handleSaveCurrency()}
          >
            {mutation.isPending ? <Spinner /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

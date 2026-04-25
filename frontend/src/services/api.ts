import { env } from "@/config/env";
import type { RECEIPT_CATEGORIES } from "@/constants";
import type { ApiResponse } from "@/types";

export async function fetchUserPreferences() {
  const res = await fetch(env.API_BASE_URL + "/api/preferences", {
    credentials: "include",
  });

  const jsonData = (await res.json().catch(() => null)) as ApiResponse<{
    id: number;
    currency: string;
  }> | null;

  if (!res.ok) {
    throw new Error("Failed to fetch preferences");
  }

  return jsonData;
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(env.API_BASE_URL + "/api/analytics/summary", {
    credentials: "include",
  });

  const jsonData = (await res.json().catch(() => null)) as ApiResponse<{
    total_amount: number;
    total_receipts: number;
    average: number;
  }> | null;

  if (!res.ok) {
    throw new Error(jsonData?.message || "Failed to fetch analytics");
  }

  return jsonData;
}

export async function fetchReceipts(
  search: string | null,
  category: string | null,
  date: Date,
  nextCursor: string | null | undefined = null,
) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  params.set("date", date.toISOString());
  if (nextCursor) params.set("nextCursor", nextCursor);

  const res = await fetch(
    env.API_BASE_URL + `/api/receipts?${params.toString()}`,
    {
      credentials: "include",
    },
  );

  const jsonData = (await res.json().catch(() => null)) as ApiResponse<{
    receipts: {
      id: number;
      merchant: string;
      amount: number;
      receipt_date: Date;
      category: (typeof RECEIPT_CATEGORIES)[number];
      currency: string;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> | null;

  if (!res.ok) {
    throw new Error(jsonData?.message || "Failed to fetch analytics");
  }

  return jsonData;
}

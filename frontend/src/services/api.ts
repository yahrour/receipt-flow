import { env } from "@/config/env";
import type { ApiResponse } from "@/types";

export async function fetchUserPreferences() {
  const res = await fetch(env.API_BASE_URL + "/api/preferences", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch preferences");
  }

  const jsonData = (await res.json()) as ApiResponse<{
    id: number;
    currency: string;
  }>;

  return jsonData;
}

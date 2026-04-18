import { env } from "@/config/env";
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

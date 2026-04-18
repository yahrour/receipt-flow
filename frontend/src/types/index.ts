import type { authClient } from "@/lib/auth";

export type ApiResponse<T = void> = {
  success: boolean;
  message: string;
  data: T;
};

export type UserSession = typeof authClient.$Infer.Session.user;

export type Message = {
  success: boolean;
  message: string;
};

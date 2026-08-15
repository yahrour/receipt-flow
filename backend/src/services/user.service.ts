import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/index.js";
import createError from "http-errors";
import type { IncomingHttpHeaders } from "node:http";
import { env } from "../config/env.js";

export async function updateEmailService({
  newEmail,
  currentPassword,
  headers,
}: {
  newEmail: string;
  currentPassword: string;
  headers: IncomingHttpHeaders;
}) {
  console.log("Updating email for user with new email:", newEmail);
  try {
    console.log("Verifying password for user");
    await auth.api.verifyPassword({
      body: { password: currentPassword },
      headers: fromNodeHeaders(headers),
    });
  } catch {
    throw createError(400, "Incorrect Password");
  }
  console.log("Password verified, updating email");

  try {
    await auth.api.changeEmail({
      body: {
        newEmail: newEmail,
        callbackURL: env.FRONTEND_URL + "/account/security",
      },
      headers: fromNodeHeaders(headers),
    });
    console.log("Email updated successfully");
  } catch {
    throw createError(500, "Failed to update email");
  }
}

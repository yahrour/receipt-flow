import z from "zod";

export const receiptSchema = z.object({
  merchant: z.string().trim(),
  amount: z.number().positive(),
  date: z.string().trim(),
  category: z.enum([
    "groceries",
    "restaurant",
    "transport",
    "entertainment",
    "health",
    "shopping",
    "utilities",
    "travel",
    "other",
  ]),
  currencySymbol: z.string().trim(),
});

export const updateEmailSchema = z.object({
  newEmail: z.email(),
  currentPassword: z
    .string()
    .min(1, "Please set a password")
    .min(8, "password too short"),
});

export const userPreferencesSchema = z.object({
  currency: z.string().min(1, "No currency provided"),
});

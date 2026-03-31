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

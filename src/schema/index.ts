import z from "zod";

export const receiptSchema = z.object({
  merchant: z.string(),
  total: z.number().positive(),
  date: z.string(),
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
  currencySymbol: z.string(),
});

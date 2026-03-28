import z from "zod";

export const receiptSchema = z.object({
  merchant: z.string(),
  total: z.number().positive(),
  date: z.string(),
  currencySymbol: z.string(),
  items: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      }),
    )
    .min(1, "At least one item is required"),
});

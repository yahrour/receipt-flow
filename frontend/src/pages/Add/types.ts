import type { receiptSchema } from "@/schema";
import type z from "zod";

export type ReceiptSchema = z.infer<typeof receiptSchema>;

import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { env } from "../config/env.js";
import { receiptSchema } from "../schema/index.js";
import createError from "http-errors";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const prompt = `Extract the receipt data accurately. 
Return merchant name, total amount, date, and all line items with their prices.`;

export const analyzeReceiptService = async (
  filePath: string,
  mimeType: string,
) => {
  // 1. Upload to Gemini File API
  const uploaded = await genAI.files.upload({
    file: filePath,
    config: { mimeType: mimeType },
  });
  if (!uploaded.uri) throw createError(500, "Failed to upload receipt");

  // 2. Generation
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      responseJsonSchema: z.toJSONSchema(receiptSchema),
      responseMimeType: "application/json",
    },
    contents: [
      {
        fileData: { fileUri: uploaded.uri, mimeType },
      },
      { text: prompt },
    ],
  });

  // 3. Parse and Validate
  const rawText = result.text;
  if (!rawText || rawText.length === 0) {
    throw createError(500, "Failed to extract receipt data");
  }
  return receiptSchema.parse(JSON.parse(rawText));
};

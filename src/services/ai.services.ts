import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { env } from "../config/env.js";
import { receiptSchema } from "../schema/index.js";
import createError from "http-errors";
import sharp from "sharp";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const prompt = `Extract the receipt data accurately. 
Return merchant name, total amount, date, and all line items with their prices.`;

export const analyzeReceiptService = async (
  filePath: string,
  mimeType: string,
) => {
  let dataPart;

  if (mimeType.startsWith("image/")) {
    const optimizedBuffer = await sharp(filePath)
      .resize({ width: 1200, withoutEnlargement: true })
      .rotate()
      .jpeg({ quality: 85 })
      .toBuffer();
    dataPart = {
      data: optimizedBuffer.toString("base64"),
      mimeType: "image/jpeg",
    };
  } else if (mimeType === "application/pdf") {
    const rawData = await fs.readFile(filePath);
    try {
      const pdfDoc = await PDFDocument.load(rawData, {
        ignoreEncryption: true,
      });
      const pageCount = pdfDoc.getPageCount();
      if (pageCount > 10) {
        throw createError(400, "PDF is too long");
      }
    } catch (e) {
      const isHttpError = createError.isHttpError(e);
      throw isHttpError ? e : createError(500, "Failed to process receipt");
    }

    dataPart = {
      data: rawData.toString("base64"),
      mimeType,
    };
  }

  if (!dataPart) {
    throw createError(415, "Unsupported file type");
  }

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      responseJsonSchema: z.toJSONSchema(receiptSchema),
      responseMimeType: "application/json",
    },
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: dataPart.data, mimeType: dataPart.mimeType } },
        ],
      },
    ],
  });

  const rawText = result.text;
  if (!rawText || rawText.length === 0) {
    throw createError(500, "Failed to extract receipt data");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw createError(422, "Failed to extract to receipt data");
  }
  return receiptSchema.parse(parsed);
};

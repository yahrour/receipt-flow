import { receiptSchema } from "../schema/index.js";
import createError from "http-errors";
import { query } from "../lib/db.js";
import type { ReceiptType } from "../controllers/receipts.controllers.js";
import { isValidId } from "../utils/index.js";
import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { env } from "../config/env.js";
import sharp from "sharp";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const prompt = `
You are a specialized OCR agent for financial documents.
Extract the receipt data accurately and return the following fields:
- merchant: the store or business name
- amount: the total amount paid
- date: Use ISO 8601 format (YYYY-MM-DD). If the year is missing on the receipt, assume 2026.
- category: classify the receipt into one of: groceries, restaurant, transport, entertainment, health, shopping, utilities, travel, or other`;

export async function analyzeReceiptService(
  filePath: string | undefined,
  mimeType: string | undefined,
) {
  let dataPart;

  if (!filePath || !mimeType) throw createError(400, "No Receipt provided");

  const fileBuffer = await fs.readFile(filePath);

  if (mimeType.startsWith("image/")) {
    const optimizedBuffer = await sharp(fileBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .rotate()
      .jpeg({ quality: 85 })
      .toBuffer();
    dataPart = {
      data: optimizedBuffer.toString("base64"),
      mimeType: "image/jpeg",
    };
  } else if (mimeType === "application/pdf") {
    const pdfDoc = await PDFDocument.load(fileBuffer, {
      ignoreEncryption: true,
    });
    const pageCount = pdfDoc.getPageCount();
    if (pageCount > 5) {
      throw createError(400, "PDF is too long");
    }
    dataPart = {
      data: fileBuffer.toString("base64"),
      mimeType,
    };
  } else {
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

  const parsed = JSON.parse(rawText);
  return receiptSchema.parse(parsed);
}

export async function saveReceiptService(body: ReceiptType, userId: string) {
  // Validation
  let receiptData;
  try {
    receiptData = receiptSchema.parse(body);
  } catch {
    throw createError(400, "Invalid receipt");
  }

  // Saving
  try {
    await query(
      "INSERT INTO receipts (user_id, merchant, amount, receipt_date, category, currency_symbol) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        userId,
        receiptData.merchant,
        receiptData.amount,
        receiptData.date,
        receiptData.category,
        receiptData.currencySymbol,
      ],
    );
    return receiptData;
  } catch {
    throw createError(500, "Failed to save receipt");
  }
}

export async function getReceiptsService(userId: string) {
  try {
    const { rows } = await query(
      "SELECT id, merchant, amount, receipt_date, category, currency_symbol FROM receipts WHERE user_id=$1",
      [userId],
    );
    return rows;
  } catch {
    throw createError(500, "Failed to fetch receipts");
  }
}

export async function getReceiptService(
  id: string | string[] | undefined,
  userId: string,
) {
  const receiptId = Number(id);
  if (!isValidId(id) || receiptId < 0) {
    throw createError(400, "Invalid receipt id");
  }

  try {
    const { rows } = await query(
      "SELECT id, merchant, amount, receipt_date, category, currency_symbol FROM receipts WHERE id=$1 AND user_id=$2",
      [receiptId, userId],
    );
    if (!rows[0]) {
      throw createError(404, "Receipt doesn't exist");
    }
    return rows[0];
  } catch {
    throw createError(500, "Failed to fetch receipt");
  }
}

export async function updateReceiptService(
  id: string | string[] | undefined,
  body: ReceiptType,
  userId: string,
) {
  const receiptId = Number(id);
  if (!isValidId(id) || receiptId < 0) {
    throw createError(400, "Invalid receipt id");
  }

  // Validation
  let receiptData;
  try {
    receiptData = receiptSchema.parse(body);
  } catch {
    throw createError(400, "Invalid receipt");
  }

  try {
    const { rows, rowCount } = await query(
      "UPDATE receipts SET merchant=$1, amount=$2, receipt_date=$3, category=$4, currency_symbol=$5 WHERE id=$6 AND user_id=$7 RETURNING *",
      [
        receiptData.merchant,
        receiptData.amount,
        receiptData.date,
        receiptData.category,
        receiptData.currencySymbol,
        receiptId,
        userId,
      ],
    );
    if (rowCount === 0) {
      throw createError(404, "Receipt not found or unauthorized");
    }
    return rows[0];
  } catch {
    throw createError(500, "Failed to update receipt");
  }
}

export async function deleteReceiptService(
  id: string | string[] | undefined,
  userId: string,
) {
  const receiptId = Number(id);
  if (!isValidId(id) || receiptId < 0) {
    throw createError(400, "Invalid receipt id");
  }

  try {
    const { rowCount } = await query(
      "DELETE FROM receipts WHERE id=$1 AND user_id=$2",
      [receiptId, userId],
    );
    if (rowCount === 0) {
      throw createError(404, "Receipt not found or unauthorized");
    }
    return null;
  } catch (e) {
    if (createError.isHttpError(e)) throw e;
    throw createError(500, "Failed to delete receipt");
  }
}

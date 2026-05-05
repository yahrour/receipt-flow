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
import { config } from "../config/config.js";

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const prompt = `
You are a specialized OCR agent for financial documents.
Extract the receipt data accurately and return the following fields:
- merchant: the store or business name
- amount: the total amount paid as a number (e.g. 12.99). If not found, return null.
- date: Use ISO 8601 format (YYYY-MM-DD). If the year is missing on the receipt assume 2026.
- category: one of: groceries, restaurant, transport, entertainment, health, shopping, utilities, travel, other.

If a field cannot be determined with confidence, return null. Do NOT guess.`;

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
      .grayscale()
      .jpeg({ quality: 85 })
      .toBuffer();
    dataPart = {
      data: optimizedBuffer.toString("base64"),
      mimeType: "image/jpeg",
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
          {
            inlineData: { data: dataPart.data, mimeType: dataPart.mimeType },
          },
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
      "INSERT INTO receipts (user_id, merchant, amount, receipt_date, category, currency) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        userId,
        receiptData.merchant,
        receiptData.amount,
        receiptData.date,
        receiptData.category,
        receiptData.currency,
      ],
    );
    return receiptData;
  } catch {
    throw createError(500, "Failed to save receipt");
  }
}

export async function getReceiptsService(
  userId: string,
  nextCursor: string | undefined,
  search: string | null,
  category: string | null,
  date: Date,
) {
  try {
    let result;

    const decodedCursor = nextCursor
      ? Buffer.from(nextCursor, "base64").toString("utf-8")
      : null;

    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const startOfNextMonth = new Date(year, month + 1, 1);
    const startDate = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, "0")}-01`;
    const endDate = `${startOfNextMonth.getFullYear()}-${String(startOfNextMonth.getMonth() + 1).padStart(2, "0")}-01`;

    if (decodedCursor) {
      result = await query(
        `SELECT id, merchant, amount, receipt_date, category, currency
        FROM receipts
        WHERE user_id=$1
        AND id < $2
        AND receipt_date >= $3
        AND receipt_date < $4
        AND ($5::text IS NULL OR LOWER(merchant) LIKE LOWER($5))
        AND ($6::text IS NULL OR LOWER(category::text) LIKE LOWER($6))
        ORDER BY id DESC
        LIMIT $7`,
        [
          userId,
          decodedCursor,
          startDate,
          endDate,
          search ? `%${search}%` : null,
          category ? `%${category}%` : null,
          config.paginationLimit + 1,
        ],
      );
    } else {
      result = await query(
        `SELECT id, merchant, amount, receipt_date, category, currency 
        FROM receipts 
        WHERE user_id=$1
        AND receipt_date >= $2
        AND receipt_date < $3
        AND ($4::text IS NULL OR LOWER(merchant) LIKE LOWER($4))
        AND ($5::text IS NULL OR LOWER(category::text) LIKE LOWER($5)) 
        ORDER BY id DESC 
        LIMIT $6`,
        [
          userId,
          startDate,
          endDate,
          search ? `%${search}%` : null,
          category ? `%${category}%` : null,
          config.paginationLimit + 1,
        ],
      );
    }

    const hasNextPage = result.rowCount === config.paginationLimit + 1;

    if (hasNextPage) {
      result.rows.pop();
    }

    const lastItem = result.rows[result.rows.length - 1];
    const newNextCursor =
      hasNextPage && lastItem
        ? Buffer.from(lastItem.id.toString(), "utf-8").toString("base64")
        : null;

    const response = {
      receipts: result.rows,
      nextCursor: newNextCursor,
      hasNextPage,
    };

    return response;
  } catch {
    throw createError(500, "Failed to fetch receipts");
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
      "UPDATE receipts SET merchant=$1, amount=$2, receipt_date=$3, category=$4, currency=$5 WHERE id=$6 AND user_id=$7 RETURNING *",
      [
        receiptData.merchant,
        receiptData.amount,
        receiptData.date,
        receiptData.category,
        receiptData.currency,
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

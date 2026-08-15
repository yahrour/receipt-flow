import type { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import createError from "http-errors";
import z from "zod";
import { receiptSchema } from "../schema/index.js";
import {
  analyzeReceiptService,
  deleteReceiptService,
  getReceiptsService,
  saveReceiptService,
  updateReceiptService,
} from "../services/receipt.service.js";
import { ok } from "../utils/index.js";

export type ReceiptType = z.infer<typeof receiptSchema>;

export async function analyzeReceiptController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data: ReceiptType = await analyzeReceiptService(
      req.file?.path,
      req.file?.mimetype,
    );
    return ok(res, data, "Data extracted successfully", 200);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return next(createError(422, "Failed to extract receipt data"));
    }
    const isHttpError = createError.isHttpError(e);
    return next(
      isHttpError ? e : createError(500, "Failed to process receipt"),
    );
  } finally {
    if (req.file?.path) {
      await fs
        .unlink(req.file.path)
        .catch((err) => console.error("Cleanup error:", err));
    }
  }
}

export async function getReceiptsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const nextCursor = req.query.nextCursor?.toString();
    const search = req.query.search?.toString() || null;
    const category = req.query.category?.toString() || null;
    const date = req.query.date
      ? new Date(req.query.date.toString())
      : new Date();
    const result = await getReceiptsService(
      req.user.id,
      nextCursor,
      search,
      category,
      date,
    );
    return ok(res, result, "Receipts fetched successfully", 200);
  } catch (e) {
    next(e);
  }
}

export async function saveReceiptController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await saveReceiptService(req.body, req.user.id);
    return ok(res, result, "Receipt saved successfully", 201);
  } catch (e) {
    next(e);
  }
}

export async function updateReceiptController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await updateReceiptService(
      req.params.id,
      req.body,
      req.user.id,
    );
    return ok(res, result, "Receipt updated successfully", 200);
  } catch (e) {
    next(e);
  }
}

export async function deleteReceiptController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await deleteReceiptService(req.params.id, req.user.id);
    return ok(res, null, "Receipt deleted successfully", 200);
  } catch (e) {
    next(e);
  }
}

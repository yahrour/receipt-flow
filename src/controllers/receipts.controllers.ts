import type { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import createError from "http-errors";
import z from "zod";
import { ok } from "../utils/response.js";
import type { receiptSchema } from "../schema/index.js";
import { analyzeReceiptService } from "../services/ai.services.js";

type ReceiptType = z.infer<typeof receiptSchema>;

export const analyzeReceiptController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let tmpPath: string | undefined;

  try {
    if (!req.file) throw createError(400, "No Receipt provided");
    tmpPath = req.file.path;

    const data: ReceiptType = await analyzeReceiptService(
      req.file.path,
      req.file.mimetype,
    );

    return ok(res, data, "Data extracted successfully", 200);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return next(createError(422, "Failed to extract to receipt data"));
    }
    const isHttpError = createError.isHttpError(e);
    return next(
      isHttpError ? e : createError(500, "Failed to process receipt"),
    );
  } finally {
    if (tmpPath) {
      await fs
        .unlink(tmpPath)
        .catch((err) => console.error("Cleanup error:", err));
    }
  }
};

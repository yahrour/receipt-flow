import express from "express";
import type { NextFunction, Request, Response } from "express";
import { upload } from "../lib/multer.js";
import createError from "http-errors";
import z from "zod";
import { promisify } from "util";
import { analyzeReceiptController } from "../controllers/receipts.controllers.js";

export const receiptsRouter = express.Router();

const uploadReceipt = promisify(upload.single("receipt"));

const uploadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await uploadReceipt(req, res);
    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      next(createError(422, "Failed to extract to receipt data"));
    }
    next(e.status ? e : createError(500, "Failed to process receipt"));
  }
};

receiptsRouter.post("/analyze", uploadMiddleware, analyzeReceiptController);

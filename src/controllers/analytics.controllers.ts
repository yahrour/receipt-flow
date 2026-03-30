import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import {
  getSpendingByCategoryService,
  getSpendingByMonthService,
  getSummaryService,
} from "../services/analytics.services.js";
import { ok } from "../utils/response.js";

export async function analyticsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = "123"; // req.user.id
    const [summary, byCategory, byMonth] = await Promise.all([
      getSummaryService(userId),
      getSpendingByCategoryService(userId),
      getSpendingByMonthService(userId),
    ]);

    return ok(
      res,
      { summary, byCategory, byMonth },
      "Analytics fetched successfully",
      200,
    );
  } catch {
    next(createError(500, "Failed to calculate analytics"));
  }
}

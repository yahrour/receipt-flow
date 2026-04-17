import type { NextFunction, Request, Response } from "express";
import {
  getCategoriesSpending,
  getYearlySpending,
  getMonthlySummary,
} from "../services/analytics.services.js";
import { ok } from "../utils/response.js";
import createError from "http-errors";

export async function monthlySummaryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user.id;
  const month = req.query.month
    ? Number(req.query.month)
    : new Date().getMonth() + 1;
  const year = req.query.year
    ? Number(req.query.year)
    : new Date().getFullYear();

  try {
    if (isNaN(month) || month < 1 || month > 12) {
      throw createError(400, "Invalid month. Must be 1-12");
    }
    if (isNaN(year) || year < 2000) {
      throw createError(400, "Invalid year");
    }
    const result = await getMonthlySummary(userId, month, year);
    return ok(res, result, "Analytics summary fetched successfully", 200);
  } catch (e) {
    next(e);
  }
}

export async function yearlySpendingController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user.id;
  const year = req.query.year
    ? Number(req.query.year)
    : new Date().getFullYear();

  try {
    if (isNaN(year) || year < 2000) {
      throw createError(400, "Invalid year");
    }
    const result = await getYearlySpending(userId, year);
    return ok(res, result, "Analytics summary fetched successfully", 200);
  } catch (e) {
    next(e);
  }
}

export async function categoriesSpendingController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user.id;
  const month = req.query.month
    ? Number(req.query.month)
    : new Date().getMonth() + 1;
  const year = req.query.year
    ? Number(req.query.year)
    : new Date().getFullYear();

  try {
    if (isNaN(month) || month < 1 || month > 12) {
      throw createError(400, "Invalid month. Must be 1-12");
    }
    if (isNaN(year) || year < 2000) {
      throw createError(400, "Invalid year");
    }
    const result = await getCategoriesSpending(userId, month, year);
    return ok(res, result, "Analytics summary fetched successfully", 200);
  } catch (e) {
    next(e);
  }
}

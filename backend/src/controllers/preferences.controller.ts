import type { NextFunction, Request, Response } from "express";
import { ok } from "../utils/index.js";
import {
  GetPreferencesService,
  UpdatePreferencesService,
} from "../services/preferences.service.js";

export async function UpdatePreferencesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await UpdatePreferencesService(req.user.id, req.body);
    return ok(res, null, "preferences updated successfully");
  } catch (e) {
    next(e);
  }
}

export async function GetPreferencesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await GetPreferencesService(req.user.id);
    return ok(res, data, "preferences fetched successfully");
  } catch (e) {
    next(e);
  }
}

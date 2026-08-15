import type { NextFunction, Request, Response } from "express";
import { ok } from "../utils/index.js";
import z from "zod";
import { updateEmailSchema } from "../schema/index.js";
import { updateEmailService } from "../services/user.service.js";
import createError from "http-errors";

export async function changeEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = updateEmailSchema.parse(req.body);
    await updateEmailService({
      newEmail: data.newEmail,
      currentPassword: data.currentPassword,
      headers: req.headers,
    });
    return ok(res, null, "Email updated successfully", 200);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return next(createError(400, "Invalid field(s)"));
    }
    const isHttpError = createError.isHttpError(e);
    return next(isHttpError ? e : createError(500, "Failed to update email"));
  }
}

import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import createError from "http-errors";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      return next(createError(401, "Authentication required"));
    }
    req.user = session.user;
    next();
  } catch (e) {
    next(e);
  }
}

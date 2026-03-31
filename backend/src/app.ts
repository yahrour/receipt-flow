import { env } from "./config/env.js";
import express from "express";
import createError from "http-errors";
import logger from "morgan";
import { toNodeHandler } from "better-auth/node";
import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "http-errors";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { healthRouter } from "./routes/health.routes.js";
import { fail } from "./utils/response.js";
import { receiptsRouter } from "./routes/receipts.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

const logFormat = env.NODE_ENV === "production" ? "combined" : "dev";
app.use(logger(logFormat));

app.use("/api", healthRouter);
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/receipts", receiptsRouter);
app.use("/api/analytics", analyticsRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError.NotFound());
});

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message =
    status >= 500 && env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;
  return fail(res, message, status);
});

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

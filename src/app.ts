import { env } from "./config/env.js";
import express from "express";
import createError from "http-errors";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "http-errors";

const app = express();
const logFormat = env.NODE_ENV === "production" ? "combined" : "dev";

app.use(logger(logFormat));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError.NotFound());
});

// error handler
app.use((err: HttpError, req: Request, res: Response) => {
  const status = err.status || 500;

  res.status(status).json({
    error: {
      // Only show the specific message if it's a client error (4xx)
      // or if we are in development mode.
      message:
        err.status >= 500 && app.get("NODE_ENV") === "production"
          ? "Internal Server Error"
          : err.message,
      status: err.status,
    },
  });
});

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

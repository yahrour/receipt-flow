import type { Request, RequestHandler, Response } from "express";

export const runMiddleware = (
  req: Request,
  res: Response,
  fn: RequestHandler,
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

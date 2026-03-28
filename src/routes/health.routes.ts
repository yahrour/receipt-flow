import { Router, type Request, type Response } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (req: Request, res: Response) => {
  return res.json({ message: "Live" });
});

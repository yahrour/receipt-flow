import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  categoriesSpendingController,
  monthlySummaryController,
  yearlySpendingController,
} from "../controllers/analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.get("/summary", authMiddleware, monthlySummaryController);

analyticsRouter.get(
  "/months-spending",
  authMiddleware,
  yearlySpendingController,
);

analyticsRouter.get(
  "/category-spending",
  authMiddleware,
  categoriesSpendingController,
);

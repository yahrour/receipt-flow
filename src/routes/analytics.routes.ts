import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { analyticsController } from "../controllers/analytics.controllers.js";

export const analyticsRouter = Router();

analyticsRouter.get("/", authMiddleware, analyticsController);

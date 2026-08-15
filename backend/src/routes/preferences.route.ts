import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  GetPreferencesController,
  UpdatePreferencesController,
} from "../controllers/preferences.controller.js";

export const preferencesRouter = Router();

preferencesRouter.patch("/", authMiddleware, UpdatePreferencesController);
preferencesRouter.get("/", authMiddleware, GetPreferencesController);

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { changeEmailController } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.put("/email", authMiddleware, changeEmailController);

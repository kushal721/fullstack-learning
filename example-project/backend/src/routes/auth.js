import express from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const authRoutes = express.Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", requireAuth, authController.currentUser);

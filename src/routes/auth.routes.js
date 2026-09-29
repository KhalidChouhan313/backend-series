import { Router } from "express";
import { ForgotPassword, LoginUser, RegisterUser, ResetPassword } from "../controllers/auth.controller.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";


const router = Router();
router.post("/forgot-password", rateLimiter("forgot-password", 5, 60), ForgotPassword);
router.post("/reset-password/:token", rateLimiter("reset-password", 5, 60), ResetPassword);
router.post("/register", rateLimiter("register", 5, 60), RegisterUser);
router.post("/login", rateLimiter("login", 5, 60), LoginUser);

export default router;
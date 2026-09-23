import { Router } from "express";
import { ForgotPassword, LoginUser, RegisterUser, ResetPassword } from "../controllers/auth.controller.js";


const router = Router();
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password/:token", ResetPassword);
router.post("/register", RegisterUser);
router.post("/login", LoginUser);

export default router;
// src/modules/auth/auth.routes.ts
import express from "express";
import { signupController, loginController } from "./authController";
import { validateRequest } from "../../middleware/validateRequest";
import { loginSchema, signupSchema } from "../../validations/auth.validation";

const router = express.Router();

router.post("/signup", validateRequest(signupSchema), signupController);
router.post("/login", validateRequest(loginSchema), loginController);

export default router;

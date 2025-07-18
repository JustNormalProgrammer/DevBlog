import { handleLogin, handleRegister } from "../controllers/authController";
import { Router } from "express";
import { body } from "express-validator";

const validateUser = [
  body("username")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Username cannot be empty or exceed 30 characters"),
  body("password")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Password cannot be empty or exceed 20 characters"),
  body("adminVerificationPwd")
    .optional()
    .isLength({ max: 256 })
    .withMessage("Admin verification password cannot exceed 256 characters"),
];
const router = Router();

router.post("/login", validateUser, handleLogin);
router.post("/register", validateUser, handleRegister);

export default router;

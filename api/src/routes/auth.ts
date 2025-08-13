import {
  handleLogin,
  handleLogout,
  handleRegister,
} from "../controllers/authController";
import { Router } from "express";
import { body } from "express-validator";
import { requiredAuth } from "../middleware/requiredAuth";
import { handleRefreshToken } from "../controllers/authController";
import { getUserByUsername } from "../db/queries/user";

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
    .withMessage("Admin verification password cannot exceed 256 characters")
    .custom((value) => {
      if (value !== process.env.ADMIN_PASSWORD) {
        throw new Error("Admin verification password invalid");
      }
      return true;
    }),
];
const router = Router();

router.post("/login", validateUser, handleLogin);
router.post(
  "/register",
  validateUser,
  body("username").custom(async (value) => {
    let duplicate: {
      id: string;
      username: string;
      password: string;
      isAdmin: boolean;
    } | null = null;
    try {
      duplicate = await getUserByUsername(value);
    } catch (e) {
      throw new Error("Failed to connect to the database. Cannot sign in.");
    }
    if (duplicate) throw new Error("Username already in use");
  }),
  handleRegister
);
router.get("/logout", requiredAuth, handleLogout);
router.get("/refresh-token", handleRefreshToken);

export default router;

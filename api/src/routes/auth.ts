import { handleLogin, handleRegister } from "../controllers/authController";
import { Router } from "express";

const router = Router();

router.post('/login', handleLogin);
router.post('/register', handleRegister)

export default router;
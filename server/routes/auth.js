import express from "express";
import { isLoggedIn } from "../middleware/isloggedIn.js";
import { testAuth, register, login, logout, verifyToken } from "../controllers/authController.js";

const router = express.Router();

// TEST ROUTE
router.get("/test", testAuth);

// 1. REGISTER
router.post("/register", register);

// 2. LOGIN
router.post("/login", login);

// 3. LOGOUT
router.post("/logout", isLoggedIn, logout);

// Verify token endpoint - check if user is still authenticated
router.get("/verify", isLoggedIn, verifyToken);

export default router;

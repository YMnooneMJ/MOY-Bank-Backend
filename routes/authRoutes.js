import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// User registration routeeeee
router.post("/register", registerUser);
// User login routeee
router.post("/login", loginUser);

export default router;
import express from "express";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordController.js";

const router = express.Router();

router.post("/forgot", forgotPassword); // Step 1: User requests reset
router.post("/reset/:token", resetPassword); // Step 2: User submits new password

export default router;

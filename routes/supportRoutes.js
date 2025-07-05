import express from "express";
import { getSupportInbox } from "../controllers/supportController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only: get inbox with users who've chatted
router.get("/inbox", protect, isAdmin, getSupportInbox);

export default router;

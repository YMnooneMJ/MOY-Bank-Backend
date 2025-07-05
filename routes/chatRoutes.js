import express from "express";
import { getSupportInbox } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/inbox", protect, isAdmin, getSupportInbox);

export default router;

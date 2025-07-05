import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getAllUsers,
  getAllTransactions,
  toggleUserStatus,
  getAdminDashboardStats,
} from "../controllers/adminController.js";

const router = express.Router();

// GET /api/admin/users
router.get("/users", protect, isAdmin, getAllUsers);
router.get("/transactions", protect, isAdmin, getAllTransactions);
router.patch("/users/:userId/toggle-status", protect, isAdmin, toggleUserStatus);
router.get("/dashboard-stats", protect, isAdmin, getAdminDashboardStats);

export default router;

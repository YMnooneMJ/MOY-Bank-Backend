import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  changePassword,
  uploadAvatar,
} from "../controllers/userController.js";
import { body } from "express-validator";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

// Validation middleware for updating profile
const validateUpdateProfile = [
  body("fullName")
    .optional()
    .isString()
    .withMessage("Full name must be a string"),
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string"),
  body("email").optional().isEmail().withMessage("Email must be valid"),
];

// Validation middleware for changing password
const validateChangePassword = [
  body("currentPassword").exists().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// @route GET /api/users/profile

router.get("/profile", protect, getUserProfile);

// @route PUT /api/users/profile
router.put(
  "/profile",
  protect,
  validateUpdateProfile,
  handleValidationErrors,
  updateUserProfile
);

// @route PUT /api/users/change-password
router.put(
  "/change-password",
  protect,
  validateChangePassword,
  handleValidationErrors,
  changePassword
);

// @route POST /api/users/upload-avatar
router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);

// @route GET /api/users
router.get("/", protect, getAllUsers);

export default router;

import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser } from "../controllers/authController.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js"; // If you have this as a separate file

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("dateOfBirth").notEmpty().withMessage("Date of birth is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phoneNumber")
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be 10 digits"),
    body("accountNumber")
      .matches(/^\d{10}$/)
      .withMessage("Account number must be 10 digits"),
    // Do NOT allow role or isAdmin from client!
  ],
  handleValidationErrors,
  registerUser
);

router.post(
  "/login",
  [
    body("emailorUsername")
      .notEmpty()
      .withMessage("Email or username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  loginUser
);
export default router;

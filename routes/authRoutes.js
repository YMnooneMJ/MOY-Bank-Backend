import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser } from "../controllers/authController.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js"; // If you have this as a separate file

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    // ...other validations
  ],
  handleValidationErrors,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  loginUser
);
export default router;
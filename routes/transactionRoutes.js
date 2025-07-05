import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { body } from "express-validator";
import handleValidationErrors from "../middleware/handleValidationErrors.js";
import {
  depositFunds,
  withdrawFunds,
  transferFunds,
  getTransactionHistory,
} from "../controllers/transactionController.js";

const router = express.Router();

// @route   POST /api/transactions/deposit

router.post(
  "/deposit",
  protect,
  [
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than zero"),
  ],
  handleValidationErrors,
  depositFunds
);

// @route   POST /api/transactions/withdraw
router.post(
  "/withdraw",
  protect,
  [
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than zero"),
  ],
  handleValidationErrors,
  withdrawFunds
);


// @route   POST /api/transactions/transfer
router.post(
  "/transfer",
  protect,
  [
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than zero"),
    body("toAccountNumber")
      .notEmpty()
      .withMessage("Receiver account number is required"),
  ],
  handleValidationErrors,
  transferFunds
);

// @route   GET /api/transactions/history
router.get("/history", protect, getTransactionHistory);

export default router;

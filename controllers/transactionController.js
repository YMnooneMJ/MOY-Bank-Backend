import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// Deposit Funds
export const depositFunds = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user._id;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Deposit amount must be greater than zero." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.balance += numericAmount;
    await user.save();

    const transaction = await Transaction.create({
      type: "deposit",
      amount: numericAmount,
      receiver: userId,
      description: description?.trim() || "Deposit into account",
      status: "success",
    });

    res.status(201).json({
      message: "Deposit successful",
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        receiver: transaction.receiver,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      newBalance: user.balance,
    });
  } catch (err) {
    console.error("Deposit error:", err);
    res.status(500).json({
      message: "Internal server error while processing deposit.",
      error: err.message,
    });
  }
};

// Transfer Funds (with MongoDB transaction/session)
export const transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, toAccountNumber, description } = req.body;
    const senderId = req.user._id;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Transfer amount must be greater than zero." });
    }

    const sender = await User.findById(senderId).session(session);
    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sender not found." });
    }

    if (sender.balance < numericAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance." });
    }

    const receiver = await User.findOne({
      accountNumber: toAccountNumber,
    }).session(session);
    if (!receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Receiver not found." });
    }

    if (receiver._id.equals(sender._id)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "You cannot transfer to your own account." });
    }

    // Update balances
    sender.balance -= numericAmount;
    receiver.balance += numericAmount;

    await sender.save({ session });
    await receiver.save({ session });

    const transaction = await Transaction.create(
      [
        {
          type: "transfer",
          amount: numericAmount,
          sender: sender._id,
          receiver: receiver._id,
          description:
            description?.trim() || `Transfer to ${receiver.fullName}`,
          status: "success",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Transfer successful.",
      transaction: {
        id: transaction[0]._id,
        type: transaction[0].type,
        amount: transaction[0].amount,
        sender: transaction[0].sender,
        receiver: transaction[0].receiver,
        description: transaction[0].description,
        status: transaction[0].status,
        createdAt: transaction[0].createdAt,
      },
      senderBalance: sender.balance,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transfer error:", err);
    res.status(500).json({
      message: "Internal server error while processing transfer.",
      error: err.message,
    });
  }
};

// Withdraw Funds
export const withdrawFunds = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user._id;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Withdrawal amount must be greater than zero." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.balance < numericAmount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    user.balance -= numericAmount;
    await user.save();

    const transaction = await Transaction.create({
      type: "withdrawal",
      amount: numericAmount,
      sender: userId,
      description: description?.trim() || "Withdrawal from account",
      status: "success",
    });

    res.status(201).json({
      message: "Withdrawal successful.",
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        sender: transaction.sender,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      newBalance: user.balance,
    });
  } catch (err) {
    console.error("Withdrawal error:", err);
    res.status(500).json({
      message: "Internal server error while processing withdrawal.",
      error: err.message,
    });
  }
};

// Get Transaction History (with pagination)
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "fullName accountNumber")
      .populate("receiver", "fullName accountNumber");

    const total = await Transaction.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found." });
    }

    res.status(200).json({
      message: "Transaction history retrieved successfully.",
      count: transactions.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      transactions: transactions.map((transaction) => ({
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        sender: transaction.sender
          ? {
              id: transaction.sender._id,
              fullName: transaction.sender.fullName,
              accountNumber: transaction.sender.accountNumber,
            }
          : null,
        receiver: transaction.receiver
          ? {
              id: transaction.receiver._id,
              fullName: transaction.receiver.fullName,
              accountNumber: transaction.receiver.accountNumber,
            }
          : null,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (err) {
    console.error("Transaction history error:", err);
    res.status(500).json({
      message: "Internal server error while fetching transaction history.",
      error: err.message,
    });
  }
};

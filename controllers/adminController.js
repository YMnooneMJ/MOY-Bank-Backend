import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password

    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Admin getAllUsers error:", err);
    res.status(500).json({
      message: "Failed to retrieve users",
      error: err.message,
    });
  }
};

// Get all transactions (Admin only)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate("sender", "fullName accountNumber")
      .populate("receiver", "fullName accountNumber");

    res.status(200).json({
      message: "All transactions retrieved successfully",
      count: transactions.length,
      transactions: transactions.map((tx) => ({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        sender: tx.sender
          ? {
              id: tx.sender._id,
              fullName: tx.sender.fullName,
              accountNumber: tx.sender.accountNumber,
            }
          : null,
        receiver: tx.receiver
          ? {
              id: tx.receiver._id,
              fullName: tx.receiver.fullName,
              accountNumber: tx.receiver.accountNumber,
            }
          : null,
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
      })),
    });
  } catch (err) {
    console.error("Admin getAllTransactions error:", err);
    res.status(500).json({
      message: "Failed to retrieve transactions",
      error: err.message,
    });
  }
};

// Toggle user active status (suspend or reactivate)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User has been ${user.isActive ? "re-activated" : "suspended"}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Toggle user status error:", err);
    res.status(500).json({
      message: "Internal server error while updating user status",
      error: err.message,
    });
  }
};

// Admin Dashboard Metrics
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const totalTransactions = await Transaction.countDocuments();
    const successfulTransactions = await Transaction.countDocuments({
      status: "success",
    });
    const failedTransactions = await Transaction.countDocuments({
      status: "failed",
    });

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalBalance: totalBalance[0]?.total || 0,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({
      message: "Failed to fetch dashboard metrics",
      error: err.message,
    });
  }
};

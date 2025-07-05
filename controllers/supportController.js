import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";

export const getSupportInbox = async (req, res) => {
  try {
    // Get latest message per userId
    const messages = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastMessage: { $first: "$text" },
          fromSupport: { $first: "$fromSupport" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users", // MongoDB collection name
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          fullName: "$user.fullName",
          email: "$user.email",
          lastMessage: 1,
          createdAt: 1,
          fromSupport: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Error getting support inbox:", err);
    res.status(500).json({ message: "Server error" });
  }
};

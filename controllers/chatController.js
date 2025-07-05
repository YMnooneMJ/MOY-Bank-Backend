import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";

// Get recent message per user
export const getSupportInbox = async (req, res) => {
  try {
    const messages = await ChatMessage.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$userId",
          lastMessage: { $first: "$text" },
          lastDate: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: "$_id",
          fullName: "$user.fullName",
          email: "$user.email",
          lastMessage: 1,
          lastDate: 1,
        },
      },
      { $sort: { lastDate: -1 } },
    ]);

    res.json(messages);
  } catch (error) {
    console.error("Inbox fetch error:", error);
    res.status(500).json({ message: "Failed to fetch support inbox" });
  }
};

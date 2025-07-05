import ChatMessage from "../models/ChatMessage.js";

// GET /api/support/messages/:userId
export const getUserMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    console.error("Failed to get messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

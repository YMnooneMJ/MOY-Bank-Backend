import express from "express";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();

router.get("/messages/:userId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.params.userId }).sort("createdAt");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

export default router;
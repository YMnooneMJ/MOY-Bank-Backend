import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    from: String,
    fromId: String,
    text: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromSupport: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;

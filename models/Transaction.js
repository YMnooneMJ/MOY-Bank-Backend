import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "transfer",
        "payment",
        "refund",
        "fee",
        "interest",
        "charges",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type !== "deposit" && this.type !== "refund";
      },
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return ["transfer", "payment"].includes(this.type);
      },
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transactionSchema);

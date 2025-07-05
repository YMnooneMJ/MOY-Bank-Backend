import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import dbConnection from "./config/db.js";
import ChatMessage from "./models/ChatMessage.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔐 Socket.IO auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Connect to MongoDB
dbConnection();

// Express Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => res.send("Welcome to MOY-Bank API"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/password", passwordRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Server error" });
});

// ✅ SOCKET.IO HANDLING
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.userId}`);

  // User joins their own room
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`📥 User ${userId} joined their room`);
  });

  // Admin joins support room
  socket.on("joinSupportRoom", () => {
    socket.join("support");
    console.log("👨‍💼 Admin joined support room");
  });

  // Handle incoming chat messages
  socket.on("chatMessage", async (msg) => {
    try {
      const saved = await ChatMessage.create({
        from: msg.from,
        fromId: msg.fromId,
        text: msg.text,
        userId: msg.fromSupport ? msg.userId : msg.fromId,
        fromSupport: msg.fromSupport || false,
      });

      // Send back to user/admin
      io.to(saved.userId.toString()).emit("chatMessage", saved);
      if (!saved.fromSupport) {
        io.to("support").emit("chatMessage", saved); // admin receives
      }
    } catch (error) {
      console.error("❌ Chat message error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❎ Disconnected: ${socket.userId}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running at http://localhost:${PORT}`);
});

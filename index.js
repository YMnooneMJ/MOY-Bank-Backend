import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import dbConnection from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config(); // Load environment variables from .env file
const app = express(); // Initialize express app
const PORT = process.env.PORT || 4000; // Default port

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Routes
app.get("/", (req, res) => res.send("Welcome to MOY-Bank API")); // Home route
app.use("/api/auth", authRoutes); // Authentication routes

// Connect to DB and then start server
dbConnection()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting to database:", err.message);
  });

export default app;

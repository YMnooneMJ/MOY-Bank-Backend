import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header with Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") // check if the header starts with "Bearer"
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]; // Split the header to get the token

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token using the secret key

      // Get user from token
      req.user = await User.findById(decoded.userId).select("-password"); //Exclude password from user data

      if (!req.user) {
        return res.status(401).json({ message: "User not found." });
      }

      next(); // continue to the next middleware or route handler
    } catch (err) {
      return res.status(401).json({
        message: "Not authorized, token failed",
        error: err.message,
      });
    }
  } else {
    // Missing or invalid token
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }
};
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};
 
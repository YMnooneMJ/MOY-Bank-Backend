import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const protect = async (req, res, next) => {
  let token;

  // Check fro Authorization header with Bearer token
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

      next(); // continue to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({
            message: "Not authorized, token failed",
            error: err.message
        })
    }
  }
};
export default protect;

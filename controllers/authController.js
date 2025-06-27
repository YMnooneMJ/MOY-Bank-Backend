import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

//Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      dateOfBirth,
      password,
      phoneNumber,
      accountNumber,
    } = req.bode;

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phoneNumber }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    User.password = hashedpassword;

    // Create new user
    const newUser = await User.create({
      fullName,
      username,
      email,
      dateOfBirth,
      password: hashedpassword,
      phoneNumber,
      accountNumber,
    });

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        balance: newUser.balance,
        role: newUser.role,
      },
      token, // JWT token
    });
  } catch (err) {
    res.status(500).json({
      message: "Resgistration failed",
      error: err.message,
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { emailorUsername, password } = req.body;

    // Check if user exists
    const user = await User.findOne({
      $or: [{ email: emailorUsername }, { username: emailorUsername }],
    }).select("+password"); //include password for check

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).josn({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user,
        fullName,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};

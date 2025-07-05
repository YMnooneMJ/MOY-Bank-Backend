import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      message: "All users fetched successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({
      message: "Failed to retrieve users",
      error: err.message,
    });
  }
};

// Get logged-in user's profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber,
        avatar: user.avatar
          ? `${req.protocol}://${req.get("host")}/uploads/${user.avatar}`
          : null,
      },
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      message: "Internal server error while fetching user profile.",
      error: err.message,
    });
  }
};

// Update logged-in user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found." });

    // Uniqueness checks
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists)
        return res.status(400).json({ message: "Username already taken." });
      user.username = username.trim();
    }
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists)
        return res.status(400).json({ message: "Email already in use." });
      user.email = email.trim();
    }
    if (fullName?.trim()) user.fullName = fullName.trim();

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber,
        avatar: user.avatar
          ? `${req.protocol}://${req.get("host")}/uploads/${user.avatar}`
          : null,
      },
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({
      message: "Internal server error while updating user profile.",
      error: err.message,
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error while updating password." });
  }
};

// Upload Avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = req.file.filename; // Only the filename
    await user.save();

    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: `${req.protocol}://${req.get("host")}/uploads/${user.avatar}`,
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res
      .status(500)
      .json({ message: "Failed to upload avatar", error: err.message });
  }
};

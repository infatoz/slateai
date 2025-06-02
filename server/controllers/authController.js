const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateTokens } = require("../utils/generateTokens");
const bcrypt = require("bcrypt");


// SIGNUP
exports.register = async (req, res) => {
  const { fullName, email, phoneNo, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newUser = await User.create({ fullName, email, phoneNo, password });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: "Logged in successfully",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid refresh token" });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Tokens refreshed" });
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  console.log("Updating profile for user:", req.user.id);
  
  const { fullName, phoneNo, avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phoneNo, avatar },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD (basic version)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // You can later implement token + email system
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Reset instructions sent (mocked)" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.refreshToken = "";
    await user.save();
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out successfully" });
};


import User from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import sendEmail, { sendVerificationEmail } from "../helper/send_email.js";
import crypto from "crypto";
import Vendor from "../models/vendor.js";
const otpStore = new Map();

const signUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User with same email already exist !" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const otp = Math.floor(100000 + Math.random() * 900000);
      otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

      const user = new User({
        fullName,
        email,
        password: hashedPassword,
        isVerified: false,
      });
      await user.save();

      const emailRes = await sendVerificationEmail(email, fullName, otp);
      res
        .status(201)
        .json({ msg: "Signup successfully. OTP sent to your email", emailRes });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res
        .status(400)
        .json({ message: "user not found with this email" });
    }
    if (!findUser.isVerified) {
      return res.status(400).json({ message: "Please verify your email" });
    }
    const isMatched = await bcrypt.compare(password, findUser.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    // Generate access token (short-lived: 15 minutes)
    const accessToken = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Generate refresh token (long-lived: 7 days)
    const refreshToken = jwt.sign(
      { id: findUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Save refresh token to database (replaces old token)
    findUser.refreshToken = refreshToken;
    await findUser.save();

    const {
      password: _,
      refreshToken: __,
      ...userWithoutPassword
    } = findUser._doc;
    return res.json({
      message: "Login successfully",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Find user and check if refresh token exists in database
    const user =
      (await User.findById(decoded.id)) || (await Vendor.findById(decoded.id));

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.refreshToken !== refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token not found or has been revoked" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Implement refresh token rotation (generate new refresh token)
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Replace old refresh token with new one
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, city, locality } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { state, city, locality },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserinformation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedotpData = otpStore.get(email);
    if (!storedotpData) {
      return res.status(400).json({
        message: "email not found",
      });
    }
    if (storedotpData.otp !== parseInt(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (Date.now() > storedotpData.expiresAt) {
      await User.deleteOne({ email });
      otpStore.delete(email);
      return res
        .status(400)
        .json({ message: "OTP expired, and your account deleted" });
    }
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    otpStore.delete(email);
    res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const vendor = await Vendor.findById(id);
    if (!user && !vendor) {
      return res.status(404).json({ message: "User or Vendor not found" });
    }
    if (user) {
      await User.findByIdAndDelete(id);
    } else {
      await Vendor.findByIdAndDelete(id);
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Decode to get user ID (without verification since token might be expired)
    const decoded = jwt.decode(refreshToken);
    if (!decoded || !decoded.id) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    // Find user and remove refresh token
    const user =
      (await User.findById(decoded.id)) || (await Vendor.findById(decoded.id));

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  signUp,
  signIn,
  refreshAccessToken,
  logout,
  updateLocation,
  getAllUsers,
  getUserinformation,
  verifyOtp,
  deleteUser,
};

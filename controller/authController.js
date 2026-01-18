import User from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import sendEmail, { sendVerificationEmail } from "../helper/send_email.js";
import crypto from "crypto";
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
    if (!findUser.isVerified) {
      return res.status(400).json({ message: "Please verify your email" });
    }
    if (findUser) {
      const isMatched = await bcrypt.compare(password, findUser.password);
      if (!isMatched) {
        return res.status(400).json({ message: "Incorrect Password" });
      } else {
        const token = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET);
        const { password, ...userWithoutPassword } = findUser._doc;
        return res.json({
          message: "Login successfully",
          user: userWithoutPassword,
          token: token,
        });
      }
    } else {
      return res.status(400).json({ message: "user not found with this emal" });
    }
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

export {
  signUp,
  signIn,
  updateLocation,
  getAllUsers,
  getUserinformation,
  verifyOtp,
};

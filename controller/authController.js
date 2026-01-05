import User from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
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
      const user = new User({ fullName, email, password: hashedPassword });
      await user.save();
      res.json({ user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
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
      { new: true }
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

export { signUp, signIn, updateLocation, getAllUsers };

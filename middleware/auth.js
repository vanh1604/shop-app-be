import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";
import Vendor from "../models/vendor.js";
dotenv.config();
const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user =
      (await User.findById(decoded.id)) || (await Vendor.findById(decoded.id));
    if (!user) {
      return res.status(401).json({ message: "User or Vendor not found " });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const vendorAuth = async (req, res, next) => {
  if (!req.user.role || req.user.role !== "vendor") {
    return res
      .status(403)
      .json({ message: "Access denied. Vendor only area." });
  }
  next();
};

export { auth, vendorAuth };

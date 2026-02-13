import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserinformation,
  signIn,
  signUp,
  updateLocation,
  verifyOtp,
  refreshAccessToken,
  logout,
} from "../controller/authController.js";
import { getOrderByVendorId } from "../controller/orderController.js";
import { auth } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/api/signup", signUp);
authRouter.post("/api/signin", signIn);
authRouter.post("/api/verify-otp", verifyOtp);
authRouter.post("/api/refresh-token", refreshAccessToken);
authRouter.post("/api/logout", logout);
authRouter.put("/api/users/:id", updateLocation);
authRouter.get("/api/orders/:vendorId", getOrderByVendorId);
authRouter.get("/api/users", getAllUsers);
authRouter.get("/api/userInfo/:id", auth, getUserinformation);
authRouter.delete("/api/users/:id", auth, deleteUser);
export default authRouter;

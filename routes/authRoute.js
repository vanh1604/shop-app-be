import express from "express";
import {
  getAllUsers,
  getUserinformation,
  signIn,
  signUp,
  updateLocation,
} from "../controller/authController.js";
import { getOrderByVendorId } from "../controller/orderController.js";

const authRouter = express.Router();

authRouter.post("/api/signup", signUp);
authRouter.post("/api/signin", signIn);
authRouter.put("/api/users/:id", updateLocation);
authRouter.get("/api/orders/:vendorId", getOrderByVendorId);
authRouter.get("/api/users", getAllUsers);
authRouter.get("/api/userInfo/:id", getUserinformation);
export default authRouter;

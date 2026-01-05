import express from "express";
import {
  getAllUsers,
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
export default authRouter;

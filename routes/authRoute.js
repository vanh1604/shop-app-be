import express from "express";
import {
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
export default authRouter;

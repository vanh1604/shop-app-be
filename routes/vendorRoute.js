import express from "express";
import {
  getAllVendorsStore,
  getVendors,
  updateVendorProfile,
  vendorSignIn,
  vendorSignUp,
} from "../controller/vendorController.js";
import { auth, vendorAuth } from "../middleware/auth.js";

const vendorRouter = express.Router();
vendorRouter.post("/api/vendor/signup", vendorSignUp);
vendorRouter.post("/api/vendor/signin", vendorSignIn);
vendorRouter.get("/api/vendors", getVendors);
vendorRouter.get("/api/vendors/stores", getAllVendorsStore);
vendorRouter.put(
  "/api/vendor/profile/:id",
  auth,
  vendorAuth,
  updateVendorProfile,
);
export default vendorRouter;

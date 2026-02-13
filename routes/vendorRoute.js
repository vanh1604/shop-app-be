import express from "express";
import {
  getAllVendorsStore,
  getVendors,
  vendorSignIn,
  vendorSignUp,
} from "../controller/vendorController.js";

const vendorRouter = express.Router();
vendorRouter.post("/api/vendor/signup", vendorSignUp);
vendorRouter.post("/api/vendor/signin", vendorSignIn);
vendorRouter.get("/api/vendors", getVendors);
vendorRouter.get("/api/vendors/stores", getAllVendorsStore);
export default vendorRouter;

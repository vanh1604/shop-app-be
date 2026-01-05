import express from "express";
import {
  getVendors,
  vendorSignIn,
  vendorSignUp,
} from "../controller/vendorController.js";

const vendorRouter = express.Router();
vendorRouter.post("/api/vendor/signup", vendorSignUp);
vendorRouter.post("/api/vendor/signin", vendorSignIn);
vendorRouter.get("/api/vendors", getVendors);
export default vendorRouter;

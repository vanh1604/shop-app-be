import express from "express";
import { vendorSignIn, vendorSignUp } from "../controller/vendorController.js";

const vendorRouter = express.Router();
vendorRouter.post("/api/vendor/signup", vendorSignUp);
vendorRouter.post("/api/vendor/signin", vendorSignIn);
export default vendorRouter;

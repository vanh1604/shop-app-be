import express from "express";
import { signIn, signUp, updateLocation } from "../controller/authController.js";

const authRouter = express.Router();

authRouter.post("/api/signup", signUp);
authRouter.post("/api/signin", signIn);
authRouter.put("/api/users/:id", updateLocation);
export default authRouter;

import express from "express";
import { signIn, signUp } from "../controller/authController.js";

const authRouter = express.Router();

authRouter.post("/api/signup", signUp);
authRouter.post("/api/signin", signIn);
export default authRouter;

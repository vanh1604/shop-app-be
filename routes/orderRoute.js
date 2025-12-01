import express from "express";
import { createOrder } from "../controller/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/api/createorder", createOrder);

export default orderRouter;

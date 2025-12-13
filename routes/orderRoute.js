import express from "express";
import {
  createOrder,
  getOrdersByBuyer,
} from "../controller/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/api/createorder", createOrder);
orderRouter.get("api/orders/:buyerId", getOrdersByBuyer);
export default orderRouter;

import express from "express";
import {
  createOrder,
  deleteOrderById,
  getOrdersByBuyer,
} from "../controller/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/api/createorder", createOrder);
orderRouter.get("/api/orders/:buyerId", getOrdersByBuyer);
orderRouter.delete("/api/orders/:orderId", deleteOrderById);
export default orderRouter;

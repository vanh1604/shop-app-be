import express from "express";
import {
  createOrder,
  deleteOrderById,
  getOrderByVendorId,
  getOrdersByBuyer,
  updateOrderById,
  updateProccessById,
} from "../controller/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/api/createorder", createOrder);
orderRouter.get("/api/orders/:buyerId", getOrdersByBuyer);
orderRouter.delete("/api/orders/:orderId", deleteOrderById);
orderRouter.get("/api/orders/vendors/:vendorId", getOrderByVendorId);
orderRouter.patch("/api/orders/:orderId/delivered", updateOrderById);
orderRouter.patch("/api/orders/:orderId/processing", updateProccessById);
export default orderRouter;

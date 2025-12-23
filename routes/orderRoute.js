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

//user
orderRouter.post("/api/createorder", createOrder);
orderRouter.get("/api/orders/buyers/:buyerId", getOrdersByBuyer);
orderRouter.delete("/api/orders/:orderId", deleteOrderById);

//vendor
orderRouter.get("/api/orders/vendors/:vendorId", getOrderByVendorId);
orderRouter.patch("/api/orders/:orderId/delivered", updateOrderById);
orderRouter.patch("/api/orders/:orderId/processing", updateProccessById);
export default orderRouter;

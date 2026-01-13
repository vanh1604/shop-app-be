import express from "express";
import {
  createOrder,
  deleteOrderById,
  getAllOrders,
  getOrderByVendorId,
  getOrdersByBuyer,
  paymentApi,
  updateOrderById,
  updateProccessById,
} from "../controller/orderController.js";
import { auth, vendorAuth } from "../middleware/auth.js";

const orderRouter = express.Router();

//user
orderRouter.post("/api/createorder", auth, createOrder);
orderRouter.get("/api/orders/buyers/:buyerId", auth, getOrdersByBuyer);
orderRouter.delete("/api/orders/:orderId", auth, deleteOrderById);

//vendor
orderRouter.get(
  "/api/orders/vendors/:vendorId",
  auth,
  vendorAuth,
  getOrderByVendorId
);
orderRouter.patch("/api/orders/:orderId/delivered", updateOrderById);
orderRouter.patch("/api/orders/:orderId/processing", updateProccessById);
orderRouter.post("/api/orders/payment", paymentApi);
orderRouter.get("/api/orders", getAllOrders);
export default orderRouter;

import express from "express";
import {
  createReviewProduct,
  getProductReview,
} from "../controller/productReviewController.js";

const productReviewRouter = express.Router();

productReviewRouter.post("/api/product-review", createReviewProduct);
productReviewRouter.get("/api/product-review", getProductReview);
export default productReviewRouter;

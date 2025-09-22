import express from "express";
import {
  createProduct,
  getProduct,
  getProductPopular,
  getRecommendProduct,
} from "../controller/productController.js";

const productRouter = express.Router();

productRouter.post("/api/createproduct", createProduct);
productRouter.get("/api/getproduct", getProduct);
productRouter.get("/api/getproductpopular", getProductPopular);
productRouter.get("/api/getrecommendproduct", getRecommendProduct);
export default productRouter;

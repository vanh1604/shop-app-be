import express from "express";
import {
  createProduct,
  getProduct,
  getProductByCategory,
  getProductById,
  getProductPopular,
  getRecommendProduct,
} from "../controller/productController.js";

const productRouter = express.Router();

productRouter.post("/api/createproduct", createProduct);
productRouter.get("/api/getproduct", getProduct);
productRouter.get("/api/getproductpopular", getProductPopular);
productRouter.get("/api/getrecommendproduct", getRecommendProduct);
productRouter.get("/api/getproductByCategory/:category", getProductByCategory);
productRouter.get("/api/getproductById/:id", getProductById);
export default productRouter;

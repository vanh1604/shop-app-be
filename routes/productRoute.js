import express from "express";
import {
  createProduct,
  getProduct,
  getProductByCategory,
  getProductById,
  getProductPopular,
  getRecommendProduct,
  relatedProducts,
  topRatedProducts,
} from "../controller/productController.js";
import { auth, vendorAuth } from "../middleware/auth.js";
const productRouter = express.Router();

productRouter.post("/api/createproduct", auth, createProduct);
productRouter.get("/api/getproduct", getProduct);
productRouter.get("/api/getproductpopular", getProductPopular);
productRouter.get("/api/getrecommendproduct", getRecommendProduct);
productRouter.get("/api/getproductByCategory/:category", getProductByCategory);
productRouter.get("/api/getproductById/:id", getProductById);
productRouter.get("/api/relatedproducts/:id", relatedProducts);
productRouter.get("/api/topratedproducts", topRatedProducts);
export default productRouter;

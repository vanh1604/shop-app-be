import express from "express";
import {
  createProduct,
  getProduct,
  getProductByCategory,
  getProductById,
  getProductBySubcategory,
  getProductPopular,
  getRecommendProduct,
  relatedProducts,
  searchProducts,
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
productRouter.get(
  "/api/products/subcategory/:subCategory",
  getProductBySubcategory
);
productRouter.get("/api/products/search", searchProducts);
export default productRouter;

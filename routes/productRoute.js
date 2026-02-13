import express from "express";
import {
  createProduct,
  getProduct,
  getProductByCategory,
  getProductById,
  getProductBySubcategory,
  getProductByVendorId,
  getProductPopular,
  getRecommendProduct,
  relatedProducts,
  searchProducts,
  topRatedProducts,
  updatedProduct,
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
  getProductBySubcategory,
);
productRouter.get("/api/products/search", searchProducts);
productRouter.get(
  "/api/products/vendor/:vendorId",
  auth,
  vendorAuth,
  getProductByVendorId,
);
productRouter.put("/api/products/update/:id", auth, vendorAuth, updatedProduct);
export default productRouter;

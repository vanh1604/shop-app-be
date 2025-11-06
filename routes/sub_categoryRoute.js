import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategory,
} from "../controller/subCategoryController.js";

const subCategoryRouter = express.Router();

subCategoryRouter.post("/api/subcategories", createSubCategory);
subCategoryRouter.get(
  "/api/category/:categoryName/subcategories",
  getSubCategory
);
subCategoryRouter.get("/api/subcategories", getAllSubCategories);
export default subCategoryRouter;

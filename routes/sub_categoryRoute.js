import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} from "../controller/subCategoryController.js";

const subCategoryRouter = express.Router();

subCategoryRouter.post("/api/subcategories", createSubCategory);
subCategoryRouter.get(
  "/api/category/:categoryName/subcategories",
  getSubCategory
);
subCategoryRouter.get("/api/subcategories", getAllSubCategories);
subCategoryRouter.get("/api/subcategories/:id", getSubCategoryById);
subCategoryRouter.put("/api/subcategories/:id", updateSubCategory);
subCategoryRouter.delete("/api/subcategories/:id", deleteSubCategory);
export default subCategoryRouter;

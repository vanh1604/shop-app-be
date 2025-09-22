import express from "express";
import {
  createSubCategory,
  getSubCategory,
} from "../controller/subCategoryController.js";

const subCategoryRouter = express.Router();

subCategoryRouter.post("/api/subcategories", createSubCategory);
subCategoryRouter.get("/api/getSubcategories/:categoryName", getSubCategory);
export default subCategoryRouter;

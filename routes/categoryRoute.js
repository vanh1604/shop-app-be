import express from "express";
import { createCategory, getCategory, updateCategory, deleteCategory } from "../controller/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.post("/api/createcategory", createCategory);
categoryRouter.get("/api/getcategory", getCategory);
categoryRouter.put("/api/category/:id", updateCategory);
categoryRouter.delete("/api/category/:id", deleteCategory);
export default categoryRouter;
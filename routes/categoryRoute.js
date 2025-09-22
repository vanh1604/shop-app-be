import express from "express";
import { createCategory, getCategory } from "../controller/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.post("/api/createcategory", createCategory);
categoryRouter.get("/api/getcategory", getCategory);
export default categoryRouter;
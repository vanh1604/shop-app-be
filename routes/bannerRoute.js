import express from "express";
import { createBanner, getBanner, deleteBanner } from "../controller/bannerController.js";

const bannerRouter = express.Router();

bannerRouter.post("/api/createbanner", createBanner);
bannerRouter.get("/api/getbanner", getBanner);
bannerRouter.delete("/api/deletebanner/:id", deleteBanner);
export default bannerRouter;

import express from 'express';
import { createBanner, getBanner } from '../controller/bannerController.js';


const bannerRouter = express.Router();

bannerRouter.post("/api/createbanner", createBanner);
bannerRouter.get("/api/getbanner", getBanner);
export default bannerRouter;
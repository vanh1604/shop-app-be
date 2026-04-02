import express from "express";
import connectDB from "./config/mongoDb.js";
import authRouter from "./routes/authRoute.js";
import cors from "cors";
import bannerRouter from "./routes/bannerRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import subCategoryRouter from "./routes/sub_categoryRoute.js";
import productRouter from "./routes/productRoute.js";
import productReviewRouter from "./routes/productReviewRoute.js";
import vendorRouter from "./routes/vendorRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatRouter from "./routes/chatRoutes.js";
import notificationRouter from "./routes/notificationRoute.js";
import { initializeFirebase } from "./config/firebaseConfig.js";

const PORT = 3000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
// Thêm đoạn này vào NGAY TRƯỚC dòng app.use(authRouter);
app.use((req, res, next) => {
  next();
});
// Router
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);
app.use(orderRouter);
app.use(chatRouter);
app.use(notificationRouter);

// Kết nối đến Database
connectDB();

// Khởi tạo Firebase Admin SDK
initializeFirebase();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import connectDB from "./config/mongoDb.js";
import authRouter from "./routes/authRoute.js";
import cors from "cors";
import bannerRouter from "./routes/bannerRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
const PORT = 3000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Router
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);

// Kết nối đến Database
connectDB();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

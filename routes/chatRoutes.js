import express from "express";
import { auth } from "../middleware/auth.js";
import { perMinuteLimit, perDayLimit } from "../middleware/chatRateLimit.js";
import { sendMessage, getHistory, clearSession } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/api/chat/message", auth, perMinuteLimit, perDayLimit, sendMessage);
chatRouter.get("/api/chat/history", auth, getHistory);
chatRouter.delete("/api/chat/clear", auth, clearSession);

export default chatRouter;

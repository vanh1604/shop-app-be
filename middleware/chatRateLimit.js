import rateLimit from "express-rate-limit";

// 15 messages per minute per user (auth middleware always runs first, so req.user is guaranteed)
export const perMinuteLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req) => req.user._id.toString(),
  handler: (req, res) => {
    res.status(429).json({
      message: "Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ 1 phút.",
    });
  },
});

// 100 messages per day per user (in-memory)
const dailyCounts = new Map();

// Reset counts every 24h
setInterval(() => dailyCounts.clear(), 24 * 60 * 60 * 1000);

export const perDayLimit = (req, res, next) => {
  const userId = req.user?._id?.toString();
  if (!userId) return next();

  const today = new Date().toDateString();
  const key = `${userId}:${today}`;
  const count = dailyCounts.get(key) || 0;

  if (count >= 100) {
    return res.status(429).json({
      message: "Bạn đã đạt giới hạn 100 tin nhắn hôm nay. Vui lòng thử lại vào ngày mai.",
    });
  }

  dailyCounts.set(key, count + 1);
  next();
};

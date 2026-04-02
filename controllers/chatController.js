import chatService from "../services/chatService.js";
import conversationService from "../services/conversationService.js";
import { MAX_INPUT_LENGTH } from "../config/aiConfig.js";

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    let { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    // Sanitize: strip HTML tags and limit length
    message = message.replace(/<\/?[^>]+(>|$)/g, "").substring(0, MAX_INPUT_LENGTH).trim();

    if (!message) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const session = await conversationService.getOrCreateSession(userId);
    const history = conversationService.getHistoryWindow(session);

    const { text, products, tokensUsed } = await chatService.processMessage(message, history);

    await conversationService.appendMessages(session, message, text, products);

    const formattedProducts = products.slice(0, 6).map((p) => ({
      id: p._id?.toString() || p.id || p.productId,
      name: p.name,
      price: p.price,
      images: p.images,
      category: p.category,
      averageRating: p.averageRating,
    }));

    res.json({
      data: {
        message: text,
        products: formattedProducts,
        sessionId: session.sessionId,
        tokensUsed,
      },
    });
  } catch (error) {
    console.error("Chat error:", error?.message || error);
    const isApiKeyError =
      error?.message?.includes("API key") ||
      error?.status === 401 ||
      error?.message?.includes("authentication");
    if (isApiKeyError) {
      return res.status(500).json({ message: "Cấu hình AI không hợp lệ. Liên hệ admin." });
    }
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau." });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await conversationService.getHistory(userId);
    res.json({ data: { messages } });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Không thể tải lịch sử chat." });
  }
};

export const clearSession = async (req, res) => {
  try {
    const userId = req.user._id;
    await conversationService.clearSession(userId);
    res.json({ data: { message: "Đã xóa lịch sử chat." } });
  } catch (error) {
    console.error("Clear session error:", error);
    res.status(500).json({ message: "Không thể xóa lịch sử chat." });
  }
};

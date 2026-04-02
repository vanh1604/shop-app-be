import { v4 as uuidv4 } from "uuid";
import ChatSession from "../models/ChatSession.js";
import { MAX_HISTORY_MESSAGES } from "../config/aiConfig.js";

class ConversationService {
  async getOrCreateSession(userId) {
    let session = await ChatSession.findOne({ userId, isActive: true });
    if (!session) {
      session = await ChatSession.create({
        userId,
        sessionId: uuidv4(),
        messages: [],
      });
    }
    return session;
  }

  getHistoryWindow(session) {
    const recent = session.messages.slice(-MAX_HISTORY_MESSAGES);
    return recent.map((m) => ({ role: m.role, content: m.content }));
  }

  async appendMessages(session, userMessage, assistantText, products) {
    session.messages.push({ role: "user", content: userMessage });
    session.messages.push({
      role: "assistant",
      content: assistantText,
      products: products.map((p) => ({
        productId: p._id?.toString() || p.id,
        name: p.name,
        price: p.price,
        images: p.images,
        category: p.category,
        averageRating: p.averageRating,
      })),
    });
    session.lastActive = new Date();
    await session.save();
  }

  async clearSession(userId) {
    await ChatSession.updateMany({ userId }, { isActive: false });
  }

  async getHistory(userId) {
    const session = await ChatSession.findOne({ userId, isActive: true }).lean();
    if (!session) return [];
    return session.messages;
  }
}

export default new ConversationService();

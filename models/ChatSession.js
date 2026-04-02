import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  products: [
    {
      productId: String,
      name: String,
      price: Number,
      images: [String],
      category: String,
      averageRating: Number,
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: { type: String, required: true, unique: true },
    messages: [MessageSchema],
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-delete sessions inactive for 24h
ChatSessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 86400 });

const ChatSession = mongoose.model("ChatSession", ChatSessionSchema);
export default ChatSession;

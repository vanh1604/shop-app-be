import OpenAI from "openai";
import { SYSTEM_PROMPT, OPENAI_TOOLS, OPENROUTER_MODEL } from "../config/aiConfig.js";
import productQueryService from "./productQueryService.js";

const TOOL_HANDLERS = {
  search_products: (args) => productQueryService.searchProducts(args),
  filter_products: (args) => productQueryService.filterProducts(args),
  get_top_rated: (args) => productQueryService.getTopRated(args),
  get_product_detail: (args) => productQueryService.getProductDetail(args),
};

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

class ChatService {
  async processMessage(userMessage, conversationHistory) {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    let collectedProducts = [];
    let tokensUsed = 0;

    // Agentic loop — stateless, keep appending messages
    while (true) {
      const response = await client.chat.completions.create({
        model: OPENROUTER_MODEL,
        messages,
        tools: OPENAI_TOOLS,
      });

      const choice = response.choices[0];
      tokensUsed +=
        (response.usage?.prompt_tokens ?? 0) +
        (response.usage?.completion_tokens ?? 0);

      if (choice.finish_reason === "tool_calls") {
        const assistantMessage = choice.message;
        messages.push(assistantMessage);

        for (const toolCall of assistantMessage.tool_calls) {
          const name = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);

          let output;
          try {
            output = await this._runTool(name, args);
            if (Array.isArray(output)) {
              collectedProducts.push(...output);
            } else if (output && typeof output === "object") {
              collectedProducts.push(output);
            }
          } catch (err) {
            output = { error: err.message };
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(output),
          });
        }
      } else {
        const text = choice.message.content;
        return { text, products: collectedProducts, tokensUsed };
      }
    }
  }

  async _runTool(name, args) {
    const handler = TOOL_HANDLERS[name];
    if (!handler) throw new Error(`Unknown tool: ${name}`);
    return handler(args);
  }
}

export default new ChatService();

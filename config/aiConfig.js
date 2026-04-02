export const SYSTEM_PROMPT = `Bạn là trợ lý mua sắm AI của ShopApp. Bạn giúp khách hàng tìm kiếm sản phẩm phù hợp với nhu cầu.

Quy tắc:
- Luôn sử dụng tools để tìm kiếm sản phẩm, KHÔNG bịa đặt thông tin sản phẩm
- Giới hạn tối đa 6 sản phẩm mỗi lần trả về
- Trả lời bằng ngôn ngữ người dùng đang sử dụng (tiếng Việt hoặc tiếng Anh)
- Nếu không tìm thấy sản phẩm phù hợp, hãy thông báo lịch sự và gợi ý tìm kiếm khác
- Không hỏi quá nhiều câu hỏi làm rõ, hãy thử tìm kiếm ngay với thông tin đã có
- Khi người dùng hỏi về sản phẩm cụ thể từ cuộc hội thoại trước, dùng context để hiểu ý định`;

// OpenAI function calling format (compatible with OpenRouter)
export const OPENAI_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Tìm kiếm sản phẩm theo từ khóa trong tên và mô tả. Dùng khi người dùng tìm kiếm sản phẩm cụ thể theo tên hoặc mô tả.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Từ khóa tìm kiếm (tên sản phẩm, mô tả). Ví dụ: 'áo thun', 'giày sneaker'",
          },
          maxResults: {
            type: "number",
            description: "Số lượng kết quả tối đa (mặc định 6)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "filter_products",
      description:
        "Lọc sản phẩm theo danh mục, giá, rating. Dùng khi người dùng muốn lọc theo tiêu chí cụ thể như giá, loại sản phẩm.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description:
              "Danh mục sản phẩm (ví dụ: 'Áo', 'Quần', 'Giày', 'Túi')",
          },
          subCategory: {
            type: "string",
            description: "Danh mục con (ví dụ: 'Áo thun', 'Áo sơ mi')",
          },
          minPrice: {
            type: "number",
            description: "Giá tối thiểu (USD)",
          },
          maxPrice: {
            type: "number",
            description: "Giá tối đa (USD)",
          },
          minRating: {
            type: "number",
            description: "Rating tối thiểu (0-5)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_top_rated",
      description:
        "Lấy sản phẩm nổi bật: top rated, phổ biến, hoặc được đề xuất.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description:
              "Loại sản phẩm nổi bật: 'top_rated', 'popular', hoặc 'recommended'",
          },
          category: {
            type: "string",
            description: "Lọc theo danh mục (tùy chọn)",
          },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_detail",
      description: "Lấy thông tin chi tiết của một sản phẩm theo ID.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "ID của sản phẩm",
          },
        },
        required: ["productId"],
      },
    },
  },
];

export const OPENROUTER_MODEL = "google/gemini-2.0-flash-001";
export const MAX_HISTORY_MESSAGES = 10;
export const MAX_INPUT_LENGTH = 500;

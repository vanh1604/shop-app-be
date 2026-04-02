import Product from "../models/product.js";

const PRODUCT_SELECT = "name price images category subCategory averageRating totalRatings";

class ProductQueryService {
  async searchProducts({ query, maxResults = 6 }) {
    const regex = new RegExp(query, "i");
    return await Product.find({
      $or: [{ name: regex }, { description: regex }],
      quantity: { $gt: 0 },
    })
      .select(PRODUCT_SELECT)
      .sort({ averageRating: -1 })
      .limit(Math.min(maxResults, 6))
      .lean();
  }

  async filterProducts({ category, subCategory, minPrice, maxPrice, minRating } = {}) {
    const query = { quantity: { $gt: 0 } };

    if (category) query.category = { $regex: category, $options: "i" };
    if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (minRating !== undefined) {
      query.averageRating = { $gte: minRating };
    }

    return await Product.find(query)
      .select(PRODUCT_SELECT)
      .sort({ averageRating: -1 })
      .limit(6)
      .lean();
  }

  async getTopRated({ type, category } = {}) {
    const query = { quantity: { $gt: 0 } };
    if (category) query.category = { $regex: category, $options: "i" };

    let sortField = { averageRating: -1 };
    if (type === "popular") {
      query.popular = true;
    } else if (type === "recommended") {
      query.recommend = true;
    }

    return await Product.find(query)
      .select(PRODUCT_SELECT)
      .sort(sortField)
      .limit(6)
      .lean();
  }

  async getProductDetail({ productId }) {
    return await Product.findById(productId).lean();
  }
}

export default new ProductQueryService();

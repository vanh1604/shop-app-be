import Product from "../models/product.js";
import ProductReview from "../models/product_review.js";

const createReviewProduct = async (req, res) => {
  try {
    const { productId, buyerId, rating, review, email, fullName } = req.body;
    const productReview = new ProductReview({
      productId,
      buyerId,
      email,
      fullName,
      rating,
      review,
    });
    await productReview.save();

    const existingReview = await ProductReview.findOne({
      productId,
      buyerId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.totalRatings = product.totalRatings + 1;
    product.averageRating =
      (product.averageRating * (product.totalRatings - 1) + rating) /
      product.totalRatings;

    await product.save();
    res.status(201).json({ productReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductReview = async (req, res) => {
  try {
    const productReview = await ProductReview.find();
    res.status(200).json({ productReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createReviewProduct, getProductReview };

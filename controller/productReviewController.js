import ProductReview from "../models/product_review.js";

const createReviewProduct = async (req, res) => {
  try {
    const { productId, userId, rating, review, email, fullName } = req.body;
    const productReview = new ProductReview({
      productId,
      userId,
      email,
      fullName,
      rating,
      review,
    });
    await productReview.save();
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

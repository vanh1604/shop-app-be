import mongoose from "mongoose";

const ProductReviewSchema = mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  buyerId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
});

const ProductReview = mongoose.model("ProductReview", ProductReviewSchema);
export default ProductReview;

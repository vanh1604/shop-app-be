import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  ward: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  buyerId: {
    type: String,
    required: true,
  },
  vendorId: {
    type: String,
    required: true,
  },
  processing: {
    type: Boolean,
    required: true,
    default: true,
  },
  delivered: {
    type: Boolean,
    required: true,
    default: false,
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  selectedSize: {
    type: String,
  },
  variantId: {
    type: String,
  },
});
const Order = mongoose.model("Order", orderSchema);
export default Order;

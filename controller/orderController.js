import Order from "../models/order.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const createOrder = async (req, res) => {
  try {
    // Logic to create an order
    const {
      fullName,
      email,
      state,
      city,
      locality,
      productName,
      productPrice,
      quantity,
      category,
      image,
      buyerId,
      vendorId,
      processing,
      delivered,
    } = new Order(req.body);
    const createAt = new Date().getMilliseconds();
    const order = new Order({
      fullName,
      email,
      state,
      city,
      locality,
      productName,
      productPrice,
      quantity,
      category,
      image,
      buyerId,
      vendorId,
      delivered,
      processing,
      createAt,
    });
    await order.save();
    return res
      .status(201)
      .json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrdersByBuyer = async (req, res) => {
  try {
    const buyerId = req.params.buyerId;
    const orders = await Order.find({ buyerId: buyerId });
    return res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderByVendorId = async (req, res) => {
  const vendorId = req.params.vendorId;
  try {
    const orders = await Order.find({ vendorId: vendorId });
    if (!orders) {
      return res.status(404).json({ message: "Orders not found" });
    }
    return res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderById = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProccessById = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOrderById = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const paymentApi = async (req, res) => {
  try {
    const { orderId, currency = "usd" } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const totalPrice = order.productPrice * order.quantity;
    const amount = Math.round(totalPrice * 100); // Convert to cents
    const stripe = new Stripe(process.env.STRIPE_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      description: "E-commerce Payment",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(200).json({
      message: "Payment successful",
      clientSecret: paymentIntent.client_secret,
      paymentIntent: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const stripeRetrieve = async (res, req) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
    res.status(200).json({ paymentIntent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createOrder,
  getOrdersByBuyer,
  deleteOrderById,
  getOrderByVendorId,
  updateOrderById,
  updateProccessById,
  getAllOrders,
  paymentApi,
  stripeRetrieve,
};

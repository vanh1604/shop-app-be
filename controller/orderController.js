import Order from "../models/order.js";
import User from "../models/user.js";
import Vendor from "../models/vendor.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { sendToTokens } from "../services/notificationService.js";
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
      selectedSize,
      variantId,
    } = req.body;
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
      ...(selectedSize && { selectedSize }),
      ...(variantId && { variantId }),
    });
    await order.save();

    // Notify vendor about the new order (fire-and-forget)
    if (vendorId) {
      Vendor.findById(vendorId)
        .select('fcmTokens')
        .then((vendor) => {
          if (vendor?.fcmTokens?.length > 0) {
            sendToTokens(
              vendor.fcmTokens,
              {
                title: '📦 Đơn hàng mới!',
                body: `Bạn có đơn hàng mới cho '${productName}'`,
              },
              { type: 'new_order', orderId: order._id.toString() }
            ).then((invalidTokens) => {
              if (invalidTokens.length > 0) {
                Vendor.findByIdAndUpdate(vendorId, {
                  $pull: { fcmTokens: { $in: invalidTokens } },
                }).exec();
              }
            });
          }
        })
        .catch((e) => console.error('[FCM] createOrder notify error:', e.message));
    }

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

    // Notify buyer that order has been delivered (fire-and-forget)
    if (order.buyerId) {
      User.findById(order.buyerId)
        .select('fcmTokens')
        .then((buyer) => {
          if (buyer?.fcmTokens?.length > 0) {
            sendToTokens(
              buyer.fcmTokens,
              {
                title: '✅ Đơn hàng đã giao!',
                body: `Đơn hàng '${order.productName}' đã được giao thành công`,
              },
              { type: 'order_update', orderId: orderId, status: 'delivered' }
            ).then((invalidTokens) => {
              if (invalidTokens.length > 0) {
                User.findByIdAndUpdate(order.buyerId, {
                  $pull: { fcmTokens: { $in: invalidTokens } },
                }).exec();
              }
            });
          }
        })
        .catch((e) => console.error('[FCM] updateDelivered notify error:', e.message));
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

    // Notify buyer that order is being processed (fire-and-forget)
    if (order.buyerId) {
      User.findById(order.buyerId)
        .select('fcmTokens')
        .then((buyer) => {
          if (buyer?.fcmTokens?.length > 0) {
            sendToTokens(
              buyer.fcmTokens,
              {
                title: '🚚 Cập nhật đơn hàng',
                body: `Đơn hàng '${order.productName}' đang được xử lý`,
              },
              { type: 'order_update', orderId: orderId, status: 'processing' }
            ).then((invalidTokens) => {
              if (invalidTokens.length > 0) {
                User.findByIdAndUpdate(order.buyerId, {
                  $pull: { fcmTokens: { $in: invalidTokens } },
                }).exec();
              }
            });
          }
        })
        .catch((e) => console.error('[FCM] updateProcess notify error:', e.message));
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

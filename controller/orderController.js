import Order from "../models/order.js";

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
  const buyerId = req.params.buyerId;
  try {
    const orders = await Order.find({ buyerId: buyerId });

    return res.status(200).json({ orders });
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
export { createOrder, getOrdersByBuyer, deleteOrderById };

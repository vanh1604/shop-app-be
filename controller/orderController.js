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
export { createOrder };

import Product from "../models/product.js";

const createProduct = async (req, res) => {
  const { name, price, description, quantity, images, category, subCategory } =
    req.body;
  try {
    const product = new Product({
      name,
      price,
      description,
      quantity,
      images,
      category,
      subCategory,
    });
    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductPopular = async (req, res) => {
  try {
    const products = await Product.find({ popular: true });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommendProduct = async (req, res) => {
  try {
    const products = await Product.find({ recommend: true });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createProduct, getProduct, getProductPopular, getRecommendProduct };

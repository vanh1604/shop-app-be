import Product from "../models/product.js";

const createProduct = async (req, res) => {
  const {
    name,
    price,
    description,
    quantity,
    vendorId,
    fullName,
    images,
    category,
    subCategory,
  } = req.body;
  try {
    const product = new Product({
      name,
      price,
      description,
      quantity,
      images,
      category,
      subCategory,
      vendorId,
      fullName,
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
    res.status(200).json(products);
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

const getProductByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category, popular: true });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const relatedProducts = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    } else {
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
      }).limit(5);
      if (relatedProducts.length === 0) {
        return res.status(404).json({ message: "No related products found" });
      }
      res.status(200).json({ relatedProducts });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const topRatedProducts = async (req, res) => {
  try {
    const topRatedProducts = await Product.find()
      .sort({ averageRating: -1 })
      .limit(10);
    if (!topRatedProducts || topRatedProducts.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json({ topRatedProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductBySubcategory = async (req, res) => {
  const { subCategory } = req.params;
  try {
    const products = await Product.find({ subCategory });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchProducts = async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createProduct,
  getProduct,
  getProductPopular,
  getRecommendProduct,
  getProductByCategory,
  getProductById,
  relatedProducts,
  topRatedProducts,
  getProductBySubcategory,
  searchProducts,
};

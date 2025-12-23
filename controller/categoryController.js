import Category from "../models/category.js";

const createCategory = async (req, res) => {
  try {
    const { name, image, banner } = req.body;
    const category = new Category({ name, image, banner });
    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.find();

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createCategory, getCategory };

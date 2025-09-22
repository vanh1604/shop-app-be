import SubCategory from "../models/sub_category.js";

const createSubCategory = async (req, res) => {
  const { categoryId, categoryName, image, subCategoryName } = req.body;
  try {
    const subCategory = new SubCategory({
      categoryId,
      categoryName,
      image,
      subCategoryName,
    });
    await subCategory.save();
    res.status(201).json({ subCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSubCategory = async (req, res) => {
  const { categoryName } = req.params;
  try {
    const subCategories = await SubCategory.find({
      categoryName: categoryName,
    });
    if (!subCategories || subCategories.length === 0) {
      return res.status(404).json({ message: "SubCategory not found" });
    }
    res.status(200).json({ subCategories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createSubCategory, getSubCategory };

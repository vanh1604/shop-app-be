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

const getAllSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find({});
    res.status(200).json({ subcategories });
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

const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }
    res.status(200).json({ subCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, categoryName, image, subCategoryName } = req.body;
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { categoryId, categoryName, image, subCategoryName },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.status(200).json({ subCategory: updatedSubCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

    if (!deletedSubCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.status(200).json({ message: "SubCategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createSubCategory,
  getSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
};

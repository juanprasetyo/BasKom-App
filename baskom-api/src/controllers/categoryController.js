const {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../models/categoryModel');

const createCategoryHandler = async (req, res) => {
  const { name } = req.body;

  try {
    const category = await createCategory(name);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoryByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllCategoriesHandler = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCategoryHandler = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await updateCategory(id, name);
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCategoryHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await deleteCategory(id);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategoryHandler,
  getCategoryByIdHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
};

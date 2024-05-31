const {
  addProductCategory,
  deleteProductCategory,
} = require('../models/productCategoryModel');
const { findProductById } = require('../models/productModel');
const { getCategoryById } = require('../models/categoryModel');

const addProductCategoryHandler = async (req, res) => {
  const { id: userId } = req.user;
  const { productId, categoryId } = req.body;

  try {
    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${productId} not found` });
    }
    if (product.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this product' });
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ error: `Category with ID ${categoryId} not found` });
    }

    const newProductCategory = await addProductCategory(productId, categoryId);
    res.status(201).json(newProductCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProductCategoryHandler = async (req, res) => {
  const { id: userId } = req.user;
  const { productId, categoryId } = req.body;

  try {
    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${productId} not found` });
    }
    if (product.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this product' });
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ error: `Category with ID ${categoryId} not found` });
    }

    await deleteProductCategory(productId, categoryId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProductCategoryHandler,
  deleteProductCategoryHandler,
};

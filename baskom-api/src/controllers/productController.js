const {
  createProduct,
  findProductById,
  updateProduct,
  softDeleteProduct,
  getAllProducts,
  findProductsByUserId,
} = require('../models/productModel');
const { addProductCategory } = require('../models/productCategoryModel');
const { validateCategories } = require('../utils/categoryUtil');

const addProductHandler = async (req, res) => {
  const { id: userId } = req.user;
  const {
    name, description, price, qty, categoryIds,
  } = req.body;

  try {
    const invalidCategoryIds = await validateCategories(categoryIds);
    if (invalidCategoryIds.length > 0) {
      return res.status(404).json({ error: `Categories with IDs ${invalidCategoryIds.join(', ')} not found` });
    }

    const newProduct = await createProduct({
      name, description, price, qty, userId,
    });

    const productCategoryPromises = categoryIds.map(
      (categoryId) => addProductCategory(newProduct.id, categoryId),
    );
    await Promise.all(productCategoryPromises);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProductsHandler = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProductsByUserIdHandler = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const products = await findProductsByUserId(userId);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await findProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProductHandler = async (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  const { id: userId } = req.user;

  try {
    const product = await findProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this product' });
    }

    const updatedProduct = await updateProduct(id, productData);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProductHandler = async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  try {
    const product = await findProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this product' });
    }

    await softDeleteProduct(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProductHandler,
  getAllProductsHandler,
  getAllProductsByUserIdHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
};

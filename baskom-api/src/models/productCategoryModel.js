const pool = require('../config/db');

const addProductCategory = async (productId, categoryId) => {
  await pool.query(
    'INSERT INTO product_categories (product_id, category_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
    [productId, categoryId],
  );
};

const findProductCategoriesByProductId = async (productId) => {
  const result = await pool.query(
    'SELECT * FROM product_categories WHERE product_id = $1',
    [productId],
  );
  return result.rows;
};

const findProductCategoriesByCategoryId = async (categoryId) => {
  const result = await pool.query(
    'SELECT * FROM product_categories WHERE category_id = $1',
    [categoryId],
  );
  return result.rows;
};

const deleteProductCategory = async (productId, categoryId) => {
  await pool.query(
    'DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2',
    [productId, categoryId],
  );
};

module.exports = {
  addProductCategory,
  findProductCategoriesByProductId,
  findProductCategoriesByCategoryId,
  deleteProductCategory,
};

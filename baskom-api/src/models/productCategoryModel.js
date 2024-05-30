const pool = require('../config/db');

const addProductCategory = async (productId, categoryId) => {
  await pool.query(
    'INSERT INTO product_categories (product_id, category_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
    [productId, categoryId],
  );
};

const deleteProductCategory = async (productId, categoryId) => {
  await pool.query(
    'DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2',
    [productId, categoryId],
  );
};

module.exports = {
  addProductCategory,
  deleteProductCategory,
};

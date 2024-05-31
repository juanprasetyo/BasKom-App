const pool = require('../config/db');

const addProductCategory = async (productId, categoryId) => {
  const result = await pool.query(
    'INSERT INTO product_categories (product_id, category_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
    [productId, categoryId],
  );
  return result.rows[0];
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

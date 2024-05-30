const pool = require('../config/db');

const createProduct = async (productData) => {
  const {
    name, description, price, qty, userId,
  } = productData;
  const result = await pool.query(
    `INSERT INTO products (name, description, price, qty, user_id, deleted, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), false) RETURNING *`,
    [name, description, price, qty, userId],
  );
  return result.rows[0];
};

const findProductById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1 AND deleted = false',
    [id],
  );
  return result.rows[0];
};

const updateProduct = async (id, productData) => {
  const {
    name, description, price, qty,
  } = productData;
  const result = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, qty = $4, updated_at = NOW()
     WHERE id = $5 AND deleted = false RETURNING *`,
    [name, description, price, qty, id],
  );
  return result.rows[0];
};

const softDeleteProduct = async (id) => {
  await pool.query(
    'UPDATE products SET deleted = true, updated_at = NOW() WHERE id = $1',
    [id],
  );
};

const getAllProducts = async () => {
  const result = await pool.query(
    'SELECT * FROM products WHERE deleted = false',
  );
  return result.rows;
};

const findProductsByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM products WHERE user_id = $1 AND deleted = false',
    [userId],
  );
  return result.rows;
};

module.exports = {
  createProduct,
  findProductById,
  updateProduct,
  softDeleteProduct,
  getAllProducts,
  findProductsByUserId,
};

const pool = require('../config/db');

const createCategory = async (name) => {
  const result = await pool.query(
    'INSERT INTO categories (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
    [name],
  );
  return result.rows[0];
};

const getCategoryById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM categories WHERE id = $1',
    [id],
  );
  return result.rows[0];
};

const getAllCategories = async () => {
  const result = await pool.query('SELECT * FROM categories');
  return result.rows;
};

const updateCategory = async (id, name) => {
  const result = await pool.query(
    'UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [name, id],
  );
  return result.rows[0];
};

const deleteCategory = async (id) => {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
};

module.exports = {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
};

const pool = require('../config/db');
const { deleteImageFromImagekit } = require('../helpers/imagekitHelper');

const addProductImage = async (productId, imageId) => {
  const result = await pool.query(
    'INSERT INTO product_images (product_id, image_id) VALUES ($1, $2) RETURNING *',
    [productId, imageId],
  );
  return result.rows[0];
};

const deleteProductImage = async (productId, imageId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const imageRes = await client.query('SELECT file_id FROM images WHERE id = $1', [imageId]);
    if (imageRes.rows.length === 0) {
      throw new Error('Image not found');
    }
    const fileId = imageRes.rows[0].file_id;

    await client.query('DELETE FROM product_images WHERE product_id = $1 AND image_id = $2', [productId, imageId]);
    await client.query('DELETE FROM images WHERE id = $1', [imageId]);

    await deleteImageFromImagekit(fileId);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  addProductImage,
  deleteProductImage,
};

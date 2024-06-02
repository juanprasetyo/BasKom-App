const db = require('../config/db');

const addImage = async ({ fileId, url }) => {
  const result = await db.query(
    'INSERT INTO images (file_id, url) VALUES ($1, $2) RETURNING *',
    [fileId, url],
  );
  return result.rows[0];
};

const deleteImageById = async (id) => {
  const result = await db.query(
    'DELETE FROM images WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0];
};

const findImageById = async (id) => {
  const result = await db.query(
    'SELECT * FROM images WHERE id = $1',
    [id],
  );
  return result.rows[0];
};

module.exports = {
  addImage,
  deleteImageById,
  findImageById,
};

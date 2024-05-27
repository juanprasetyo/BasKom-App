const pool = require('../config/db');

const createUpgradeRole = async (userId, documentUrl) => {
  const result = await pool.query(
    `INSERT INTO upgrade_role (user_id, status, document_url, created_at, updated_at)
     VALUES ($1, 'waiting', $2, NOW(), NOW())
     RETURNING *`,
    [userId, documentUrl],
  );

  return result.rows[0];
};

const findExistingUpgradeRole = async (userId) => {
  const query = 'SELECT * FROM upgrade_role WHERE user_id = $1 AND (status = $2 OR status = $3)';
  const values = [userId, 'waiting', 'accept'];

  const result = await pool.query(query, values);
  return result.rows.length > 0;
};

const findUpgradeRoleById = async (id) => {
  const result = await pool.query('SELECT * FROM upgrade_role WHERE id = $1', [id]);
  return result.rows[0];
};

const updateUpgradeRoleStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE upgrade_role
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id],
  );

  return result.rows[0];
};

const updateUpgradeRoleDocument = async (id, documentUrl) => {
  const result = await pool.query(
    `UPDATE upgrade_role
     SET document_url = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [documentUrl, id],
  );

  return result.rows[0];
};

const getAllUpgradeRoles = async () => {
  const result = await pool.query('SELECT * FROM upgrade_role');
  return result.rows;
};

const deleteUpgradeRole = async (id) => {
  await pool.query('DELETE FROM upgrade_role WHERE id = $1', [id]);
};

module.exports = {
  createUpgradeRole,
  findExistingUpgradeRole,
  findUpgradeRoleById,
  updateUpgradeRoleStatus,
  updateUpgradeRoleDocument,
  getAllUpgradeRoles,
  deleteUpgradeRole,
};

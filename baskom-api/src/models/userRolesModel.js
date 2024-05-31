const pool = require('../config/db');

const addUserRole = async (userId, roleId) => {
  const createdAt = new Date();
  const updatedAt = createdAt;

  const result = await pool.query(
    'INSERT INTO user_roles (user_id, role_id, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, roleId, createdAt, updatedAt],
  );

  return result.rows[0];
};

const findRolesByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT roles.*
     FROM roles
     JOIN user_roles ON roles.id = user_roles.role_id
     WHERE user_roles.user_id = $1`,
    [userId],
  );

  return result.rows;
};

const removeUserRole = async (userId, roleId) => {
  await pool.query(
    'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
    [userId, roleId],
  );
};

module.exports = {
  addUserRole,
  findRolesByUserId,
  removeUserRole,
};

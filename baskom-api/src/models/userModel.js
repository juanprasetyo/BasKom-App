const bcrypt = require('bcrypt');
const pool = require('../config/db');

const createUser = async (name, email, password) => {
  const avatar = `https://ui-avatars.com/api/?background=random&size=512&name=${encodeURIComponent(name)}`;
  const createdAt = new Date();
  const updatedAt = createdAt;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, address, phone_number, email_verified_at, password, avatar, created_at, updated_at)
     VALUES ($1, $2, NULL, NULL, NULL, $3, $4, $5, $6)
     RETURNING *`,
    [name, email, hashedPassword, avatar, createdAt, updatedAt],
  );

  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserByEmailWithRoles = async (email) => {
  const result = await pool.query(`
    SELECT u.*, r.id as role_id, r.name as role_name, r.description as role_description
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email = $1
  `, [email]);

  if (result.rows.length === 0) return null;

  const user = {
    id: result.rows[0].id,
    name: result.rows[0].name,
    email: result.rows[0].email,
    password: result.rows[0].password,
    address: result.rows[0].address,
    phone_number: result.rows[0].phone_number,
    avatar: result.rows[0].avatar,
    created_at: result.rows[0].created_at,
    updated_at: result.rows[0].updated_at,
    roles: [],
  };

  result.rows.forEach((row) => {
    user.roles.push({
      id: row.role_id,
      name: row.role_name,
      description: row.role_description,
    });
  });

  return user;
};

const findUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const findUserByIdWithRole = async (id) => {
  const result = await pool.query(
    `SELECT users.*, roles.id AS role_id, roles.name AS role_name, roles.description AS role_description
     FROM users
     LEFT JOIN user_roles ON users.id = user_roles.user_id
     LEFT JOIN roles ON user_roles.role_id = roles.id
     WHERE users.id = $1`,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = {
    id: result.rows[0].id,
    name: result.rows[0].name,
    email: result.rows[0].email,
    address: result.rows[0].address,
    phone_number: result.rows[0].phone_number,
    avatar: result.rows[0].avatar,
    created_at: result.rows[0].created_at,
    updated_at: result.rows[0].updated_at,
    roles: [],
  };

  result.rows.forEach((row) => {
    user.roles.push({
      id: row.role_id,
      name: row.role_name,
      description: row.role_description,
    });
  });

  return user;
};

const updateUser = async (id, name, address, phoneNumber, avatar) => {
  const user = await findUserById(id);
  if (!user) {
    return null;
  }

  const updatedAt = new Date();
  let newAvatar = avatar;

  if (!avatar && name) {
    newAvatar = `https://ui-avatars.com/api/?background=random&size=512&name=${encodeURIComponent(name)}`;
  }

  const result = await pool.query(
    `UPDATE users
     SET name = $1, address = $2, phone_number = $3, avatar = $4, updated_at = $5
     WHERE id = $6
     RETURNING *`,
    [name, address, phoneNumber, newAvatar, updatedAt, id],
  );

  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT users.*, roles.id AS role_id, roles.name AS role_name, roles.description AS role_description
     FROM users
     LEFT JOIN user_roles ON users.id = user_roles.user_id
     LEFT JOIN roles ON user_roles.role_id = roles.id`,
  );

  const usersMap = new Map();

  result.rows.forEach((row) => {
    if (!usersMap.has(row.id)) {
      usersMap.set(row.id, {
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        phone_number: row.phone_number,
        avatar: row.avatar,
        created_at: row.created_at,
        updated_at: row.updated_at,
        roles: [],
      });
    }
    usersMap.get(row.id).roles.push({
      id: row.role_id,
      name: row.role_name,
      description: row.role_description,
    });
  });

  return Array.from(usersMap.values());
};

const deleteUser = async (id) => {
  const user = await findUserById(id);
  if (!user) {
    return null;
  }
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailWithRoles,
  findUserById,
  findUserByIdWithRole,
  updateUser,
  getAllUsers,
  deleteUser,
};

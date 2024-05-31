// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');
const pool = require('../../config/db');

const createUserWithRole = async (app, email, role) => {
  const userRes = await request(app).post('/api/v1/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });
  const userId = userRes.body.id;

  if (role !== 'User') {
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = $2))',
      [userId, role],
    );
  }

  const loginRes = await request(app).post('/api/v1/login').send({
    email,
    password: 'password123',
  });

  return loginRes.body.token;
};

module.exports = {
  createUserWithRole,
};

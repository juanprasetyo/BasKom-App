/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
// const { findUserByIdWithRole } = require('../models/userModel');

describe('User Role API', () => {
  let testUserId;
  let testAdminUserId;
  let testRoleId;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    await pool.query('DELETE FROM user_roles');
    await pool.query('DELETE FROM roles WHERE name = $1', ['Test Role']);
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', ['test@example.com', 'admin@example.com']);

    const userRes = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    const adminRes = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      });

    const roleRes = await pool.query(
      `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES ('Test Role', 'A role for testing', NOW(), NOW())
       RETURNING id`,
    );

    testUserId = userRes.body.id;
    testAdminUserId = adminRes.body.id;
    testRoleId = roleRes.rows[0].id;

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
       VALUES ($1, 2, NOW(), NOW())`,
      [testAdminUserId],
    );

    const adminLoginRes = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    adminToken = adminLoginRes.body.token;

    const userLoginRes = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    userToken = userLoginRes.body.token;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM user_roles WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM roles WHERE id = $1', [testRoleId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testAdminUserId]);
    await pool.end();
  });

  it('should return 403 when adding a role to a user without admin role', async () => {
    const res = await request(app)
      .post('/api/v1/user/roles/add')
      .send({
        userId: testUserId,
        roleId: testRoleId,
      })
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the required permissions');
  });

  it('should add a role to a user with admin role', async () => {
    const res = await request(app)
      .post('/api/v1/user/roles/add')
      .send({
        userId: testUserId,
        roleId: testRoleId,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(201);
  });

  it('should return 403 when removing a role from a user without admin role', async () => {
    const res = await request(app)
      .delete('/api/v1/user/roles/delete')
      .send({
        userId: testUserId,
        roleId: testRoleId,
      })
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the required permissions');
  });

  it('should remove a role from a user with admin role', async () => {
    const res = await request(app)
      .delete('/api/v1/user/roles/delete')
      .send({
        userId: testUserId,
        roleId: testRoleId,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Role removed from user successfully');
  });

  it('should return 400 when trying to remove default role', async () => {
    const res = await request(app)
      .delete('/api/v1/user/roles/delete')
      .send({
        userId: testUserId,
        roleId: 1,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Default role cannot be removed');
  });
});

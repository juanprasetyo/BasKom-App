/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('User Roles API', () => {
  let adminToken;
  let userToken;
  let userId;
  let roleId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');

    adminToken = await createUserWithRole(app, 'admin@example.com', 'Admin');
    userToken = await createUserWithRole(app, 'user@example.com', 'User');

    const userRes = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      });

    userId = userRes.body.id;

    const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', ['Penjual']);
    roleId = roleRes.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.end();
  });

  it('should add a role to a user', async () => {
    const res = await request(app)
      .post('/api/v1/user/roles/add')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
        roleId,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user_id', userId);
    expect(res.body).toHaveProperty('role_id', roleId);
  });

  it('should return 400 when adding a role with missing parameters', async () => {
    const res = await request(app)
      .post('/api/v1/user/roles/add')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Role ID must be an integer');
  });

  it('should return 403 when a non-admin tries to add a role to a user', async () => {
    const res = await request(app)
      .post('/api/v1/user/roles/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        userId,
        roleId,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the required permissions');
  });

  it('should remove a role from a user', async () => {
    const res = await request(app)
      .delete('/api/v1/user/roles/delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
        roleId,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Role removed from user successfully');
  });

  it('should return 400 when removing a role with missing parameters', async () => {
    const res = await request(app)
      .delete('/api/v1/user/roles/delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Role ID must be an integer');
  });

  it('should return 403 when a non-admin tries to remove a role from a user', async () => {
    const res = await request(app)
      .delete('/api/v1/user/roles/delete')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        userId,
        roleId,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the required permissions');
  });

  it('should return 400 when trying to remove the default role', async () => {
    const res = await request(app)
      .delete('/api/v1/user/roles/delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
        roleId: 1,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Default role cannot be removed');
  });
});

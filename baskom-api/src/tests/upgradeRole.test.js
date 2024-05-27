/* eslint-disable no-undef */
const request = require('supertest');
const path = require('path');
const app = require('../app');
const pool = require('../config/db');

describe('Upgrade Role API', () => {
  let adminAuthToken;
  let userAuthToken;
  let upgradeRoleId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM user_roles');
    await pool.query('DELETE FROM upgrade_role');

    await request(app).post('/api/v1/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
    });

    await request(app).post('/api/v1/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    await pool.query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ((SELECT id FROM users WHERE email = 'admin@example.com'), 2)
    `);

    const resAdmin = await request(app).post('/api/v1/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });
    adminAuthToken = resAdmin.body.token;

    const resUser = await request(app).post('/api/v1/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    userAuthToken = resUser.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should create an upgrade role request', async () => {
    const res = await request(app)
      .post('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${userAuthToken}`)
      .attach('file', path.join(__dirname, '/file/test-image.png'));

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    upgradeRoleId = res.body.id;
  });

  it('should get all upgrade role requests', async () => {
    const res = await request(app)
      .get('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get an upgrade role request by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', upgradeRoleId);
  });

  it('should update an upgrade role request document', async () => {
    const res = await request(app)
      .put(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${userAuthToken}`)
      .attach('file', path.join(__dirname, '/file/test-image-updated.png'));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', upgradeRoleId);
  });

  it('should update an upgrade role request status as Admin', async () => {
    const res = await request(app)
      .put(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({ status: 'accept' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', upgradeRoleId);
    expect(res.body.status).toEqual('accept');
  });

  it('should not create an upgrade role request if file is not uploaded', async () => {
    const res = await request(app)
      .post('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${userAuthToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'File upload is required');
  });

  it('should not create an upgrade role request if there is already a pending request', async () => {
    await request(app)
      .post('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${userAuthToken}`)
      .attach('file', path.join(__dirname, 'file/test-image.png'));

    const res = await request(app)
      .post('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${userAuthToken}`)
      .attach('file', path.join(__dirname, 'file/test-image.png'));

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'An upgrade request is already in progress or accepted');
  });

  it('should not update document if status is reject or accept', async () => {
    const res = await request(app)
      .put(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${userAuthToken}`)
      .attach('file', path.join(__dirname, '/file/test-image-updated.png'));

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Cannot update document for rejected or accepted requests');
  });

  it('should return 404 for a non-existent upgrade role request', async () => {
    const nonExistentId = 999;
    const res = await request(app)
      .get(`/api/v1/upgrade-roles/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Upgrade request not found');
  });

  it('should return 404 for a non-existent upgrade role request on delete', async () => {
    const nonExistentId = 999;
    const res = await request(app)
      .delete(`/api/v1/upgrade-roles/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Upgrade role request not found');
  });

  it('should delete an upgrade role request', async () => {
    const res = await request(app)
      .delete(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    expect(res.statusCode).toEqual(204);
  });
});

/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('Profile API', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');

    userToken = await createUserWithRole(app, 'user@example.com', 'User');
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${userToken}`);
    userId = res.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.end();
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/profile');

    expect(res.statusCode).toEqual(401);
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).toHaveProperty('email', 'user@example.com');
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Updated Test User',
        address: '123 Test Address',
        phoneNumber: '+6281234567890',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('name', 'Updated Test User');
    expect(res.body).toHaveProperty('address', '123 Test Address');
    expect(res.body).toHaveProperty('phone_number', '+6281234567890');
  });

  it('should return 400 for invalid name', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        address: '123 Test Address',
        phoneNumber: '081234567890',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty(
      'msg',
      'Name cannot be empty',
    );
  });

  it('should return 400 for invalid phone number', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Updated Test User',
        address: '123 Test Address',
        phoneNumber: '081234567890',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty(
      'msg',
      'Phone number must start with +62 and followed by 10 to 12 digits',
    );
  });
});

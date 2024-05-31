/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('User API', () => {
  let adminToken;
  let userId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');

    adminToken = await createUserWithRole(app, 'admin@example.com', 'Admin');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.end();
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).toHaveProperty('email', 'testuser@example.com');
    userId = res.body.id;
  });

  it('should return 400 when creating user without a name', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'testuser2@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Name is required');
  });

  it('should return 400 when creating user without an email', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User 2',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid email format');
  });

  it('should return 400 when creating user with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User 3',
        email: 'invalid-email',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid email format');
  });

  it('should return 400 when creating user without a password', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User 4',
        email: 'testuser4@example.com',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Password must be at least 8 characters long');
  });

  it('should return 400 when creating user with a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User 5',
        email: 'testuser5@example.com',
        password: 'short',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Password must be at least 8 characters long');
  });

  it('should return 409 when creating user with an email that already exists', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test User 6',
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('message', 'Email already in use');
  });

  it('should get a user by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).toHaveProperty('email', 'testuser@example.com');
  });

  it('should return 404 when getting user with non-existent ID', async () => {
    const res = await request(app)
      .get('/api/v1/users/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a user', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated User',
        address: 'Updated Address',
        phoneNumber: '+6281234567890',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('name', 'Updated User');
    expect(res.body).toHaveProperty('address', 'Updated Address');
    expect(res.body).toHaveProperty('phone_number', '+6281234567890');
  });

  it('should return 400 when updating user with invalid phone number', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated User',
        address: 'Updated Address',
        phoneNumber: '08123456789',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Phone number must start with +62 and followed by 10 to 12 digits');
  });

  it('should return 400 when updating user without required fields', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        address: 'Updated Address',
        phoneNumber: '+6281234567890',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Name is required');
  });

  it('should return 400 when updating user with invalid user ID', async () => {
    const res = await request(app)
      .put('/api/v1/users/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Non-existent User',
        address: 'Address',
        phoneNumber: '+6281234567890',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid user ID');
  });

  it('should return 404 when updating user with non-existent ID', async () => {
    const res = await request(app)
      .put('/api/v1/users/9999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Non-existent User',
        address: 'Address',
        phoneNumber: '+6281234567890',
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('should delete a user', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 when deleting user with non-existent ID', async () => {
    const res = await request(app)
      .delete('/api/v1/users/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});

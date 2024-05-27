/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

describe('User API', () => {
  let token;
  let userTestId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.query('DELETE FROM users WHERE email = $1', ['another@example.com']);
    await pool.query('DELETE FROM users WHERE email = $1', ['new@example.com']);

    // Create a user for testing
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    // Login the user to get the token
    const loginRes = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    token = loginRes.body.token;

    // Create another user for testing
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123',
      });

    userTestId = res.body.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.query('DELETE FROM users WHERE email = $1', ['another@example.com']);
    await pool.query('DELETE FROM users WHERE email = $1', ['new@example.com']);
    await pool.end();
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'New User');
    expect(res.body).toHaveProperty('email', 'new@example.com');
    expect(res.body).toHaveProperty('avatar');
  });

  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const testUser = res.body.find((user) => user.email === 'test@example.com');
    expect(testUser).toBeDefined();
    expect(testUser).toHaveProperty('name', 'Test User');
    expect(testUser).toHaveProperty('email', 'test@example.com');

    const anotherUser = res.body.find((user) => user.email === 'another@example.com');
    expect(anotherUser).toBeDefined();
    expect(anotherUser).toHaveProperty('name', 'Another User');
    expect(anotherUser).toHaveProperty('email', 'another@example.com');
  });

  it('should get the user by id', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userTestId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userTestId);
    expect(res.body).toHaveProperty('name', 'Another User');
    expect(res.body).toHaveProperty('email', 'another@example.com');
  });

  it('should update the user', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userTestId}`)
      .send({
        name: 'Updated User',
        address: 'Updated Address',
        phoneNumber: '1234567890',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', userTestId);
    expect(res.body).toHaveProperty('name', 'Updated User');
    expect(res.body).toHaveProperty('address', 'Updated Address');
    expect(res.body).toHaveProperty('phone_number', '1234567890');
  });

  it('should delete the user', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userTestId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });

  // Negative tests

  it('should return 404 for a non-existent user by id', async () => {
    const res = await request(app)
      .get('/api/v1/users/9999') // Assuming 9999 is a non-existent ID
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  it('should return 400 when trying to create a user with missing parameters', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        name: '',
        email: '',
        password: '',
      });

    expect(res.statusCode).toEqual(400);
  });

  it('should return 401 when trying to access a protected route without a token', async () => {
    const res = await request(app).get('/api/v1/users');

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 when trying to access a protected route with an invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toEqual(401);
  });

  it('should return 404 when trying to update a non-existent user', async () => {
    const res = await request(app)
      .put('/api/v1/users/9999') // Assuming 9999 is a non-existent ID
      .send({
        name: 'Non-existent User',
        address: 'Non-existent Address',
        phoneNumber: '1234567890',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  it('should return 400 when trying to update a user with invalid data', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userTestId}`)
      .send({
        name: '',
        address: '',
        phoneNumber: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
  });

  it('should return 404 when trying to delete a non-existent user', async () => {
    const res = await request(app)
      .delete('/api/v1/users/9999') // Assuming 9999 is a non-existent ID
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });
});

/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

describe('Authentication API', () => {
  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.end();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('should log in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 400 when trying to register with missing parameters', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: '',
        email: '',
        password: '',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Name, email, and password are required');
  });

  it('should return 401 when trying to login with incorrect email', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('should return 401 when trying to login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });
});

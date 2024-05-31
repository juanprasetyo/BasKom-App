/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

describe('Authentication API', () => {
  beforeAll(async () => {
    await pool.query('DELETE FROM users');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
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

  it('should return 400 when registering without a name', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Name is required' }),
      ]),
    );
  });

  it('should return 400 when registering without an email', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Invalid email format' }),
      ]),
    );
  });

  it('should return 400 when registering with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Invalid email format' }),
      ]),
    );
  });

  it('should return 400 when registering without a password', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Password must be at least 8 characters long' }),
      ]),
    );
  });

  it('should return 400 when registering with a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Password must be at least 8 characters long' }),
      ]),
    );
  });

  it('should return 409 when registering with an email that already exists', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('message', 'Email already in use');
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

  it('should return 400 when logging in without an email', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Invalid email format' }),
      ]),
    );
  });

  it('should return 400 when logging in without a password', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'test@example.com',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Password is required' }),
      ]),
    );
  });

  it('should return 401 when logging in with an unregistered email', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'unregistered@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Email not registered');
  });

  it('should return 401 when logging in with an incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid password');
  });
});

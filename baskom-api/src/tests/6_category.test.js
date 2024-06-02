/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('Category API', () => {
  let adminToken;
  let penjualToken;
  let categoryId;

  beforeAll(async () => {
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM users');

    adminToken = await createUserWithRole(app, 'admin@example.com', 'Admin');
    penjualToken = await createUserWithRole(app, 'penjual@example.com', 'Penjual');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM users');
    await pool.end();
  });

  it('should create a new category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Test Category',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Test Category');
    categoryId = res.body.id;
  });

  it('should return 400 when creating a category with missing name', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Name is required');
  });

  it('should get a category by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/categories/${categoryId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', categoryId);
    expect(res.body).toHaveProperty('name', 'Test Category');
  });

  it('should return 404 when getting a category by non-existent ID', async () => {
    const res = await request(app)
      .get('/api/v1/categories/9999');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Category not found');
  });

  it('should get all categories', async () => {
    const res = await request(app)
      .get('/api/v1/categories');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a category', async () => {
    const res = await request(app)
      .put(`/api/v1/categories/${categoryId}`)
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Updated Test Category',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', categoryId);
    expect(res.body).toHaveProperty('name', 'Updated Test Category');
  });

  it('should return 404 when updating a category with non-existent ID', async () => {
    const res = await request(app)
      .put('/api/v1/categories/9999')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Non-existent Category',
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Category not found');
  });

  it('should delete a category', async () => {
    const res = await request(app)
      .delete(`/api/v1/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 when deleting a category with non-existent ID', async () => {
    const res = await request(app)
      .delete('/api/v1/categories/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Category not found');
  });
});

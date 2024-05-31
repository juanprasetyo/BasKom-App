/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('Product API', () => {
  let penjualToken;
  let categoryId1;
  let categoryId2;
  let productId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');

    penjualToken = await createUserWithRole(app, 'penjual@example.com', 'Penjual');

    const categoryRes1 = await pool.query("INSERT INTO categories (name) VALUES ('Category 1') RETURNING id");
    const categoryRes2 = await pool.query("INSERT INTO categories (name) VALUES ('Category 2') RETURNING id");
    categoryId1 = categoryRes1.rows[0].id;
    categoryId2 = categoryRes2.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');
    await pool.end();
  });

  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Test Product',
        description: 'This is a test product',
        price: 10.0,
        qty: 100,
        categoryIds: [categoryId1, categoryId2],
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Test Product');
    productId = res.body.id;
  });

  it('should return 400 when creating a product with missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        description: 'This is a test product',
        price: 10.0,
        qty: 100,
        categoryIds: [categoryId1, categoryId2],
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Name is required' }),
      ]),
    );
  });

  it('should return 400 when creating a product with invalid price', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Test Product',
        description: 'This is a test product',
        price: -10.0,
        qty: 100,
        categoryIds: [categoryId1, categoryId2],
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Price must be a number greater than 0' }),
      ]),
    );
  });

  it('should get a product by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/products/${productId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', productId);
  });

  it('should return 404 when getting a product by non-existent ID', async () => {
    const res = await request(app)
      .get('/api/v1/products/9999');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Product not found');
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/api/v1/products');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Updated Product',
        description: 'This is an updated test product',
        price: 20.0,
        qty: 200,
        categoryIds: [categoryId1],
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', productId);
    expect(res.body).toHaveProperty('name', 'Updated Product');
  });

  it('should return 400 when updating a product with missing fields', async () => {
    const res = await request(app)
      .put(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        description: 'This is an updated test product',
        price: 20.0,
        qty: 200,
        categoryIds: [categoryId1],
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Name is required' }),
      ]),
    );
  });

  it('should return 403 when updating a product with unauthorized user', async () => {
    const userToken = await createUserWithRole(app, 'user@example.com', 'User');
    const res = await request(app)
      .put(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Updated Product',
        description: 'This is an updated test product',
        price: 20.0,
        qty: 200,
        categoryIds: [categoryId1],
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the required permissions');
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${penjualToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 when deleting a product with non-existent ID', async () => {
    const res = await request(app)
      .delete('/api/v1/products/9999')
      .set('Authorization', `Bearer ${penjualToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Product not found');
  });
});

/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('Product Category API', () => {
  let penjualToken;
  let productId;
  let categoryId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');

    penjualToken = await createUserWithRole(app, 'penjual@example.com', 'Penjual');

    const productRes = await pool.query("INSERT INTO products (name, description, price, qty, user_id) VALUES ('Test Product', 'This is a test product', 10.0, 100, (SELECT id FROM users WHERE email = 'penjual@example.com')) RETURNING id");
    productId = productRes.rows[0].id;

    const categoryRes = await pool.query("INSERT INTO categories (name) VALUES ('Test Category') RETURNING id");
    categoryId = categoryRes.rows[0].id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');
    await pool.end();
  });

  it('should add a product category', async () => {
    const res = await request(app)
      .post('/api/v1/product-categories')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        productId,
        categoryId,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('product_id', productId);
    expect(res.body).toHaveProperty('category_id', categoryId);
  });

  it('should return 400 when adding a product category with missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/product-categories')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        productId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Category ID must be an integer' }),
      ]),
    );
  });

  it('should delete a product category', async () => {
    const res = await request(app)
      .delete('/api/v1/product-categories')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        productId,
        categoryId,
      });

    expect(res.statusCode).toEqual(204);
  });

  it('should return 400 when deleting a product category with missing fields', async () => {
    const res = await request(app)
      .delete('/api/v1/product-categories')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        productId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Category ID must be an integer' }),
      ]),
    );
  });

  it('should return 403 when adding a product category with unauthorized user', async () => {
    const userToken = await createUserWithRole(app, 'user@example.com', 'Penjual');
    const res = await request(app)
      .post('/api/v1/product-categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId,
        categoryId,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error', 'Unauthorized to modify this product');
  });

  it('should return 403 when deleting a product category with unauthorized user', async () => {
    const userToken = await createUserWithRole(app, 'anotheruser@example.com', 'Penjual');
    const res = await request(app)
      .delete('/api/v1/product-categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId,
        categoryId,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error', 'Unauthorized to modify this product');
  });
});

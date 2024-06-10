/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('Search Products API', () => {
  let penjualToken;
  let categoryId1;
  let categoryId2;
  let categoryId3;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');

    penjualToken = await createUserWithRole(app, 'penjual@example.com', 'Penjual');

    const categoryRes1 = await pool.query("INSERT INTO categories (name) VALUES ('Category 1') RETURNING id");
    const categoryRes2 = await pool.query("INSERT INTO categories (name) VALUES ('Category 2') RETURNING id");
    const categoryRes3 = await pool.query("INSERT INTO categories (name) VALUES ('Category 3') RETURNING id");
    categoryId1 = categoryRes1.rows[0].id;
    categoryId2 = categoryRes2.rows[0].id;
    categoryId3 = categoryRes3.rows[0].id;

    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Test Product 1',
        description: 'This is test product 1',
        price: 10.0,
        qty: 100,
        categoryIds: [categoryId1, categoryId2],
      });

    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Test Product 2',
        description: 'This is test product 2',
        price: 20.0,
        qty: 50,
        categoryIds: [categoryId2, categoryId3],
      });

    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${penjualToken}`)
      .send({
        name: 'Another Test Product',
        description: 'This is another test product',
        price: 15.0,
        qty: 75,
        categoryIds: [categoryId1, categoryId3],
      });
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');
    await pool.end();
  });

  it('should search products by name', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?name=Test Product 1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 1' }),
      ]),
    );
  });

  it('should search products by category', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?category=Category 1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 1' }),
        expect.objectContaining({ name: 'Another Test Product' }),
      ]),
    );
  });

  it('should search products by minPrice and maxPrice', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?minPrice=10&maxPrice=20');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(3);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 1' }),
        expect.objectContaining({ name: 'Test Product 2' }),
        expect.objectContaining({ name: 'Another Test Product' }),
      ]),
    );
  });

  it('should return empty array for non-matching search criteria', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?name=Nonexistent Product');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  it('should return 400 for invalid price range', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?minPrice=20&maxPrice=10');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Maximum price must be greater than or equal to minimum price');
  });

  it('should search products by name and category', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?name=Test Product 2&category=Category 2');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 2' }),
      ]),
    );
  });

  it('should search products by minPrice and maxPrice with category', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?minPrice=10&maxPrice=20&category=Category 1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 1' }),
        expect.objectContaining({ name: 'Another Test Product' }),
      ]),
    );
  });

  it('should search products by name, category, minPrice, and maxPrice', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?name=Test&category=Category 2&minPrice=15&maxPrice=25');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 2' }),
      ]),
    );
  });

  it('should search products with a single matching parameter', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?minPrice=15');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 2' }),
        expect.objectContaining({ name: 'Another Test Product' }),
      ]),
    );
  });

  it('should search products with a different single matching parameter', async () => {
    const res = await request(app)
      .get('/api/v1/products/search?category=Category 3');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Test Product 2' }),
        expect.objectContaining({ name: 'Another Test Product' }),
      ]),
    );
  });
});

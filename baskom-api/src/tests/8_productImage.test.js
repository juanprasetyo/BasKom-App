/* eslint-disable no-undef */
const request = require('supertest');
const path = require('path');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

describe('Product Image API', () => {
  let sellerToken;
  let seller2Token;
  let productId;
  let imageId;
  let categoryId;

  beforeAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM images');
    await pool.query('DELETE FROM categories');

    seller2Token = await createUserWithRole(app, 'seller2@example.com', 'Penjual');
    sellerToken = await createUserWithRole(app, 'seller@example.com', 'Penjual');

    await pool.query("INSERT INTO categories (name) VALUES ('Category 1')");

    const categoryRes = await pool.query("SELECT id FROM categories WHERE name = 'Category 1'");
    categoryId = categoryRes.rows[0].id;

    const productRes = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        qty: 10,
        categoryIds: [categoryId],
      });

    if (productRes.body && productRes.body.id) {
      productId = productRes.body.id.toString();
    } else {
      throw new Error('Product creation failed, no product ID returned');
    }
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM images');
    await pool.query('DELETE FROM categories');
    await pool.end();
  });

  it('should upload images for a product', async () => {
    const res = await request(app)
      .post('/api/v1/product-images')
      .set('Authorization', `Bearer ${sellerToken}`)
      .attach('files', path.join(__dirname, 'file/test-image.png'))
      .attach('files', path.join(__dirname, 'file/test-image-updated.png'))
      .field('productId', productId);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(2);
    expect(res.body[0]).toHaveProperty('url');

    imageId = res.body[0].id;
  });

  it('should return 400 when uploading images with invalid file types', async () => {
    const res = await request(app)
      .post('/api/v1/product-images')
      .set('Authorization', `Bearer ${sellerToken}`)
      .attach('files', path.join(__dirname, 'file/test-pdf.pdf'))
      .field('productId', productId);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid file type. Only JPG, JPEG, and PNG files are allowed');
  });

  it('should return 400 when no files are provided', async () => {
    const res = await request(app)
      .post('/api/v1/product-images')
      .set('Authorization', `Bearer ${sellerToken}`)
      .field('productId', productId);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'At least one image file is required');
  });

  it('should return 403 when unauthorized user tries to upload images', async () => {
    const res = await request(app)
      .post('/api/v1/product-images')
      .set('Authorization', `Bearer ${seller2Token}`)
      .attach('files', path.join(__dirname, 'file/test-image.png'))
      .field('productId', productId);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error', 'Unauthorized to add images to this product');
  });

  it('should delete an image from a product', async () => {
    const res = await request(app)
      .delete('/api/v1/product-images')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        productId,
        imageId,
      });

    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 when trying to delete an image that does not exist', async () => {
    const res = await request(app)
      .delete('/api/v1/product-images')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        productId,
        imageId: 9999,
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Image not found');
  });

  it('should return 403 when unauthorized user tries to delete an image', async () => {
    const res = await request(app)
      .delete('/api/v1/product-images')
      .set('Authorization', `Bearer ${seller2Token}`)
      .send({
        productId,
        imageId,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error', 'Unauthorized to delete images from this product');
  });

  it('should return 404 when trying to delete an image from a product that does not exist', async () => {
    const res = await request(app)
      .delete('/api/v1/product-images')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        productId: 9999,
        imageId,
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Product not found');
  });
});

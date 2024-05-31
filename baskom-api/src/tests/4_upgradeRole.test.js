/* eslint-disable no-undef */
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const util = require('util');
const app = require('../app');
const pool = require('../config/db');
const { createUserWithRole } = require('./utils/createUserWithRole');

const unlinkAsync = util.promisify(fs.unlink);

describe('Upgrade Roles API', () => {
  let adminToken;
  let userToken;
  let upgradeRoleId;
  const uploadedFiles = [];

  beforeAll(async () => {
    await pool.query('DELETE FROM users');

    adminToken = await createUserWithRole(app, 'admin@example.com', 'Admin');
    userToken = await createUserWithRole(app, 'user@example.com', 'User');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM upgrade_role');

    await Promise.all(uploadedFiles.map((file) => unlinkAsync(file)));
    await pool.end();
  });

  it('should create an upgrade role request', async () => {
    const res = await request(app)
      .post('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'file/test-image.png'));

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('document_url');
    upgradeRoleId = res.body.id;
  });

  it('should return 400 when creating an upgrade role request without a file', async () => {
    const res = await request(app)
      .post('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${userToken}`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'File upload is required');
  });

  it('should get an upgrade role by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', upgradeRoleId);
  });

  it('should return 404 when getting an upgrade role by non-existent ID', async () => {
    const res = await request(app)
      .get('/api/v1/upgrade-roles/9999')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Upgrade request not found');
  });

  it('should get all upgrade roles', async () => {
    const res = await request(app)
      .get('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should update an upgrade role\'s document', async () => {
    const res = await request(app)
      .put(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'file/test-image-updated.png'));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', upgradeRoleId);
    expect(res.body).toHaveProperty('document_url');

    uploadedFiles.push(path.join(__dirname, '../../public/document-upgrade/', path.basename(res.body.document_url)));
  });

  it('should return 400 when updating an upgrade roles document with rejected status', async () => {
    await pool.query(
      'UPDATE upgrade_role SET status = $1 WHERE id = $2',
      ['reject', upgradeRoleId],
    );

    const res = await request(app)
      .put(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'file/test-image-updated.png'));

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Cannot update document for rejected or accepted requests');
  });

  it('should update an upgrade role\'s status as Admin', async () => {
    const resCreate = await request(app)
      .post('/api/v1/upgrade-roles')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'file/test-image.png'));

    const newUpgradeRoleId = resCreate.body.id;

    const res = await request(app)
      .put(`/api/v1/upgrade-roles/${newUpgradeRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'accept' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', newUpgradeRoleId);
    expect(res.body).toHaveProperty('status', 'accept');

    uploadedFiles.push(path.join(__dirname, '../../public/document-upgrade/', path.basename(resCreate.body.document_url)));
  });

  it('should delete an upgrade role', async () => {
    const res = await request(app)
      .delete(`/api/v1/upgrade-roles/${upgradeRoleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 when deleting an upgrade role with non-existent ID', async () => {
    const res = await request(app)
      .delete('/api/v1/upgrade-roles/9999')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Upgrade role request not found');
  });
});

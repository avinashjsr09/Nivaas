const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/db');

test('Residents API - Fetch Directory & Admin Approval', async () => {
  await initDb();
  const request = supertest(app);

  // Login as demo admin
  const adminLogin = await request.post('/api/auth/login').send({
    email: 'admin@nivaas.com',
    password: 'password123'
  });
  const adminToken = adminLogin.body.token;

  // Fetch Residents
  const getRes = await request
    .get('/api/residents')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(getRes.status, 200);
  assert.ok(Array.isArray(getRes.body.residents));
});

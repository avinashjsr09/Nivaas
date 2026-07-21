const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/db');

test('Auth API - Register, Login and Fetch Profile Flow', async () => {
  await initDb();
  const request = supertest(app);

  const randomEmail = `testresident_${Date.now()}@nivaas.com`;

  // 1. Register Resident
  const regRes = await request.post('/api/auth/register').send({
    name: 'Test Resident',
    email: randomEmail,
    password: 'password123',
    role: 'RESIDENT',
    flatNumber: 'C-104'
  });

  assert.strictEqual(regRes.status, 201);
  assert.ok(regRes.body.token);
  assert.strictEqual(regRes.body.user.email, randomEmail);

  // 2. Login
  const loginRes = await request.post('/api/auth/login').send({
    email: randomEmail,
    password: 'password123'
  });

  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginRes.body.token);

  // 3. Fetch Me Profile
  const meRes = await request
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${loginRes.body.token}`);

  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.body.user.name, 'Test Resident');
});

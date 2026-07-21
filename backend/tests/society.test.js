const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/db');

test('Society API - Create, List & Join Society', async () => {
  await initDb();
  const request = supertest(app);

  // Login as admin first
  const loginRes = await request.post('/api/auth/login').send({
    email: 'admin@nivaas.com',
    password: 'password123'
  });
  const token = loginRes.body.token;

  // Create Society
  const createRes = await request
    .post('/api/societies/create')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Skyline Towers',
      address: '45 MG Road',
      city: 'Bengaluru',
      totalFlats: 200
    });

  assert.strictEqual(createRes.status, 201);
  assert.ok(createRes.body.society.code);

  const societyCode = createRes.body.society.code;

  // List Societies
  const listRes = await request.get('/api/societies/list');
  assert.strictEqual(listRes.status, 200);
  assert.ok(listRes.body.societies.length > 0);

  // Register new resident and join society by code
  const newEmail = `joiner_${Date.now()}@nivaas.com`;
  const regRes = await request.post('/api/auth/register').send({
    name: 'New Joiner',
    email: newEmail,
    password: 'password123',
    role: 'RESIDENT',
    societyCode: societyCode,
    flatNumber: 'S-502'
  });

  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regRes.body.user.society_code, societyCode);
});

const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/db');

test('Notices API - Post Notice & Fetch Notices List', async () => {
  await initDb();
  const request = supertest(app);

  const timestamp = Date.now();
  const adminEmail = `not_admin_${timestamp}@nivaas.com`;
  const residentEmail = `not_res_${timestamp}@nivaas.com`;

  // 1. Register Admin & Create Society
  const adminReg = await request.post('/api/auth/register').send({
    name: 'Notice Test Admin',
    email: adminEmail,
    password: 'password123',
    role: 'ADMIN'
  });
  const adminToken = adminReg.body.token;

  const socRes = await request
    .post('/api/societies/create')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Notice Society ${timestamp}`, city: 'Delhi' });

  const societyCode = socRes.body.society.code;

  // Re-login Admin to get updated societyId token
  const adminLogin = await request.post('/api/auth/login').send({
    email: adminEmail,
    password: 'password123'
  });
  const updatedAdminToken = adminLogin.body.token;

  // 2. Register Resident in same society
  const resReg = await request.post('/api/auth/register').send({
    name: 'Notice Test Resident',
    email: residentEmail,
    password: 'password123',
    role: 'RESIDENT',
    societyCode,
    flatNumber: 'A-102'
  });
  const residentToken = resReg.body.token;

  // 3. Post Urgent Notice
  const noticeRes = await request
    .post('/api/notices')
    .set('Authorization', `Bearer ${updatedAdminToken}`)
    .send({
      title: 'Scheduled Water Shutdown Notice',
      content: 'Water supply will be temporarily shut down tomorrow from 10 AM to 2 PM for tank cleaning.',
      priority: 'URGENT'
    });

  assert.strictEqual(noticeRes.status, 201);
  assert.strictEqual(noticeRes.body.notice.priority, 'URGENT');

  // 4. Fetch Notices as Resident
  const getRes = await request
    .get('/api/notices')
    .set('Authorization', `Bearer ${residentToken}`);

  assert.strictEqual(getRes.status, 200);
  assert.ok(getRes.body.notices.length > 0);
  assert.strictEqual(getRes.body.notices[0].priority, 'URGENT');
});

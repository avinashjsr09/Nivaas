const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/db');

test('Visitors API - Resident Pre-approved Pass, Security Gate Log & QR Verification', async () => {
  await initDb();
  const request = supertest(app);

  const timestamp = Date.now();
  const adminEmail = `vis_admin_${timestamp}@nivaas.com`;
  const residentEmail = `vis_res_${timestamp}@nivaas.com`;
  const securityEmail = `vis_sec_${timestamp}@nivaas.com`;

  // 1. Setup Admin & Society
  const adminReg = await request.post('/api/auth/register').send({
    name: 'Visitor Test Admin',
    email: adminEmail,
    password: 'password123',
    role: 'ADMIN'
  });
  const adminToken = adminReg.body.token;

  const socRes = await request
    .post('/api/societies/create')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Visitor Society ${timestamp}`, city: 'Pune' });

  const societyCode = socRes.body.society.code;

  // 2. Register Resident & Security Guard
  const resReg = await request.post('/api/auth/register').send({
    name: 'Resident Host',
    email: residentEmail,
    password: 'password123',
    role: 'RESIDENT',
    societyCode,
    flatNumber: 'C-301'
  });
  const residentToken = resReg.body.token;

  const secReg = await request.post('/api/auth/register').send({
    name: 'Gate Guard',
    email: securityEmail,
    password: 'password123',
    role: 'SECURITY',
    societyCode,
    flatNumber: 'Main Gate'
  });
  const securityToken = secReg.body.token;

  // 3. Resident creates pre-approved pass for Guest
  const passRes = await request
    .post('/api/visitors/create-pass')
    .set('Authorization', `Bearer ${residentToken}`)
    .send({
      guestName: 'Rahul Verma',
      phone: '9876500000',
      purpose: 'Dinner Guest',
      visitorCount: 2
    });

  assert.strictEqual(passRes.status, 201);
  assert.strictEqual(passRes.body.visitor.status, 'APPROVED');
  assert.ok(passRes.body.visitor.qr_code.startsWith('NV-PASS-'));

  const qrCode = passRes.body.visitor.qr_code;
  const visitorId = passRes.body.visitor.id;

  // 4. Security verifies QR Code
  const verifyRes = await request
    .get(`/api/visitors/verify/${qrCode}`)
    .set('Authorization', `Bearer ${securityToken}`);

  assert.strictEqual(verifyRes.status, 200);
  assert.strictEqual(verifyRes.body.valid, true);
  assert.strictEqual(verifyRes.body.visitor.guest_name, 'Rahul Verma');

  // 5. Security updates visitor status to INSIDE then EXITED
  const inRes = await request
    .patch(`/api/visitors/${visitorId}/status`)
    .set('Authorization', `Bearer ${securityToken}`)
    .send({ status: 'INSIDE' });

  assert.strictEqual(inRes.status, 200);
  assert.strictEqual(inRes.body.visitor.status, 'INSIDE');

  const outRes = await request
    .patch(`/api/visitors/${visitorId}/status`)
    .set('Authorization', `Bearer ${securityToken}`)
    .send({ status: 'EXITED' });

  assert.strictEqual(outRes.status, 200);
  assert.strictEqual(outRes.body.visitor.status, 'EXITED');
});

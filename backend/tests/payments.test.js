const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/db');

test('Payments API - Issue Maintenance Bill & Resident Pay Flow', async () => {
  await initDb();
  const request = supertest(app);

  const timestamp = Date.now();
  const adminEmail = `pay_admin_${timestamp}@nivaas.com`;
  const residentEmail = `pay_res_${timestamp}@nivaas.com`;

  // 1. Setup Admin & Society
  const adminReg = await request.post('/api/auth/register').send({
    name: 'Payment Admin',
    email: adminEmail,
    password: 'password123',
    role: 'ADMIN'
  });
  const adminToken = adminReg.body.token;

  const socRes = await request
    .post('/api/societies/create')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Payment Society ${timestamp}`, city: 'Delhi' });

  const societyCode = socRes.body.society.code;

  // Re-login Admin to refresh societyId token
  const adminLogin = await request.post('/api/auth/login').send({
    email: adminEmail,
    password: 'password123'
  });
  const updatedAdminToken = adminLogin.body.token;

  // 2. Register Resident
  const resReg = await request.post('/api/auth/register').send({
    name: 'Payer Resident',
    email: residentEmail,
    password: 'password123',
    role: 'RESIDENT',
    societyCode,
    flatNumber: 'A-501'
  });
  const residentToken = resReg.body.token;

  // 3. Admin Issues Maintenance Bill
  const issueRes = await request
    .post('/api/payments/create')
    .set('Authorization', `Bearer ${updatedAdminToken}`)
    .send({
      title: 'July 2026 Maintenance & Water Charges',
      amount: 3500,
      dueDate: '2026-07-31'
    });

  assert.strictEqual(issueRes.status, 201);

  // 4. Resident fetches bill list
  const getRes = await request
    .get('/api/payments')
    .set('Authorization', `Bearer ${residentToken}`);

  assert.strictEqual(getRes.status, 200);
  assert.ok(getRes.body.payments.length > 0);
  assert.strictEqual(getRes.body.payments[0].status, 'PENDING');

  const billId = getRes.body.payments[0].id;

  // 5. Resident pays bill
  const payRes = await request
    .post(`/api/payments/${billId}/pay`)
    .set('Authorization', `Bearer ${residentToken}`);

  assert.strictEqual(payRes.status, 200);
  assert.strictEqual(payRes.body.payment.status, 'PAID');
  assert.ok(payRes.body.payment.transaction_ref.startsWith('TXN-'));
});

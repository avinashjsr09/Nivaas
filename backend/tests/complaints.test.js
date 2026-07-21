const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/db');

test('Complaints API - Lodge Complaint, AI Classification & Status Update', async () => {
  await initDb();
  const request = supertest(app);

  const timestamp = Date.now();
  const adminEmail = `cmp_admin_${timestamp}@nivaas.com`;
  const residentEmail = `cmp_res_${timestamp}@nivaas.com`;

  // 1. Register Admin & Create Society
  const adminReg = await request.post('/api/auth/register').send({
    name: 'Complaint Test Admin',
    email: adminEmail,
    password: 'password123',
    role: 'ADMIN'
  });
  const adminToken = adminReg.body.token;

  const socRes = await request
    .post('/api/societies/create')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Complaint Society ${timestamp}`, city: 'Mumbai' });

  const societyCode = socRes.body.society.code;

  // Re-login Admin to refresh token with updated societyId
  const adminLogin = await request.post('/api/auth/login').send({
    email: adminEmail,
    password: 'password123'
  });
  const updatedAdminToken = adminLogin.body.token;

  // 2. Register Resident with Society Code
  const resReg = await request.post('/api/auth/register').send({
    name: 'Complaint Test Resident',
    email: residentEmail,
    password: 'password123',
    role: 'RESIDENT',
    societyCode,
    flatNumber: 'B-402'
  });
  const residentToken = resReg.body.token;

  // 3. Lodge complaint (Water pipe leak)
  const complaintRes = await request
    .post('/api/complaints')
    .set('Authorization', `Bearer ${residentToken}`)
    .send({
      title: 'Water pipe leak in kitchen',
      description: 'Major water leakage from overhead pipe in B-402, urgent assistance required!'
    });

  assert.strictEqual(complaintRes.status, 201);
  assert.strictEqual(complaintRes.body.complaint.category, 'Plumbing');
  assert.strictEqual(complaintRes.body.complaint.priority, 'Urgent');
  assert.ok(complaintRes.body.complaint.ai_summary.includes('[AI Auto-Summary]'));

  const complaintId = complaintRes.body.complaint.id;

  // 4. Admin updates complaint status to IN_PROGRESS
  const updateRes = await request
    .patch(`/api/complaints/${complaintId}/status`)
    .set('Authorization', `Bearer ${updatedAdminToken}`)
    .send({ status: 'IN_PROGRESS' });

  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.body.complaint.status, 'IN_PROGRESS');
});

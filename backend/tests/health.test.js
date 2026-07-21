const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../src/app');

test('GET /api/health should return status ok', async () => {
  const response = await supertest(app).get('/api/health');
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.status, 'ok');
  assert.strictEqual(response.body.service, 'Nivaas API');
});

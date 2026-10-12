import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createAppServer } from '../src/server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = createAppServer();
const baseUrl = await app.start();
const checks = [];
const pass = (id, detail) => checks.push({ id, status: 'passed', detail });
async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const body = await response.json();
  return { status: response.status, body };
}

try {
  const health = await request('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.ok, true);
  pass('health', 'service health contract');

  const created = await request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({ query: 'browser retrieval', strategy: 'strategy-v2', owner: 'qa' }),
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.state, 'draft');
  assert.equal(created.body.audit.length, 0);
  const id = created.body.id;
  pass('create-detail-contract', id);

  const invalidInput = await request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({ query: '', strategy: 'unknown' }),
  });
  assert.equal(invalidInput.status, 422);
  assert.equal(invalidInput.body.error.code, 'INVALID_JOB_INPUT');
  pass('input-error-envelope', invalidInput.body.error.code);

  const illegal = await request(`/api/jobs/${id}/submit`, { method: 'POST', body: '{}' });
  assert.equal(illegal.status, 409);
  assert.equal(illegal.body.error.code, 'INVALID_TRANSITION');
  const afterIllegal = await request(`/api/jobs/${id}`);
  assert.equal(afterIllegal.body.state, 'draft');
  assert.equal(afterIllegal.body.audit.length, 0);
  pass('illegal-transition', '409 without state or audit mutation');

  for (const action of ['validate', 'submit', 'run']) {
    const response = await request(`/api/jobs/${id}/${action}`, { method: 'POST', body: '{}' });
    assert.equal(response.status, 200);
  }
  const succeeded = await request(`/api/jobs/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ outcome: 'success' }),
  });
  assert.equal(succeeded.status, 200);
  assert.equal(succeeded.body.state, 'succeeded');
  assert.equal(succeeded.body.audit.length, 4);
  pass('success-workflow', 'draft→validated→queued→running→succeeded');

  const terminal = await request(`/api/jobs/${id}/run`, { method: 'POST', body: '{}' });
  assert.equal(terminal.status, 409);
  assert.equal(terminal.body.error.code, 'INVALID_TRANSITION');
  pass('terminal-guard', 'terminal state rejects run');

  const failedJob = await request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({ query: 'provider failure', strategy: 'baseline' }),
  });
  let failedId = failedJob.body.id;
  for (const action of ['validate', 'submit', 'run']) {
    await request(`/api/jobs/${failedId}/${action}`, { method: 'POST', body: '{}' });
  }
  const failed = await request(`/api/jobs/${failedId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ outcome: 'failure' }),
  });
  assert.equal(failed.body.state, 'failed');
  assert.equal(failed.body.error.code, 'RETRIEVAL_FAILED');
  pass('failure-workflow', 'failed terminal state preserves error code');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(baseUrl);
  await page.locator('#query').fill('browser retrieval from page');
  await page.locator('#create-form button[type="submit"]').click();
  await assertEventually(page.locator('#state'), 'draft');
  await page.locator('[data-action="validate"]').click();
  await assertEventually(page.locator('#state'), 'validated');
  await page.locator('[data-action="submit"]').click();
  await assertEventually(page.locator('#state'), 'queued');
  await page.locator('[data-action="run"]').click();
  await assertEventually(page.locator('#state'), 'running');
  await page.locator('[data-action="complete"][data-outcome="success"]').click();
  await assertEventually(page.locator('#state'), 'succeeded');
  assert.match(await page.locator('#audit').textContent(), /complete: running/);
  assert.equal(await page.locator('[data-action="run"]').isDisabled(), true);
  await browser.close();
  pass('page-workflow', 'Chromium page reflects API state and audit');

  await fs.mkdir(path.join(root, 'evidence'), { recursive: true });
  await fs.writeFile(path.join(root, 'evidence/latest-run.json'), JSON.stringify({ generatedAt: new Date().toISOString(), checks }, null, 2) + '\n');
  console.log(`PASS ${checks.length} middle-platform checks`);
} finally {
  await app.close();
}

async function assertEventually(locator, expected) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if ((await locator.textContent()) === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.equal(await locator.textContent(), expected);
}

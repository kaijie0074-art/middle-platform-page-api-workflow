import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJobStore } from './job-store.mjs';
import { DomainError, errorEnvelope } from './contracts.mjs';
import { transition } from './workflow.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 64 * 1024) throw new DomainError('PAYLOAD_TOO_LARGE', 'request body is too large', 413);
  }
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new DomainError('INVALID_JSON', 'request body must be valid JSON', 400);
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function sendStatic(response, pathname) {
  const fileName = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!['index.html', 'app.js', 'styles.css'].includes(fileName)) return false;
  const content = await fs.readFile(path.join(publicRoot, fileName));
  const type = fileName.endsWith('.html') ? 'text/html' : fileName.endsWith('.js') ? 'text/javascript' : 'text/css';
  response.writeHead(200, { 'content-type': `${type}; charset=utf-8` });
  response.end(content);
  return true;
}

export function createAppServer({ port = 0, store = createJobStore() } = {}) {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    try {
      if (request.method === 'GET' && await sendStatic(response, url.pathname)) return;
      if (request.method === 'GET' && url.pathname === '/api/health') {
        sendJson(response, 200, { ok: true, service: 'retrieval-job-middle-platform' });
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/jobs') {
        const job = store.create(await readJson(request));
        sendJson(response, 201, job);
        return;
      }
      const match = url.pathname.match(/^\/api\/jobs\/([^/]+)(?:\/(validate|submit|run|complete))?$/);
      if (match) {
        const jobId = decodeURIComponent(match[1]);
        const job = store.getMutable(jobId);
        if (!job) {
          sendJson(response, 404, { error: { code: 'JOB_NOT_FOUND', message: 'job not found', details: { jobId } } });
          return;
        }
        if (request.method === 'GET' && !match[2]) {
          sendJson(response, 200, store.get(jobId));
          return;
        }
        if (request.method === 'POST' && match[2]) {
          const body = await readJson(request);
          const updated = transition(job, match[2], { actor: body.actor || 'demo-user', outcome: body.outcome });
          sendJson(response, 200, store.save(updated));
          return;
        }
      }
      sendJson(response, 404, { error: { code: 'NOT_FOUND', message: 'route not found', details: { path: url.pathname } } });
    } catch (error) {
      const envelope = errorEnvelope(error);
      sendJson(response, envelope.status, envelope.body);
    }
  });

  return {
    server,
    store,
    async start() {
      await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
      const address = server.address();
      return `http://127.0.0.1:${address.port}`;
    },
    async close() {
      if (!server.listening) return;
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = createAppServer({ port: Number(process.env.PORT || 4172) });
  const baseUrl = await app.start();
  console.log(`retrieval-job middle platform listening at ${baseUrl}`);
}

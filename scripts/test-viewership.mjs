/**
 * In-process integration test for stream viewership API.
 * Run with: node scripts/test-viewership.mjs
 */
import fs from 'fs/promises';
import http from 'node:http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const testDataRoot = path.join(os.tmpdir(), `blw-viewership-test-${Date.now()}`);
await fs.mkdir(testDataRoot, { recursive: true });

process.env.NODE_ENV = 'test';
process.env.VOLUME_PATH = testDataRoot;

const app = require(path.join(__dirname, '..', 'admin-server.js'));
await app.initializeData();

const server = await new Promise((resolve, reject) => {
  const s = app.listen(0, '127.0.0.1', () => resolve(s));
  s.on('error', reject);
});

const { port } = server.address();
const BASE = `http://127.0.0.1:${port}`;

function httpJson(method, urlPath, payload) {
  const body = payload ? JSON.stringify(payload) : '';
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
        timeout: 10000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          let parsed = {};
          try { parsed = data ? JSON.parse(data) : {}; } catch { /* keep empty */ }
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('timeout', () => { req.destroy(new Error(`Request timed out: ${method} ${urlPath}`)); });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function postView(payload) {
  return httpJson('POST', '/api/stream/view', payload);
}

async function getViewership(videoId) {
  const urlPath = videoId ? `/api/stream/viewership/${videoId}` : '/api/stream/viewership';
  return httpJson('GET', urlPath);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  console.log(`Testing viewership API at ${BASE}\n`);

  const sessionId = `test_${Date.now()}`;
  const videoA = 'testVideoA123';

  let r = await postView({ videoId: videoA, sessionId, timestamp: Date.now() });
  assert(r.ok, `Anonymous track failed: ${r.status} ${JSON.stringify(r.body)}`);
  console.log('✓ Anonymous view tracked');

  r = await postView({
    videoId: videoA,
    sessionId,
    firstName: 'Alice',
    lastName: 'Tester',
    viewerEmail: 'alice@example.com',
    timestamp: Date.now(),
  });
  assert(r.ok, `Registration update failed: ${r.status}`);
  assert(r.body.registeredViewers === 1, `Expected 1 registered viewer, got ${r.body.registeredViewers}`);
  console.log('✓ Registration attached to session');

  const videoB = 'testVideoB456';
  r = await postView({
    videoId: videoB,
    sessionId: `other_${Date.now()}`,
    firstName: 'Bob',
    lastName: 'Viewer',
    timestamp: Date.now(),
  });
  assert(r.ok, `Second stream track failed: ${r.status}`);
  console.log('✓ Second stream tracked');

  r = await getViewership();
  assert(r.ok, `GET all viewership failed: ${r.status}`);
  assert(r.body[videoA], 'Stream A missing from viewership data');
  assert(r.body[videoB], 'Stream B missing from viewership data');
  assert(r.body[videoA].registeredViewerCount === 1, `Stream A registered count wrong: ${r.body[videoA].registeredViewerCount}`);
  assert(r.body[videoB].registeredViewerCount === 1, `Stream B registered count wrong: ${r.body[videoB].registeredViewerCount}`);
  console.log('✓ Both streams retained in viewership file');

  r = await getViewership(videoA);
  assert(r.ok && r.body.registeredViewerCount === 1, 'Single-stream GET failed or wrong count');
  console.log('✓ Per-stream GET returns registeredViewerCount');

  console.log('\nAll viewership tests passed.');
} finally {
  server.close();
  await fs.rm(testDataRoot, { recursive: true, force: true }).catch(() => {});
}

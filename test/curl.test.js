import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCurl } from '../src/lib/curl.js';

test('GET renders url and headers without -X', () => {
  const curl = buildCurl({
    method: 'GET',
    url: 'https://api.example.com/users?q=1',
    requestHeaders: { Accept: 'application/json', Authorization: 'Bearer x' }
  });
  assert.match(curl, /^curl 'https:\/\/api\.example\.com\/users\?q=1'/);
  assert.ok(curl.includes(`-H 'Accept: application/json'`));
  assert.ok(curl.includes(`-H 'Authorization: Bearer x'`));
  assert.ok(!curl.includes('-X'));
});

test('POST includes method and body', () => {
  const curl = buildCurl({
    method: 'POST',
    url: 'https://api.example.com/orders',
    requestHeaders: { 'Content-Type': 'application/json' },
    postData: '{"a":1}'
  });
  assert.ok(curl.includes('-X POST'));
  assert.ok(curl.includes(`--data-raw '{"a":1}'`));
});

test('single quotes in body and url are escaped', () => {
  const curl = buildCurl({
    method: 'POST',
    url: "https://x.test/'x",
    requestHeaders: {},
    postData: "it's"
  });
  assert.ok(curl.includes(`'\\''`));
});

test('GET drops body even if postData present', () => {
  const curl = buildCurl({
    method: 'GET',
    url: 'https://x.test',
    requestHeaders: {},
    postData: 'x'
  });
  assert.ok(!curl.includes('--data-raw'));
});

test('cookie header is preserved for postman fidelity', () => {
  const curl = buildCurl({
    method: 'GET',
    url: 'https://x.test',
    requestHeaders: { Cookie: 'session=abc' }
  });
  assert.ok(curl.includes(`-H 'Cookie: session=abc'`));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { updateRecord, isApiRequest, isForbiddenHeader, toFetchInit } from '../src/lib/record.js';

test('assembles a record across the event sequence', () => {
  let rec;
  rec = updateRecord(rec, 'Network.requestWillBeSent', {
    requestId: '1',
    type: 'XHR',
    request: {
      url: 'https://a.test/x',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      postData: '{"a":1}',
      hasPostData: true
    }
  });
  rec = updateRecord(rec, 'Network.responseReceived', {
    requestId: '1',
    response: { status: 201, statusText: 'Created', headers: { 'x-y': 'z' }, mimeType: 'application/json' }
  });
  rec = updateRecord(rec, 'Network.loadingFinished', { requestId: '1' });

  assert.equal(rec.method, 'POST');
  assert.equal(rec.status, 201);
  assert.equal(rec.postData, '{"a":1}');
  assert.equal(rec.done, true);
  assert.ok(isApiRequest(rec));
});

test('forbidden header detection covers exact names and prefixes', () => {
  assert.ok(isForbiddenHeader('Cookie'));
  assert.ok(isForbiddenHeader('sec-fetch-mode'));
  assert.ok(isForbiddenHeader('Proxy-Authorization'));
  assert.ok(!isForbiddenHeader('Authorization'));
  assert.ok(!isForbiddenHeader('Content-Type'));
});

test('toFetchInit strips forbidden headers and keeps body for POST', () => {
  const init = toFetchInit({
    method: 'POST',
    requestHeaders: { Cookie: 'a=b', Authorization: 'Bearer x', 'sec-fetch-site': 'same' },
    postData: '{"a":1}'
  });
  assert.equal(init.headers.Cookie, undefined);
  assert.equal(init.headers['sec-fetch-site'], undefined);
  assert.equal(init.headers.Authorization, 'Bearer x');
  assert.equal(init.body, '{"a":1}');
  assert.equal(init.credentials, 'include');
});

test('toFetchInit omits body for GET', () => {
  const init = toFetchInit({ method: 'GET', requestHeaders: {}, postData: 'x' });
  assert.equal(init.body, undefined);
});

test('non-api resource types are filtered out', () => {
  const rec = updateRecord(undefined, 'Network.requestWillBeSent', {
    requestId: '2',
    type: 'Image',
    request: { url: 'x', method: 'GET', headers: {} }
  });
  assert.ok(!isApiRequest(rec));
});

test('loadingFailed marks record failed', () => {
  let rec = updateRecord(undefined, 'Network.requestWillBeSent', {
    requestId: '3', type: 'Fetch', request: { url: 'x', method: 'GET', headers: {} }
  });
  rec = updateRecord(rec, 'Network.loadingFailed', { requestId: '3', errorText: 'net::ERR_FAILED' });
  assert.equal(rec.failed, true);
  assert.equal(rec.errorText, 'net::ERR_FAILED');
});

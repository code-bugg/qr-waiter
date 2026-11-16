import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAppRoute } from '../src/lib/app-route.ts';

test('ordinary customer visits stay outside staff authentication', () => {
  for (const path of ['/', '']) {
    for (const search of ['', '?role=admin', '?returnTo=/waiter', '?code=anything', '?state=anything']) {
      assert.deepEqual(resolveAppRoute(path, search), { kind: 'customer-entry' });
    }
  }
  assert.deepEqual(resolveAppRoute('/session/table-guid', '?role=admin'), { kind: 'session', guid: 'table-guid' });
});
test('staff sign-in is reached through explicit staff URLs', () => {
  assert.deepEqual(resolveAppRoute('/staff/', ''), { kind: 'staff-entry' });
  assert.deepEqual(resolveAppRoute('/waiter', ''), { kind: 'staff', role: 'waiter' });
  assert.deepEqual(resolveAppRoute('/admin', ''), { kind: 'staff', role: 'admin' });
});
test('root only handles staff callback requests with OAuth callback parameters', () => {
  for (const search of ['?code=authorization-code&state=transaction', '?error=access_denied&state=transaction']) {
    assert.deepEqual(resolveAppRoute('/', search), { kind: 'staff-callback' });
  }
});
test('local testing routes cannot be enabled through a production URL', () => {
  for (const path of ['/dev', '/dev/customer']) {
    for (const search of ['', '?dev=true', '?preview=true']) assert.deepEqual(resolveAppRoute(path, search), { kind: 'invalid' });
  }
  assert.deepEqual(resolveAppRoute('/dev', '', true), { kind: 'dev-tools' });
  assert.deepEqual(resolveAppRoute('/dev/customer', '', true), { kind: 'customer-preview' });
});
test('malformed customer paths do not fall through to staff sign-in', () => {
  for (const path of ['/unknown', '/session', '/session/%E0%A4%A']) assert.deepEqual(resolveAppRoute(path, ''), { kind: 'invalid' });
});

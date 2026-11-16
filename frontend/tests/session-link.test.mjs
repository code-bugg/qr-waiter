import assert from 'node:assert/strict';
import test from 'node:test';
import { sessionCustomerUrl } from '../src/lib/session-link.ts';
const guid = '550e8400-e29b-41d4-a716-446655440001';
test('QR, open and copy links address the same customer route at the frontend origin', () => {
  assert.equal(sessionCustomerUrl(guid, 'http://localhost:5173'), `http://localhost:5173/session/${guid}`);
  assert.equal(sessionCustomerUrl(guid, 'https://example.com/waiter'), `https://example.com/session/${guid}`);
});
test('customer links reject malformed GUIDs and non-web origins', () => {
  for (const value of ['../admin', 'https://example.com', '', '<script>']) assert.throws(() => sessionCustomerUrl(value, 'https://example.com'));
  assert.throws(() => sessionCustomerUrl(guid, 'file:///private/tmp/'));
});

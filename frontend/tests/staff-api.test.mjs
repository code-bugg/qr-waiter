import assert from 'node:assert/strict';
import test from 'node:test';
import { getStaffProfile, staffReturnPath } from '../src/lib/staff.ts';
import { SessionError } from '../src/lib/table-session.ts';

const profile = { subject: 'auth0|waiter', permissions: ['create:sessions'] };
const errorKind = (kind) => (error) => error instanceof SessionError && error.kind === kind;
const jsonFetch = (body, status = 200) => async () => new Response(JSON.stringify(body), { status });

test('loads permissions from the authenticated API with a bearer token and no cache', async () => {
  const controller = new AbortController();
  assert.deepEqual(await getStaffProfile('test-access-token', { signal: controller.signal, fetcher: async (url, init) => {
    assert.equal(url, '/api/users/me');
    assert.equal(init.headers.Authorization, 'Bearer test-access-token');
    assert.equal(init.cache, 'no-store');
    assert.equal(init.signal, controller.signal);
    return new Response(JSON.stringify(profile));
  } }), profile);
});
test('does not invent waiter permissions for an authenticated user', async () => {
  const result = await getStaffProfile('token', { fetcher: jsonFetch({ ...profile, permissions: [] }) });
  assert.deepEqual(result.permissions, []);
});
for (const [status, kind] of [[401, 'unauthorized'], [403, 'forbidden'], [500, 'server'], [404, 'response']]) {
  test(`staff API distinguishes HTTP ${status}`, async () => {
    await assert.rejects(getStaffProfile('token', { fetcher: jsonFetch({}, status) }), errorKind(kind));
  });
}
test('rejects malformed staff responses', async () => {
  for (const body of [null, {}, { ...profile, subject: '' }, { ...profile, permissions: 'create:sessions' }, { ...profile, permissions: [true] }]) {
    await assert.rejects(getStaffProfile('token', { fetcher: jsonFetch(body) }), errorKind('response'));
  }
  await assert.rejects(getStaffProfile('token', { fetcher: async () => new Response('<html>') }), errorKind('response'));
});
test('missing credentials make no profile request', async () => {
  await assert.rejects(getStaffProfile(' ', { fetcher: () => assert.fail('must not fetch') }), errorKind('unauthorized'));
});
test('profile request cancellation remains an abort', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(getStaffProfile('token', { signal: controller.signal, fetcher: async () => { throw controller.signal.reason; } }), { name: 'AbortError' });
});
test('redirects only return to known local staff routes', () => {
  assert.equal(staffReturnPath('/admin', '/waiter'), '/admin');
  assert.equal(staffReturnPath('/waiter', '/admin'), '/waiter');
  for (const path of ['https://example.com', '//example.com', '/session/anything', undefined, {}, '/waiter?next=bad']) {
    assert.equal(staffReturnPath(path, '/waiter'), '/waiter');
  }
});

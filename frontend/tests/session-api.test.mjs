import assert from 'node:assert/strict';
import test from 'node:test';
import { getTableSession, isSessionGuid, SessionError } from '../src/lib/table-session.ts';

const guid = '550e8400-e29b-41d4-a716-446655440001';
const session = {
  tableSessionId: 1, sessionGuid: guid, tableId: 1,
  sessionStartTime: '2026-09-14T07:00:00Z', sessionExpirationTime: '2026-09-14T09:00:00Z',
  sessionStatus: 'Active', orderId: null, waiterUserId: null,
};
const jsonFetch = (body, status = 200) => async () => new Response(JSON.stringify(body), { status });
const errorKind = (kind) => (error) => error instanceof SessionError && error.kind === kind;

test('validates full GUIDs without restricting their UUID version', () => {
  assert.ok(isSessionGuid(guid));
  assert.ok(isSessionGuid(guid.toUpperCase()));
  assert.ok(isSessionGuid('00000000-0000-0000-0000-000000000000'));
  assert.equal(isSessionGuid('invalid'), false);
});
test('invalid GUID makes no backend request', async () => {
  await assert.rejects(getTableSession('../health', { fetcher: () => assert.fail('must not fetch') }), errorKind('invalid'));
});
for (const status of ['Active', 'Expired', 'Closed', 'Cancelled']) {
  test(`keeps backend ${status} status, UTC values, and nulls unchanged`, async () => {
    const record = { ...session, sessionStatus: status };
    const result = await getTableSession(guid, { fetcher: jsonFetch(record) });
    assert.deepEqual(result, record); // Active deliberately has a past expiration: the DB owns this rule.
  });
}
test('uses the same-origin endpoint with cancellation and no caching', async () => {
  const controller = new AbortController();
  const result = await getTableSession(guid, { signal: controller.signal, fetcher: async (url, init) => {
    assert.equal(url, `/api/table-sessions/${guid}`);
    assert.equal(init.cache, 'no-store');
    assert.equal(init.signal, controller.signal);
    return new Response(JSON.stringify({ ...session, orderId: 42, waiterUserId: 7 }));
  }});
  assert.equal(result.orderId, 42);
  assert.equal(result.waiterUserId, 7);
});
for (const [code, kind] of [[400, 'invalid'], [404, 'not-found'], [500, 'server'], [502, 'server'], [503, 'server']]) {
  test(`maps HTTP ${code} to ${kind}`, async () => {
    await assert.rejects(getTableSession(guid, { fetcher: jsonFetch({}, code) }), errorKind(kind));
  });
}
test('network failures have a connection error state', async () => {
  await assert.rejects(getTableSession(guid, { fetcher: async () => { throw new TypeError('Failed to fetch'); } }), errorKind('connection'));
});
test('rejects malformed JSON and unexpected API data', async () => {
  await assert.rejects(getTableSession(guid, { fetcher: async () => new Response('<html>') }), errorKind('response'));
  for (const body of [null, {}, { ...session, sessionStatus: 'Unknown' }, { ...session, tableId: Number.MAX_SAFE_INTEGER + 1 }, { ...session, sessionExpirationTime: 'bad date' }, { ...session, sessionGuid: '550e8400-e29b-41d4-a716-446655440002' }]) {
    await assert.rejects(getTableSession(guid, { fetcher: jsonFetch(body) }), errorKind('response'));
  }
});
test('aborted requests retain their abort error for the UI lifecycle', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(getTableSession(guid, { signal: controller.signal, fetcher: async () => { throw controller.signal.reason; } }), { name: 'AbortError' });
});

test('a timeout during body parsing stays an abort, not a response-format error', async () => {
  const controller = new AbortController();
  await assert.rejects(getTableSession(guid, { signal: controller.signal, fetcher: async () => ({
    status: 200, ok: true, json: async () => { controller.abort(); throw controller.signal.reason; },
  }) }), { name: 'AbortError' });
});

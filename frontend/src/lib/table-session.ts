export const sessionStatuses = ['Active', 'Expired', 'Closed', 'Cancelled'] as const;
export type SessionStatus = typeof sessionStatuses[number];

export interface TableSession {
  tableSessionId: number;
  sessionGuid: string;
  sessionStartTime: string;
  sessionExpirationTime: string;
  sessionStatus: SessionStatus;
  tableId: number;
  orderId: number | null;
  waiterUserId: number | null;
}

export type SessionErrorKind = 'invalid' | 'not-found' | 'server' | 'connection' | 'response';

export class SessionError extends Error {
  readonly kind: SessionErrorKind;
  constructor(kind: SessionErrorKind) {
    super(kind);
    this.name = 'SessionError';
    this.kind = kind;
  }
}

export function isSessionGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && Number.isFinite(Date.parse(value));
}

export function isTableSession(value: unknown): value is TableSession {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return isId(data.tableSessionId) && isId(data.tableId)
    && typeof data.sessionGuid === 'string' && isSessionGuid(data.sessionGuid)
    && isTimestamp(data.sessionStartTime) && isTimestamp(data.sessionExpirationTime)
    && sessionStatuses.includes(data.sessionStatus as SessionStatus)
    && (data.orderId === null || isId(data.orderId))
    && (data.waiterUserId === null || isId(data.waiterUserId));
}

export async function getTableSession(
  guid: string,
  options: { signal?: AbortSignal; fetcher?: typeof fetch } = {},
): Promise<TableSession> {
  if (!isSessionGuid(guid)) throw new SessionError('invalid');
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(`/api/table-sessions/${encodeURIComponent(guid)}`, {
      signal: options.signal, cache: 'no-store', headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new SessionError('connection');
  }
  if (response.status === 400) throw new SessionError('invalid');
  if (response.status === 404) throw new SessionError('not-found');
  if (response.status >= 500) throw new SessionError('server');
  if (!response.ok) throw new SessionError('response');
  let data: unknown;
  try { data = await response.json(); }
  catch (error) {
    if (options.signal?.aborted) throw error;
    throw new SessionError('response');
  }
  if (!isTableSession(data) || data.sessionGuid.toLowerCase() !== guid.toLowerCase()) {
    throw new SessionError('response');
  }
  // PostgreSQL owns status/expiration. Do not reinterpret it using the device clock.
  return data;
}

import { SessionError } from './table-session.ts';

export interface StaffProfile {
  subject: string;
  permissions: string[];
}

export function staffReturnPath(returnTo: unknown, fallback: '/waiter' | '/admin'): '/waiter' | '/admin' {
  return returnTo === '/waiter' || returnTo === '/admin' ? returnTo : fallback;
}

export async function getStaffProfile(accessToken: string, options: { signal?: AbortSignal; fetcher?: typeof fetch } = {}): Promise<StaffProfile> {
  if (!accessToken.trim()) throw new SessionError('unauthorized');
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)('/api/users/me', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      cache: 'no-store', signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new SessionError('connection');
  }
  if (response.status === 401) throw new SessionError('unauthorized');
  if (response.status === 403) throw new SessionError('forbidden');
  if (response.status >= 500) throw new SessionError('server');
  if (!response.ok) throw new SessionError('response');
  let data: unknown;
  try { data = await response.json(); }
  catch (error) {
    if (options.signal?.aborted) throw error;
    throw new SessionError('response');
  }
  if (!data || typeof data !== 'object') throw new SessionError('response');
  const profile = data as Record<string, unknown>;
  if (typeof profile.subject !== 'string' || !profile.subject.trim() || !Array.isArray(profile.permissions)
    || !profile.permissions.every((permission) => typeof permission === 'string')) throw new SessionError('response');
  return { subject: profile.subject, permissions: profile.permissions as string[] };
}

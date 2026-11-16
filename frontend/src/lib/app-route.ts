export type AppRoute =
  | { kind: 'customer-entry' }
  | { kind: 'session'; guid: string }
  | { kind: 'staff-entry' }
  | { kind: 'staff'; role: 'waiter' | 'admin' }
  | { kind: 'staff-callback' }
  | { kind: 'dev-tools' }
  | { kind: 'customer-preview' }
  | { kind: 'invalid' };

export function resolveAppRoute(pathname: string, search: string, development = false): AppRoute {
  const path = pathname.replace(/\/+$/, '');
  if (path === '') {
    const query = new URLSearchParams(search);
    // Keep the existing Auth0 callback URL compatible with the tenant settings.
    // An ordinary visit to / never initializes staff authentication.
    if (query.has('state') && (query.has('code') || query.has('error'))) return { kind: 'staff-callback' };
    return { kind: 'customer-entry' };
  }
  if (path === '/staff') return { kind: 'staff-entry' };
  if (path === '/waiter' || path === '/admin') return { kind: 'staff', role: path === '/waiter' ? 'waiter' : 'admin' };
  if (development && path === '/dev') return { kind: 'dev-tools' };
  if (development && path === '/dev/customer') return { kind: 'customer-preview' };
  const match = /^\/session\/([^/]+)$/.exec(path);
  if (match) {
    try { return { kind: 'session', guid: decodeURIComponent(match[1]) }; }
    catch { return { kind: 'invalid' }; }
  }
  return { kind: 'invalid' };
}

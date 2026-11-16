import { isSessionGuid } from './table-session.ts';

export function sessionCustomerUrl(guid: string, origin: string): string {
  if (!isSessionGuid(guid)) throw new Error('Invalid session GUID');
  const url = new URL(`/session/${encodeURIComponent(guid)}`, origin);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Invalid frontend origin');
  return url.toString();
}

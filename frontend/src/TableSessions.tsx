import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Check, Copy, ExternalLink, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { SessionQrCode } from '@/components/SessionQrCode';
import { createTableSession, getTableSession, isSessionActive, SessionError, type TableSession } from '@/lib/table-session';
import { sessionCustomerUrl } from '@/lib/session-link';
import { sessionCopy } from '@/lib/session-copy';
import { staffCopy } from '@/lib/staff-copy';
import type { Lang } from './DesignPreview';

export function TableSessions({ lang, tableId, onTableChange, active }: { lang: Lang; tableId: number; onTableChange: (id: number) => void; active: boolean }) {
  const { getAccessTokenSilently } = useAuth0();
  const t = sessionCopy[lang];
  const staff = staffCopy[lang];
  const [session, setSession] = useState<TableSession>();
  const [busy, setBusy] = useState<'create' | 'refresh' | null>(null);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');
  const request = useRef<AbortController | null>(null);
  const copyAttempt = useRef(0);
  const current = session?.tableId === tableId ? session : undefined;
  const guid = current?.sessionGuid;

  useEffect(() => {
    request.current?.abort(); request.current = null;
    setSession(undefined); setError(''); setBusy(null); setVerified(false);
  }, [tableId]);
  useEffect(() => {
    copyAttempt.current += 1; setCopyState('idle');
    return () => { copyAttempt.current += 1; };
  }, [tableId, guid]);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);

  const load = useCallback(async (mode: 'create' | 'refresh') => {
    if (mode === 'refresh' && !guid) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(mode); setError(''); setVerified(false); setCopyState('idle');
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (request.current === controller) {
        request.current = null; setBusy(null); setError(staff.connection);
      }
    }, 10000);
    try {
      let data: TableSession;
      if (mode === 'create') {
        const token = await getAccessTokenSilently();
        if (controller.signal.aborted) return;
        if (!token) throw new SessionError('unauthorized');
        data = await createTableSession(tableId, token, { signal: controller.signal });
      } else {
        data = await getTableSession(guid!, { signal: controller.signal });
        if (data.tableId !== tableId) throw new SessionError('response');
      }
      if (request.current === controller && !controller.signal.aborted) { setSession(data); setVerified(true); }
    } catch (reason) {
      if (request.current === controller && !controller.signal.aborted) {
        const kind = reason instanceof SessionError ? reason.kind : 'unauthorized';
        setError(staff[kind === 'not-found' ? 'response' : kind]);
      }
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setBusy(null); }
    }
  }, [getAccessTokenSilently, guid, tableId, staff]);

  useEffect(() => {
    if (!active) { request.current?.abort(); request.current = null; setBusy(null); return; }
    if (!guid) return;
    const refresh = () => { if (!request.current && document.visibilityState === 'visible') void load('refresh'); };
    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [active, guid, load]);

  const url = current ? sessionCustomerUrl(current.sessionGuid, window.location.origin) : '';
  const shareable = !!current && isSessionActive(current) && verified && !busy;
  const formatter = new Intl.DateTimeFormat({ ro: 'ro-MD', ru: 'ru-MD', en: 'en-GB' }[lang], { dateStyle: 'medium', timeStyle: 'short' });
  async function copyLink() {
    if (!shareable) return;
    const attempt = ++copyAttempt.current;
    setCopyState('copying');
    try {
      await navigator.clipboard.writeText(url);
      if (attempt === copyAttempt.current) setCopyState('copied');
    } catch { if (attempt === copyAttempt.current) setCopyState('failed'); }
  }

  return <section className="px-4 py-5" aria-label={t.title}>
    <p className="text-xs font-semibold uppercase tracking-wider text-accent">TableBell</p>
    <h1 className="mt-1 text-2xl font-semibold">{t.title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{t.intro}</p>
    <div className="mt-5 flex items-center justify-between gap-3"><label htmlFor="session-table" className="text-sm font-semibold">{t.choose}</label>
      <NativeSelect id="session-table" value={tableId} onChange={(event) => onTableChange(Number(event.target.value))} className="w-28">
        {[2, 4, 6, 8].map((id) => <NativeSelectOption key={id} value={id}>#{id}</NativeSelectOption>)}
      </NativeSelect>
    </div>
    <Button className="mt-3 h-auto min-h-10 w-full whitespace-normal py-2" disabled={!!busy} onClick={() => void load('create')}><QrCode />{busy === 'create' ? t.creating : t.create}</Button>
    {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {!current ? <div className="mt-5 rounded-2xl border border-dashed border-border bg-white p-6 text-center"><QrCode className="mx-auto size-9 text-primary/45" aria-hidden="true" /><h2 className="mt-3 font-semibold">{t.empty}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{t.emptyText}</p></div> :
      <article className="mt-5 rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{t.table} #{current.tableId}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold session-status-${isSessionActive(current) ? 'active' : 'inactive'}`}>{isSessionActive(current) ? staff.active : staff.inactiveLabel}</span></div>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
          <div><dt className="text-xs text-muted-foreground">{t.opened}</dt><dd className="mt-1 font-medium"><time dateTime={current.sessionStartTime}>{formatter.format(new Date(current.sessionStartTime))}</time></dd></div>
          <div><dt className="text-xs text-muted-foreground">{t.expires}</dt><dd className="mt-1 font-medium"><time dateTime={current.sessionExpirationTime}>{formatter.format(new Date(current.sessionExpirationTime))}</time></dd></div>
        </dl>
        <Button variant="ghost" className="mt-3 w-full" disabled={!!busy} onClick={() => void load('refresh')}><RefreshCw className={busy === 'refresh' ? 'motion-safe:animate-spin' : ''} />{busy === 'refresh' ? t.refreshing : t.refresh}</Button>
        {shareable ? <div className="mt-4"><SessionQrCode sessionGuid={current.sessionGuid} label={staff.qrHelp} showLink={false} />
          <div className="mt-4 grid grid-cols-2 gap-2"><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-2 text-sm font-medium text-primary"><ExternalLink className="size-4" />{t.open}</a><Button variant="outline" className="h-auto min-h-10" disabled={copyState === 'copying'} onClick={copyLink}>{copyState === 'copied' ? <Check /> : <Copy />}{copyState === 'copying' ? t.copying : copyState === 'copied' ? t.copied : t.copy}</Button></div>
          <label htmlFor="customer-session-link" className="mt-4 block text-xs text-muted-foreground">{t.link}</label><Input id="customer-session-link" value={url} readOnly onFocus={(event) => event.currentTarget.select()} className="mt-1 text-xs" />
          {copyState === 'copied' && <p role="status" className="mt-2 text-sm text-primary">{t.copied}</p>}{copyState === 'failed' && <p role="alert" className="mt-2 text-sm text-red-700">{t.copyFailed}</p>}
        </div> : <p role="status" className="mt-4 rounded-xl bg-muted p-3 text-sm leading-6 text-muted-foreground">{busy ? t.checking : !verified ? t.unavailable : t.inactive}</p>}
      </article>}
  </section>;
}

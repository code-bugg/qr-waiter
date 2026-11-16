import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { LanguageSelect, WaiterApp, type Lang } from './DesignPreview';
import { getStaffProfile, type StaffProfile } from './lib/staff';
import { SessionError, type SessionErrorKind } from './lib/table-session';
import { staffCopy } from './lib/staff-copy';

type State = { kind: 'loading' } | { kind: 'ready'; profile: StaffProfile } | { kind: 'error'; error: SessionErrorKind };

export function StaffRoute({ role }: { role: 'waiter' | 'admin' }) {
  const { isLoading, isAuthenticated, user, error, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const [lang, setLang] = useState<Lang>('ro');
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);
  const t = staffCopy[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `TableBell · ${t[role]}`;
  }, [lang, role, t]);

  useEffect(() => {
    if (!isAuthenticated) { setState({ kind: 'loading' }); return; }
    const controller = new AbortController();
    let current = true;
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (current) { current = false; setState({ kind: 'error', error: 'connection' }); }
    }, 10000);
    setState({ kind: 'loading' });
    getAccessTokenSilently()
      .then((token) => {
        if (!token) throw new SessionError('unauthorized');
        return getStaffProfile(token, { signal: controller.signal });
      })
      .then((profile) => {
        if (profile.subject !== user?.sub) throw new SessionError('response');
        if (current) setState({ kind: 'ready', profile });
      })
      .catch((reason: unknown) => { if (current) setState({ kind: 'error', error: reason instanceof SessionError ? reason.kind : 'unauthorized' }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { current = false; window.clearTimeout(timeout); controller.abort(); };
  }, [isAuthenticated, user?.sub, getAccessTokenSilently, attempt]);

  async function signIn() {
    setBusy(true); setActionError(false);
    try { await loginWithRedirect({ appState: { returnTo: `/${role}` } }); }
    catch { setActionError(true); setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setActionError(false);
    try { await logout({ logoutParams: { returnTo: window.location.origin } }); }
    catch { setActionError(true); setBusy(false); }
  }

  const allowed = role === 'waiter' && state.kind === 'ready' && state.profile.subject === user?.sub && state.profile.permissions.includes('create:sessions');
  return <main className="min-h-screen bg-muted/35 px-3 py-5 sm:py-8">
    <header className="mx-auto mb-5 flex max-w-md items-center justify-between gap-3">
      <a className="font-semibold text-primary" href="/staff">TableBell</a>
      <div className="flex items-center gap-2"><LanguageSelect lang={lang} setLang={setLang} />
        {isAuthenticated && <Button variant="outline" disabled={busy} onClick={signOut}>{t.signOut}</Button>}
      </div>
    </header>
    {isAuthenticated && <p className="mx-auto mb-3 max-w-md truncate text-sm text-muted-foreground">{user?.name ?? user?.email ?? ''}</p>}
    {actionError && <p role="alert" className="mx-auto mb-3 max-w-md text-sm text-red-700">{t.authError}</p>}
    {isLoading ? <p role="status" className="text-center">{t.loading}</p> : !isAuthenticated ?
      <section className="mx-auto max-w-md rounded-2xl border border-border bg-white p-6 text-center">
        <h1 className="text-xl font-semibold">{t[role]}</h1><p className="mt-3 text-sm text-muted-foreground">{t.intro}</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{t.authError}</p>}
        <Button className="mt-5 w-full" disabled={busy} onClick={signIn}>{busy ? t.opening : t.signIn}</Button>
      </section> : state.kind === 'loading' ? <p role="status" className="text-center">{t.loading}</p> :
      state.kind === 'error' ? <section role="alert" className="mx-auto max-w-md rounded-2xl border border-border bg-white p-6 text-center">
        <p>{state.error === 'unauthorized' ? t.unauthorized : state.error === 'forbidden' ? t.forbidden : t.accessError}</p>
        <Button className="mt-4" variant="outline" onClick={() => setAttempt((value) => value + 1)}>{t.retry}</Button>
      </section> : allowed ? <WaiterApp key={state.profile.subject} lang={lang} setLang={setLang} /> :
      <section role="status" className="mx-auto max-w-md rounded-2xl border border-border bg-white p-6 text-center">{role === 'admin' ? t.adminPending : t.forbidden}</section>}
  </main>;
}

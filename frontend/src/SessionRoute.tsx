import { useEffect, useState } from 'react';
import { AlertTriangle, ConciergeBell, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { CustomerApp, type Lang } from './DesignPreview';
import { getTableSession, SessionError } from '@/lib/table-session';
import type { SessionErrorKind, TableSession } from '@/lib/table-session';

const copy = {
  ro: {
    loading: 'Se deschide masa…', invalid: 'Link invalid', 'not-found': 'Sesiunea nu a fost găsită', server: 'Sesiunea nu poate fi încărcată', connection: 'Nu ne putem conecta', response: 'Sesiunea nu poate fi afișată',
    invalidText: 'Linkul nu conține un identificator de sesiune valid.', 'not-foundText': 'Nu există o sesiune pentru acest link.', serverText: 'Serviciul nu este disponibil momentan.', connectionText: 'Verifică conexiunea și încearcă din nou.', responseText: 'Informațiile primite sunt incomplete.', retry: 'Încearcă din nou', language: 'Limba', home: 'Înapoi la început',
  },
  ru: {
    loading: 'Открываем стол…', invalid: 'Недействительная ссылка', 'not-found': 'Сессия не найдена', server: 'Не удалось загрузить сессию', connection: 'Не удалось подключиться', response: 'Не удалось показать сессию',
    invalidText: 'В ссылке нет действительного идентификатора сессии.', 'not-foundText': 'Для этой ссылки нет сессии.', serverText: 'Сервис временно недоступен.', connectionText: 'Проверьте подключение и попробуйте снова.', responseText: 'Получены неполные данные.', retry: 'Попробовать снова', language: 'Язык', home: 'Вернуться в начало',
  },
  en: {
    loading: 'Opening your table…', invalid: 'Invalid link', 'not-found': 'Session not found', server: 'Unable to load the session', connection: 'Unable to connect', response: 'Unable to display the session',
    invalidText: 'This link does not contain a valid session identifier.', 'not-foundText': 'There is no session for this link.', serverText: 'The service is temporarily unavailable.', connectionText: 'Check your connection and try again.', responseText: 'The received information is incomplete.', retry: 'Try again', language: 'Language', home: 'Back to start',
  },
} as const;

type State = { kind: 'loading' } | { kind: 'ready'; session: TableSession } | { kind: 'error'; error: SessionErrorKind };

export function SessionRoute({ guid }: { guid: string }) {
  const [language, setLanguage] = useState<Lang>('ro');
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ kind: 'loading' });
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = state.kind === 'ready' ? 'TableBell · Meniu' : 'TableBell';
  }, [language, state.kind]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    let mounted = true;
    setState({ kind: 'loading' });
    getTableSession(guid, { signal: controller.signal })
      .then((session) => { if (mounted) setState({ kind: 'ready', session }); })
      .catch((error: unknown) => {
        if (mounted) {
          setState({ kind: 'error', error: error instanceof SessionError ? error.kind : 'connection' });
        }
      })
      .finally(() => window.clearTimeout(timeout));
    return () => { mounted = false; window.clearTimeout(timeout); controller.abort(); };
  }, [guid, attempt]);

  if (state.kind === 'ready') {
    return <main className="session-customer-shell"><CustomerApp key={state.session.sessionGuid} lang={language} setLang={setLanguage} table={state.session.tableId} session={state.session} /></main>;
  }

  return <main className="session-shell">
    <div className="session-container">
      <header className="session-header">
        <div className="session-brand"><span className="session-brand-icon"><ConciergeBell size={22} aria-hidden="true" /></span>TableBell</div>
        <NativeSelect value={language} onChange={(event) => setLanguage(event.target.value as Lang)} aria-label={t.language} className="session-language"><NativeSelectOption value="ro">RO</NativeSelectOption><NativeSelectOption value="ru">RU</NativeSelectOption><NativeSelectOption value="en">EN</NativeSelectOption></NativeSelect>
      </header>
      <article className="session-card" aria-busy={state.kind === 'loading'}>
        {state.kind === 'loading' && <div className="session-loading"><output className="session-loading-message"><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /><h1>{t.loading}</h1></output><div className="session-placeholder motion-safe:animate-pulse" aria-hidden="true" /><div className="session-placeholder session-placeholder-small motion-safe:animate-pulse" aria-hidden="true" /></div>}
        {state.kind === 'error' && <div className="session-error" role="alert"><span className="session-error-icon"><AlertTriangle size={28} aria-hidden="true" /></span><h1>{t[state.error]}</h1><p>{t[`${state.error}Text` as keyof typeof t] as string}</p>{state.error !== 'invalid' && <Button onClick={() => setAttempt((value) => value + 1)} className="session-button"><RefreshCw aria-hidden="true" />{t.retry}</Button>}</div>}
      </article>
    </div>
  </main>;
}

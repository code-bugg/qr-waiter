import { useEffect, useState } from 'react';
import { ConciergeBell } from 'lucide-react';
import { CustomerApp, LanguageSelect, type Lang } from './DesignPreview';
import { staffCopy } from './lib/staff-copy';

export function StaffEntry() {
  const [lang, setLang] = useState<Lang>('ro');
  const labels = {
    ro: { title: 'Acces personal', intro: 'Alege spațiul de lucru și autentifică-te cu contul restaurantului.' },
    ru: { title: 'Вход для сотрудников', intro: 'Выберите рабочий кабинет и войдите в учётную запись ресторана.' },
    en: { title: 'Staff access', intro: 'Choose your workspace and sign in with your restaurant account.' },
  }[lang];
  useEffect(() => { document.documentElement.lang = lang; document.title = `TableBell · ${labels.title}`; }, [lang, labels.title]);
  return <main className="min-h-screen bg-muted/35 px-4 py-8">
    <section className="mx-auto max-w-md rounded-2xl border border-border bg-white p-6">
      <header className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 font-semibold text-primary"><ConciergeBell aria-hidden="true" />TableBell</span><LanguageSelect lang={lang} setLang={setLang} /></header>
      <h1 className="mt-6 text-2xl font-semibold">{labels.title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{labels.intro}</p>
      <nav className="mt-6 grid gap-3" aria-label={labels.title}>
        <a href="/waiter" className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white">{staffCopy[lang].waiter}</a>
        <a href="/admin" className="rounded-xl border border-border px-4 py-3 text-center font-semibold text-primary">{staffCopy[lang].admin}</a>
      </nav>
    </section>
  </main>;
}

export function DevelopmentTools() {
  useEffect(() => { document.documentElement.lang = 'en'; document.title = 'TableBell · Local testing'; }, []);
  return <main className="min-h-screen bg-muted/35 px-4 py-8"><section className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-6">
    <p className="text-xs font-semibold uppercase tracking-wider text-accent">Development only</p><h1 className="mt-2 text-2xl font-semibold">Test TableBell</h1>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Open the customer and staff flows in separate tabs. This page is unavailable in production.</p>
    <nav className="mt-5 grid gap-3" aria-label="Local testing">
      <a className="rounded-xl border border-border p-4" href="/dev/customer" target="_blank" rel="noreferrer"><strong>Customer preview</strong><span className="mt-1 block text-sm text-muted-foreground">Sample table and menu; no account or database required.</span></a>
      <a className="rounded-xl border border-border p-4" href="/staff" target="_blank" rel="noreferrer"><strong>Staff sign-in</strong><span className="mt-1 block text-sm text-muted-foreground">Real Auth0 sign-in and backend permission checks.</span></a>
    </nav>
    <p className="mt-5 text-sm leading-6 text-muted-foreground">For a complete QR test, sign in as a waiter, create a table session, and open its QR link in a customer tab. This requires the backend and database to be running.</p>
  </section></main>;
}

export function CustomerPreview() {
  const [lang, setLang] = useState<Lang>('ro');
  const labels = {
    ro: { title: 'Previzualizare client', note: 'Date de exemplu. Solicitările și comenzile nu sunt trimise restaurantului.' },
    ru: { title: 'Предпросмотр для гостя', note: 'Пример данных. Запросы и заказы не отправляются в ресторан.' },
    en: { title: 'Customer preview', note: 'Sample data. Requests and orders are not sent to the restaurant.' },
  }[lang];
  useEffect(() => { document.documentElement.lang = lang; document.title = `TableBell · ${labels.title}`; }, [lang, labels.title]);
  return <main className="min-h-screen bg-muted/35 px-3 py-5">
    <aside className="mx-auto mb-4 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>{labels.title}</strong><p className="mt-1">{labels.note}</p></aside>
    <CustomerApp lang={lang} setLang={setLang} />
  </main>;
}

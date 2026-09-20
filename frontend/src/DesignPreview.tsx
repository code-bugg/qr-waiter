'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BellRing,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  ConciergeBell,
  CreditCard,
  History,
  LayoutDashboard,
  Minus,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Utensils,
  WalletCards,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import type { SessionStatus, TableSession } from '@/lib/table-session';

type Role = 'customer' | 'waiter' | 'admin';
export type Lang = 'ro' | 'ru' | 'en';
type Item = { id: number; name: Record<Lang, string>; description: Record<Lang, string>; price: number; category: string };
type Cart = Record<number, number>;

const copy = {
  ro: {
    roles: ['Client', 'Ospătar', 'Admin'], table: 'Masa', welcome: 'Bun venit!', ready: 'Masa ta este pregătită', intro: 'Tot ce ai nevoie pentru o experiență plăcută la masă.',
    menu: 'Vezi meniul', menuDesc: 'Descoperă preparatele și băuturile', call: 'Cheamă ospătarul', callDesc: 'Alege rapid ce ai nevoie', order: 'Vezi comanda', orderDesc: 'Produse, totaluri și partea ta', pay: 'Solicită plata', payDesc: 'Numerar sau card',
    back: 'Înapoi', search: 'Caută în meniu…', all: 'Toate', add: 'Adaugă', added: 'Adăugat', cart: 'Comanda mea', total: 'Total', yourShare: 'Partea ta', tableTotal: 'Total masă', empty: 'Nu ai adăugat încă produse.',
    nameTitle: 'Adaugă numele — opțional', nameText: 'Te ajută să urmărești ce ai comandat și care este partea ta din total. Restaurantul va emite o singură notă pentru masă.', namePlaceholder: 'Prenumele tău', addName: 'Adaugă numele', notNow: 'Nu acum', guest: 'Oaspete', changeName: 'Adaugă sau schimbă numele', oneBill: 'Restaurantul emite o singură notă pentru întreaga masă.',
    need: 'De ce ai nevoie?', chooseRequest: 'Alege o opțiune și ospătarul va fi anunțat.', cutlery: 'Tacâmuri', napkins: 'Șervețele', water: 'Apă', help: 'Ajutor cu meniul', other: 'Altceva', sent: 'Cererea a fost trimisă', sentDesc: 'Ospătarul mesei tale a fost anunțat.',
    payTitle: 'Cum dorești să plătești?', cash: 'Numerar', card: 'Card bancar', confirm: 'Confirmă', paymentSent: 'Solicitarea de plată a fost trimisă.',
    newOrder: 'Comandă nouă', requests: 'Solicitări', chooseTable: 'Alege masa', selected: 'Produse selectate', confirmOrder: 'Confirmă comanda', sendOrder: 'Trimite comanda', noNames: 'Ospătarul adaugă produse doar la masa selectată. Numele și împărțirea sunt gestionate de clienți.', activeRequests: 'Solicitări active', acknowledge: 'Preia', complete: 'Finalizează', noRequests: 'Nu mai sunt solicitări active.',
    dashboard: 'Panou operațional', live: 'Actualizat acum', queue: 'Coada de solicitări', coverage: 'Acoperire mese', menuAdmin: 'Meniu', history: 'Istoric', active: 'Active', waiter: 'Ospătar', request: 'Solicitare', waiting: 'Timp de așteptare', status: 'Status', opened: 'Nouă', seen: 'Preluată', rowHint: 'Apasă pe un rând pentru detalii. Solicitările sunt trimise automat ospătarului responsabil de masă.',
    normal: 'În timp', attention: 'Atenție', urgent: 'Urgent', details: 'Detalii solicitare', responsible: 'Responsabil', automatic: 'Alocare automată după acoperirea meselor', tables: 'Mese', onShift: 'În tură', available: 'Disponibil', items: 'produse', translations: 'RO · RU · EN pregătite', close: 'Închide',
  },
  ru: {
    roles: ['Гость', 'Официант', 'Админ'], table: 'Стол', welcome: 'Добро пожаловать!', ready: 'Ваш стол готов', intro: 'Всё необходимое для приятного отдыха.',
    menu: 'Открыть меню', menuDesc: 'Блюда и напитки', call: 'Позвать официанта', callDesc: 'Быстро выберите, что нужно', order: 'Посмотреть заказ', orderDesc: 'Позиции, суммы и ваша доля', pay: 'Попросить счёт', payDesc: 'Наличные или карта',
    back: 'Назад', search: 'Поиск по меню…', all: 'Все', add: 'Добавить', added: 'Добавлено', cart: 'Мой заказ', total: 'Итого', yourShare: 'Ваша доля', tableTotal: 'Итого стола', empty: 'Вы ещё ничего не добавили.',
    nameTitle: 'Добавить имя — необязательно', nameText: 'Так вы сможете видеть свои блюда и долю в общей сумме. Ресторан выпишет один счёт на стол.', namePlaceholder: 'Ваше имя', addName: 'Добавить имя', notNow: 'Не сейчас', guest: 'Гость', changeName: 'Добавить или изменить имя', oneBill: 'Ресторан выписывает один счёт на весь стол.',
    need: 'Что вам нужно?', chooseRequest: 'Выберите вариант — официант получит уведомление.', cutlery: 'Столовые приборы', napkins: 'Салфетки', water: 'Вода', help: 'Помощь с меню', other: 'Другое', sent: 'Запрос отправлен', sentDesc: 'Официант вашего стола уведомлён.',
    payTitle: 'Как вы хотите оплатить?', cash: 'Наличные', card: 'Банковская карта', confirm: 'Подтвердить', paymentSent: 'Запрос на оплату отправлен.',
    newOrder: 'Новый заказ', requests: 'Запросы', chooseTable: 'Выберите стол', selected: 'Выбранные позиции', confirmOrder: 'Подтвердить заказ', sendOrder: 'Отправить заказ', noNames: 'Официант добавляет блюда только к выбранному столу. Имена и доли указывают гости.', activeRequests: 'Активные запросы', acknowledge: 'Принять', complete: 'Завершить', noRequests: 'Активных запросов нет.',
    dashboard: 'Рабочая панель', live: 'Обновлено сейчас', queue: 'Очередь запросов', coverage: 'Распределение столов', menuAdmin: 'Меню', history: 'История', active: 'Активные', waiter: 'Официант', request: 'Запрос', waiting: 'Время ожидания', status: 'Статус', opened: 'Новый', seen: 'Принят', rowHint: 'Нажмите строку для подробностей. Запрос автоматически получает официант этого стола.',
    normal: 'В норме', attention: 'Внимание', urgent: 'Срочно', details: 'Детали запроса', responsible: 'Ответственный', automatic: 'Автоматически по распределению столов', tables: 'Столы', onShift: 'На смене', available: 'Доступно', items: 'позиций', translations: 'Переводы RO · RU · EN', close: 'Закрыть',
  },
  en: {
    roles: ['Guest', 'Waiter', 'Admin'], table: 'Table', welcome: 'Welcome!', ready: 'Your table is ready', intro: 'Everything you need for a relaxed dining experience.',
    menu: 'View menu', menuDesc: 'Explore food and drinks', call: 'Call a waiter', callDesc: 'Quickly choose what you need', order: 'View table order', orderDesc: 'Items, totals and your share', pay: 'Request payment', payDesc: 'Cash or card',
    back: 'Back', search: 'Search the menu…', all: 'All', add: 'Add', added: 'Added', cart: 'My order', total: 'Total', yourShare: 'Your share', tableTotal: 'Table total', empty: 'You have not added any items yet.',
    nameTitle: 'Add your name — optional', nameText: 'This helps you track what you ordered and your share of the total. The restaurant will issue one bill for the table.', namePlaceholder: 'Your first name', addName: 'Add name', notNow: 'Not now', guest: 'Guest', changeName: 'Add or change name', oneBill: 'The restaurant issues one bill for the whole table.',
    need: 'What do you need?', chooseRequest: 'Choose an option and your waiter will be notified.', cutlery: 'Cutlery', napkins: 'Napkins', water: 'Water', help: 'Help with the menu', other: 'Something else', sent: 'Request sent', sentDesc: 'Your table’s waiter has been notified.',
    payTitle: 'How would you like to pay?', cash: 'Cash', card: 'Bank card', confirm: 'Confirm', paymentSent: 'Your payment request has been sent.',
    newOrder: 'New order', requests: 'Requests', chooseTable: 'Choose table', selected: 'Selected items', confirmOrder: 'Confirm order', sendOrder: 'Send order', noNames: 'The waiter adds items only to the selected table. Names and shares are managed by guests.', activeRequests: 'Active requests', acknowledge: 'Acknowledge', complete: 'Complete', noRequests: 'There are no active requests.',
    dashboard: 'Operations dashboard', live: 'Updated now', queue: 'Request queue', coverage: 'Table coverage', menuAdmin: 'Menu', history: 'History', active: 'Active', waiter: 'Waiter', request: 'Request', waiting: 'Waiting time', status: 'Status', opened: 'New', seen: 'Acknowledged', rowHint: 'Select a row for details. Requests are automatically routed to the waiter responsible for the table.',
    normal: 'On time', attention: 'Attention', urgent: 'Urgent', details: 'Request details', responsible: 'Responsible', automatic: 'Automatically routed by table coverage', tables: 'Tables', onShift: 'On shift', available: 'Available', items: 'items', translations: 'RO · RU · EN ready', close: 'Close',
  },
} as const;

const menuItems: Item[] = [
  { id: 1, name: { ro: 'Burger clasic', ru: 'Классический бургер', en: 'Classic burger' }, description: { ro: 'Vită, cheddar, salată, sosul casei', ru: 'Говядина, чеддер, салат, фирменный соус', en: 'Beef, cheddar, lettuce, house sauce' }, price: 142, category: 'Popular' },
  { id: 2, name: { ro: 'Pizza Margherita', ru: 'Пицца Маргарита', en: 'Margherita pizza' }, description: { ro: 'Roșii, mozzarella și busuioc', ru: 'Томаты, моцарелла и базилик', en: 'Tomato, mozzarella and basil' }, price: 128, category: 'Popular' },
  { id: 3, name: { ro: 'Salată Caesar', ru: 'Салат Цезарь', en: 'Caesar salad' }, description: { ro: 'Pui, parmezan, crutoane și dressing', ru: 'Курица, пармезан, гренки и соус', en: 'Chicken, parmesan, croutons and dressing' }, price: 116, category: 'Fresh' },
  { id: 4, name: { ro: 'Paste Carbonara', ru: 'Паста Карбонара', en: 'Carbonara pasta' }, description: { ro: 'Sos cremos, pancetta și parmezan', ru: 'Сливочный соус, панчетта и пармезан', en: 'Creamy sauce, pancetta and parmesan' }, price: 154, category: 'Mains' },
  { id: 5, name: { ro: 'Cartofi cu paprika', ru: 'Картофель с паприкой', en: 'Paprika fries' }, description: { ro: 'Crocanți, cu paprika afumată', ru: 'Хрустящие, с копчёной паприкой', en: 'Crispy fries with smoked paprika' }, price: 62, category: 'Sides' },
  { id: 6, name: { ro: 'Limonadă de casă', ru: 'Домашний лимонад', en: 'House lemonade' }, description: { ro: 'Lămâie, mentă și miere', ru: 'Лимон, мята и мёд', en: 'Lemon, mint and honey' }, price: 48, category: 'Drinks' },
];

const money = (value: number) => `${value.toFixed(0)} MDL`;

function LanguageSelect({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <NativeSelect size="sm" value={lang} onChange={(event) => setLang(event.target.value as Lang)} aria-label="Language">
      <NativeSelectOption value="ro">RO</NativeSelectOption>
      <NativeSelectOption value="ru">RU</NativeSelectOption>
      <NativeSelectOption value="en">EN</NativeSelectOption>
    </NativeSelect>
  );
}

function Brand() {
  return <div className="flex items-center gap-2.5 font-semibold tracking-tight"><span className="grid size-10 place-items-center rounded-xl bg-accent text-white"><ConciergeBell className="size-5" /></span><span>TableBell</span></div>;
}

const sessionStatusCopy: Record<Lang, Record<SessionStatus, string>> = {
  ro: { Active: 'Activă', Expired: 'Expirată', Closed: 'Închisă', Cancelled: 'Anulată' },
  ru: { Active: 'Активна', Expired: 'Истекла', Closed: 'Закрыта', Cancelled: 'Отменена' },
  en: { Active: 'Active', Expired: 'Expired', Closed: 'Closed', Cancelled: 'Cancelled' },
};

function MobileHeader({ lang, setLang, onBack, table = 8, status, backLabel }: { lang: Lang; setLang: (lang: Lang) => void; onBack?: () => void; table?: number; status?: SessionStatus; backLabel: string }) {
  return <header className="flex min-h-16 items-center justify-between gap-2 border-b border-border bg-white px-4 py-3">
    {onBack ? <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft />{backLabel}</Button> : <Brand />}
    <div className="flex items-center gap-2"><span className="rounded-full bg-highlight px-2.5 py-1.5 text-xs font-semibold text-[#29411f]">#{table}</span>{status && <span className={`hidden rounded-full px-2.5 py-1.5 text-xs font-semibold sm:inline-flex session-status-${status.toLowerCase()}`}>{sessionStatusCopy[lang][status]}</span>}<LanguageSelect lang={lang} setLang={setLang} /></div>
  </header>;
}

function Quantity({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return <div className="flex items-center gap-2" aria-label="Quantity">
    <button className="grid size-8 place-items-center rounded-full border border-border bg-white text-primary disabled:opacity-40" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}><Minus className="size-4" /></button>
    <span className="min-w-5 text-center text-sm font-semibold">{value}</span>
    <button className="grid size-8 place-items-center rounded-full bg-primary text-white" onClick={() => onChange(value + 1)}><Plus className="size-4" /></button>
  </div>;
}

export function CustomerApp({ lang, setLang, table = 8, session }: { lang: Lang; setLang: (lang: Lang) => void; table?: number; session?: TableSession }) {
  const t = copy[lang];
  const [screen, setScreen] = useState<'home' | 'menu' | 'order' | 'call' | 'pay'>('home');
  const [cart, setCart] = useState<Cart>({});
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [draftName, setDraftName] = useState('');
  const [askedName, setAskedName] = useState(false);
  const [nameDialog, setNameDialog] = useState(false);
  const [notice, setNotice] = useState('');
  const total = menuItems.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
  const tableTotal = total + 286;
  const filtered = menuItems.filter((item) => `${item.name[lang]} ${item.description[lang]}`.toLowerCase().includes(search.toLowerCase()));
  const changeQty = (id: number, next: number) => {
    const hadItems = Object.values(cart).some(Boolean);
    setCart((current) => ({ ...current, [id]: next }));
    if (!hadItems && next > 0 && !askedName && !name) { setAskedName(true); setNameDialog(true); }
  };
  const navigate = (next: typeof screen) => { setNotice(''); setScreen(next); };
  const homeActions = [
    { title: t.menu, description: t.menuDesc, icon: Utensils, screen: 'menu' as const, primary: true },
    { title: t.call, description: t.callDesc, icon: BellRing, screen: 'call' as const },
    { title: t.order, description: t.orderDesc, icon: ReceiptText, screen: 'order' as const },
    { title: t.pay, description: t.payDesc, icon: CreditCard, screen: 'pay' as const },
  ];
  return <div className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_70px_rgba(21,77,52,0.14)] sm:min-h-[760px]">
    <MobileHeader lang={lang} setLang={setLang} onBack={screen === 'home' ? undefined : () => navigate('home')} table={table} status={session?.sessionStatus} backLabel={t.back} />
    {screen === 'home' && <div className="px-4 py-6 sm:px-5">
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t.ready}</p><h1 className="text-3xl font-semibold tracking-[-0.04em]">{t.welcome}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{t.intro}</p>
      <div className="mt-6 grid gap-3">{homeActions.map(({ title, description, icon: Icon, screen: target, primary }) => <button className={`group grid min-h-[80px] w-full grid-cols-[48px_1fr_20px] items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[.99] ${primary ? 'border-primary bg-primary text-white' : 'border-border bg-white hover:border-primary/30 hover:bg-primary-light/35'}`} key={title} onClick={() => navigate(target)}><span className={`grid size-12 place-items-center rounded-xl ${primary ? 'bg-accent text-white' : 'bg-primary-light text-primary'}`}><Icon className="size-5" /></span><span><span className="block text-sm font-semibold">{title}</span><span className={`mt-1 block text-xs ${primary ? 'text-white/70' : 'text-muted-foreground'}`}>{description}</span></span><ChevronRight className="size-5 opacity-60" /></button>)}</div>
      {session && <SessionSummary session={session} lang={lang} />}
    </div>}
    {screen === 'menu' && <div className="px-4 py-5"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-accent">TableBell</p><h1 className="text-2xl font-semibold">{t.menu}</h1></div><Button size="sm" variant="secondary" onClick={() => navigate('order')}><ReceiptText />{Object.values(cart).reduce((a,b) => a+b,0)}</Button></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-9" placeholder={t.search} /></div><div className="mt-4 grid gap-3">{filtered.map((item) => <article className="rounded-2xl border border-border bg-white p-4" key={item.id}><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{item.name[lang]}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description[lang]}</p></div><span className="h-fit whitespace-nowrap rounded-lg bg-highlight px-2.5 py-1.5 text-xs font-bold text-[#29411f]">{money(item.price)}</span></div><div className="mt-4 flex items-center justify-between"><span className="text-xs font-medium text-primary">{t.available}</span>{cart[item.id] ? <Quantity value={cart[item.id]} onChange={(next) => changeQty(item.id, next)} /> : <Button size="sm" onClick={() => changeQty(item.id, 1)}><Plus />{t.add}</Button>}</div></article>)}</div></div>}
    {screen === 'order' && <div className="px-4 py-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-accent">{t.orderDesc}</p><h1 className="mt-1 text-2xl font-semibold">{t.order}</h1></div><span className="rounded-xl bg-primary-light px-3 py-2 text-xs font-semibold text-primary"><UserRound className="mr-1 inline size-4" />{name || t.guest}</span></div>
      {total === 0 ? <div className="mt-12 text-center text-muted-foreground"><ReceiptText className="mx-auto mb-3 size-10 text-primary/35" /><p>{t.empty}</p><Button className="mt-5" onClick={() => navigate('menu')}><Utensils />{t.menu}</Button></div> : <><div className="mt-5 grid gap-2">{menuItems.filter((item) => cart[item.id]).map((item) => <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3" key={item.id}><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name[lang]}</p><p className="text-xs text-muted-foreground">{cart[item.id]} × {money(item.price)}</p></div><span className="text-sm font-bold">{money(item.price * cart[item.id])}</span></div>)}</div><button onClick={() => setNameDialog(true)} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-primary/35 bg-primary-light/40 p-3 text-left text-sm font-medium text-primary"><UserRound className="size-4" />{t.changeName}<ChevronRight className="ml-auto size-4" /></button><div className="mt-5 rounded-2xl bg-primary p-4 text-white"><div className="flex justify-between text-sm text-white/70"><span>{t.tableTotal}</span><span>{money(tableTotal)}</span></div><div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-lg font-semibold"><span>{t.yourShare}</span><span>{money(total)}</span></div><p className="mt-3 text-xs leading-5 text-white/65">{t.oneBill}</p></div></>}
    </div>}
    {screen === 'call' && <div className="px-4 py-5"><p className="text-xs font-semibold uppercase tracking-wider text-accent">{t.call}</p><h1 className="mt-1 text-2xl font-semibold">{t.need}</h1><p className="mt-2 text-sm text-muted-foreground">{t.chooseRequest}</p>{notice ? <SuccessNotice title={t.sent} text={t.sentDesc} /> : <div className="mt-5 grid grid-cols-2 gap-3">{([[t.cutlery, Utensils],[t.napkins, Sparkles],[t.water, WalletCards],[t.help, CircleHelp],[t.other, BellRing]] as [string, LucideIcon][]).map(([label, Icon]) => <button onClick={() => setNotice(label)} className="flex min-h-28 flex-col items-start justify-between rounded-2xl border border-border bg-white p-4 text-left text-sm font-semibold hover:border-primary/30 hover:bg-primary-light/30" key={label}><span className="grid size-10 place-items-center rounded-xl bg-primary-light text-primary"><Icon className="size-5" /></span>{label}</button>)}</div>}</div>}
    {screen === 'pay' && <div className="px-4 py-5"><p className="text-xs font-semibold uppercase tracking-wider text-accent">{t.pay}</p><h1 className="mt-1 text-2xl font-semibold">{t.payTitle}</h1>{notice ? <SuccessNotice title={t.paymentSent} text={t.sentDesc} /> : <div className="mt-6 grid gap-3">{([[t.card, CreditCard],[t.cash, WalletCards]] as [string, LucideIcon][]).map(([label, Icon]) => <button onClick={() => setNotice(label)} className="flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left text-base font-semibold hover:border-primary hover:bg-primary-light/30" key={label}><span className="grid size-12 place-items-center rounded-xl bg-primary-light text-primary"><Icon className="size-6" /></span>{label}<ChevronRight className="ml-auto size-5 text-muted-foreground" /></button>)}</div>}</div>}
    <Dialog open={nameDialog} onOpenChange={setNameDialog}><DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-sm"><DialogHeader><div className="mb-2 grid size-11 place-items-center rounded-xl bg-highlight text-primary"><UserRound className="size-5" /></div><DialogTitle>{t.nameTitle}</DialogTitle><DialogDescription className="leading-6">{t.nameText}</DialogDescription></DialogHeader><Input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder={t.namePlaceholder} /><DialogFooter className="grid grid-cols-2"><Button variant="outline" onClick={() => setNameDialog(false)}>{t.notNow}</Button><Button disabled={!draftName.trim()} onClick={() => { setName(draftName.trim()); setNameDialog(false); }}><Check />{t.addName}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

function SessionSummary({ session, lang }: { session: TableSession; lang: Lang }) {
  const labels = {
    ro: { status: 'Sesiune', start: 'Deschisă la', expiration: 'Expiră la', order: 'Comandă', noOrder: 'Nicio comandă asociată' },
    ru: { status: 'Сессия', start: 'Открыта', expiration: 'Истекает', order: 'Заказ', noOrder: 'Связанного заказа нет' },
    en: { status: 'Session', start: 'Opened at', expiration: 'Expires at', order: 'Order', noOrder: 'No linked order' },
  }[lang];
  const formatter = new Intl.DateTimeFormat({ ro: 'ro-RO', ru: 'ru-RU', en: 'en-GB' }[lang], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  return <dl className="customer-session-summary">
    <div><dt>{labels.status}</dt><dd><span className={`customer-session-status session-status-${session.sessionStatus.toLowerCase()}`}>{sessionStatusCopy[lang][session.sessionStatus]}</span></dd></div>
    <div><dt>{labels.start}</dt><dd><time dateTime={session.sessionStartTime}>{formatter.format(new Date(session.sessionStartTime))}</time></dd></div>
    <div><dt>{labels.expiration}</dt><dd><time dateTime={session.sessionExpirationTime}>{formatter.format(new Date(session.sessionExpirationTime))}</time></dd></div>
    <div><dt>{labels.order}</dt><dd>{session.orderId === null ? labels.noOrder : `#${session.orderId}`}</dd></div>
  </dl>;
}

function SuccessNotice({ title, text }: { title: string; text: string }) {
  return <div className="mt-8 rounded-2xl border border-primary/20 bg-primary-light p-6 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-white"><Check className="size-6" /></span><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>;
}

const initialRequests = [
  { id: 1, table: 4, request: { ro: 'Apă', ru: 'Вода', en: 'Water' }, minutes: 1, waiter: 'Andrei', status: 'new' },
  { id: 2, table: 7, request: { ro: 'Tacâmuri', ru: 'Приборы', en: 'Cutlery' }, minutes: 2, waiter: 'Elena', status: 'new' },
  { id: 3, table: 2, request: { ro: 'Plată cu cardul', ru: 'Оплата картой', en: 'Card payment' }, minutes: 5, waiter: 'Andrei', status: 'seen' },
  { id: 4, table: 11, request: { ro: 'Ajutor cu meniul', ru: 'Помощь с меню', en: 'Menu help' }, minutes: 8, waiter: 'Mihai', status: 'new' },
];

function UrgencyBadge({ minutes, t }: { minutes: number; t: typeof copy[Lang] }) {
  const state = minutes < 2 ? 'normal' : minutes < 4 ? 'attention' : 'urgent';
  const classes = state === 'normal' ? 'bg-[#e1f3e5] text-[#176333]' : state === 'attention' ? 'bg-[#fff0d9] text-[#92500b]' : 'bg-[#fde3e0] text-[#a32f29]';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${classes}`}><Clock3 className="size-3.5" />{minutes}:00 · {t[state]}</span>;
}

function WaiterApp({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const t = copy[lang];
  const [tab, setTab] = useState<'order' | 'requests'>('order');
  const [table, setTable] = useState(4);
  const [cart, setCart] = useState<Cart>({});
  const [search, setSearch] = useState('');
  const [sent, setSent] = useState(false);
  const [requests, setRequests] = useState(initialRequests.filter((r) => [2,4,6,8].includes(r.table)));
  const filtered = menuItems.filter((item) => `${item.name[lang]} ${item.description[lang]}`.toLowerCase().includes(search.toLowerCase()));
  const qty = Object.values(cart).reduce((a,b) => a+b,0);
  const total = menuItems.reduce((sum,item) => sum + (cart[item.id]||0)*item.price,0);
  return <div className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_70px_rgba(21,77,52,.14)] sm:min-h-[760px]">
    <header className="border-b border-border bg-white px-4 py-3"><div className="flex items-center justify-between"><Brand /><LanguageSelect lang={lang} setLang={setLang} /></div><div className="mt-3 grid grid-cols-2 rounded-xl bg-muted p-1"><button onClick={() => setTab('order')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab==='order'?'bg-white text-primary shadow-sm':'text-muted-foreground'}`}><Plus className="size-4" />{t.newOrder}</button><button onClick={() => setTab('requests')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab==='requests'?'bg-white text-primary shadow-sm':'text-muted-foreground'}`}><BellRing className="size-4" />{t.requests}<span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-white">{requests.length}</span></button></div></header>
    {tab === 'order' && <div className="px-4 py-5"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-accent">{t.newOrder}</p><h1 className="mt-1 text-2xl font-semibold">{t.chooseTable}</h1></div><NativeSelect value={table} onChange={(e)=>setTable(Number(e.target.value))} className="w-28"><NativeSelectOption value="2">#2</NativeSelectOption><NativeSelectOption value="4">#4</NativeSelectOption><NativeSelectOption value="6">#6</NativeSelectOption><NativeSelectOption value="8">#8</NativeSelectOption></NativeSelect></div><p className="mt-3 rounded-xl bg-primary-light/65 p-3 text-xs leading-5 text-primary"><ShieldCheck className="mr-1.5 inline size-4" />{t.noNames}</p><div className="relative mt-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder={t.search} className="h-11 pl-9" /></div><div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">{filtered.map((item)=><div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.name[lang]}</p><p className="text-xs text-muted-foreground">{money(item.price)}</p></div><Quantity value={cart[item.id]||0} onChange={(next)=>setCart((c)=>({...c,[item.id]:next}))} /></div>)}</div>{qty>0 && <div className="mt-5 rounded-2xl border border-primary/15 bg-primary-light/45 p-4"><div className="flex justify-between"><div><p className="font-semibold">{t.selected}</p><p className="text-xs text-muted-foreground">{qty} {t.items} · {t.table} #{table}</p></div><span className="font-bold">{money(total)}</span></div>{sent?<div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 text-sm font-semibold text-primary"><Check className="size-4" />{t.sent}</div>:<Button className="mt-4 w-full" onClick={()=>setSent(true)}><Check />{t.sendOrder}</Button>}</div>}</div>}
    {tab === 'requests' && <div className="px-4 py-5"><p className="text-xs font-semibold uppercase tracking-wider text-accent">{t.requests}</p><h1 className="mt-1 text-2xl font-semibold">{t.activeRequests}</h1><p className="mt-2 text-sm text-muted-foreground">{t.tables}: 2, 4, 6, 8</p><div className="mt-5 grid gap-3">{requests.length===0?<SuccessNotice title={t.noRequests} text="" />:requests.map((request)=><article key={request.id} className="rounded-2xl border border-border bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.table} #{request.table}</p><h2 className="mt-1 font-semibold">{request.request[lang]}</h2></div><UrgencyBadge minutes={request.minutes} t={t} /></div><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" onClick={()=>setRequests((rs)=>rs.map((r)=>r.id===request.id?{...r,status:'seen'}:r))} disabled={request.status==='seen'}><Clock3 />{t.acknowledge}</Button><Button onClick={()=>setRequests((rs)=>rs.filter((r)=>r.id!==request.id))}><Check />{t.complete}</Button></div></article>)}</div></div>}
  </div>;
}

function AdminApp({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const t = copy[lang];
  const [section, setSection] = useState<'active'|'coverage'|'menu'|'history'>('active');
  const [selected, setSelected] = useState<typeof initialRequests[number] | null>(null);
  const nav = [
    { id:'active' as const, label:t.active, icon:LayoutDashboard }, { id:'coverage' as const,label:t.coverage,icon:UsersRound }, { id:'menu' as const,label:t.menuAdmin,icon:Utensils }, { id:'history' as const,label:t.history,icon:History },
  ];
  return <section className="mx-auto min-h-[760px] w-full max-w-[1440px] overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_24px_70px_rgba(21,77,52,.12)] lg:grid lg:grid-cols-[250px_1fr]">
    <aside className="hidden bg-primary p-5 text-white lg:flex lg:flex-col"><Brand /><p className="mt-8 text-xs font-semibold uppercase tracking-[.16em] text-white/50">{t.dashboard}</p><nav className="mt-3 grid gap-1">{nav.map(({id,label,icon:Icon})=><button key={id} onClick={()=>setSection(id)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${section===id?'bg-white text-primary':'text-white/75 hover:bg-white/10'}`}><Icon className="size-4" />{label}</button>)}</nav><div className="mt-auto rounded-2xl bg-white/10 p-4"><p className="text-sm font-semibold">Restaurant Centru</p><p className="mt-1 text-xs text-white/55">12 {t.tables.toLowerCase()} · 3 {t.waiter.toLowerCase()}</p></div></aside>
    <div className="min-w-0"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6"><div className="lg:hidden"><Brand /></div><div className="hidden lg:block"><h1 className="text-xl font-semibold">{nav.find((n)=>n.id===section)?.label}</h1><p className="mt-0.5 text-xs text-muted-foreground"><span className="mr-1 inline-block size-2 rounded-full bg-[#3f9b5f]" />{t.live}</p></div><LanguageSelect lang={lang} setLang={setLang} /></header><nav className="grid grid-cols-4 border-b border-border bg-white p-2 lg:hidden">{nav.map(({id,label,icon:Icon})=><button key={id} onClick={()=>setSection(id)} className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold ${section===id?'bg-primary-light text-primary':'text-muted-foreground'}`}><Icon className="size-4" />{label}</button>)}</nav>
      <main className="bg-background p-4 sm:p-6 lg:p-8">
        {section==='active' && <><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-accent">{t.dashboard}</p><h2 className="mt-1 text-2xl font-semibold">{t.queue}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.rowHint}</p></div><div className="flex gap-2"><Stat value="4" label={t.active} tone="green" /><Stat value="2" label={t.urgent} tone="red" /></div></div><div className="mt-6 hidden overflow-hidden rounded-2xl border border-border bg-white md:block"><table className="w-full border-collapse text-left"><thead className="bg-primary-light/55 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">{t.table}</th><th className="p-4">{t.request}</th><th className="p-4">{t.waiter}</th><th className="p-4">{t.status}</th><th className="p-4">{t.waiting}</th><th className="p-4"><span className="sr-only">{t.details}</span></th></tr></thead><tbody>{initialRequests.map((r)=><tr key={r.id} onClick={()=>setSelected(r)} className="cursor-pointer border-t border-border transition hover:bg-primary-light/30"><td className="p-4 font-bold">#{r.table}</td><td className="p-4 font-semibold">{r.request[lang]}</td><td className="p-4"><span className="inline-flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-primary-light text-xs font-bold text-primary">{r.waiter[0]}</span>{r.waiter}</span></td><td className="p-4 text-sm text-muted-foreground">{r.status==='seen'?t.seen:t.opened}</td><td className="p-4"><UrgencyBadge minutes={r.minutes} t={t} /></td><td className="p-4"><ChevronRight className="size-4 text-muted-foreground" /></td></tr>)}</tbody></table></div><div className="mt-5 grid gap-3 md:hidden">{initialRequests.map((r)=><button key={r.id} onClick={()=>setSelected(r)} className="rounded-2xl border border-border bg-white p-4 text-left"><div className="flex items-start justify-between"><span className="font-bold">{t.table} #{r.table}</span><UrgencyBadge minutes={r.minutes} t={t} /></div><p className="mt-3 font-semibold">{r.request[lang]}</p><p className="mt-2 text-xs text-muted-foreground">{t.waiter}: {r.waiter} · {r.status==='seen'?t.seen:t.opened}</p></button>)}</div></>}
        {section==='coverage' && <SimpleSection eyebrow={t.automatic} title={t.coverage}><div className="grid gap-4 md:grid-cols-3">{[{name:'Andrei',tables:'1, 2, 3, 4'},{name:'Elena',tables:'5, 6, 7, 8'},{name:'Mihai',tables:'9, 10, 11, 12'}].map((w)=><article key={w.name} className="rounded-2xl border border-border bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-primary text-lg font-bold text-white">{w.name[0]}</span><div><h3 className="font-semibold">{w.name}</h3><p className="text-xs text-[#23733d]">● {t.onShift}</p></div></div><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.tables}</p><p className="mt-1 text-lg font-semibold">{w.tables}</p></article>)}</div></SimpleSection>}
        {section==='menu' && <SimpleSection eyebrow={t.translations} title={t.menuAdmin}><div className="overflow-hidden rounded-2xl border border-border bg-white">{menuItems.map((item)=><div key={item.id} className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-0"><div><p className="font-semibold">{item.name[lang]}</p><p className="mt-1 text-xs text-muted-foreground">{item.description[lang]}</p></div><span className="rounded-lg bg-highlight px-3 py-1.5 text-sm font-bold text-primary">{money(item.price)}</span></div>)}</div></SimpleSection>}
        {section==='history' && <SimpleSection eyebrow="30 zile" title={t.history}><div className="grid gap-4 sm:grid-cols-3"><Stat value="486" label={t.requests} tone="green" /><Stat value="1:42" label={t.waiting} tone="orange" /><Stat value="94%" label={t.normal} tone="green" /></div><div className="mt-5 rounded-2xl border border-border bg-white p-6 text-center text-sm text-muted-foreground"><History className="mx-auto mb-3 size-9 text-primary/35" />{t.history} · 12 Sep — 16 Sep</div></SimpleSection>}
      </main>
    </div>
    <Dialog open={!!selected} onOpenChange={(open)=>!open&&setSelected(null)}><DialogContent className="max-w-md rounded-2xl"><DialogHeader><DialogTitle>{t.details}</DialogTitle><DialogDescription>{t.automatic}</DialogDescription></DialogHeader>{selected&&<div className="grid gap-3"><div className="rounded-xl bg-primary-light p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.request}</p><p className="mt-1 text-lg font-semibold">{selected.request[lang]}</p></div><div className="grid grid-cols-2 gap-3"><Detail label={t.table} value={`#${selected.table}`} /><Detail label={t.responsible} value={selected.waiter} /></div><UrgencyBadge minutes={selected.minutes} t={t} /></div>}<DialogFooter><Button onClick={()=>setSelected(null)}><X />{t.close}</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}

function Stat({ value, label, tone }: { value:string; label:string; tone:'green'|'orange'|'red' }) {
  const c = tone==='green'?'bg-primary-light text-primary':tone==='orange'?'bg-[#fff0d9] text-[#92500b]':'bg-[#fde3e0] text-[#a32f29]';
  return <div className={`min-w-24 rounded-xl px-4 py-3 ${c}`}><p className="text-xl font-bold">{value}</p><p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{label}</p></div>;
}
function Detail({label,value}:{label:string;value:string}) { return <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function SimpleSection({eyebrow,title,children}:{eyebrow:string;title:string;children:React.ReactNode}) { return <><p className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p><h2 className="mt-1 mb-6 text-2xl font-semibold">{title}</h2>{children}</>; }

export default function Home() {
  const [role, setRole] = useState<Role>('customer');
  const [lang, setLang] = useState<Lang>('ro');
  const t = copy[lang];
  useEffect(() => { document.documentElement.lang = lang; document.title = 'TableBell'; }, [lang]);
  const roles: { id: Role; icon: typeof UserRound }[] = [{id:'customer',icon:UserRound},{id:'waiter',icon:ConciergeBell},{id:'admin',icon:Settings2}];
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(215,233,155,.32),transparent_28%),linear-gradient(#fafcfa,#f4f8f5)] px-3 py-5 text-foreground sm:px-6 sm:py-8">
    <div className={`mx-auto mb-5 grid rounded-2xl border border-border bg-white p-1.5 shadow-sm ${role==='admin'?'max-w-xl':'max-w-md'} grid-cols-3`}>{roles.map(({id,icon:Icon},index)=><Button key={id} onClick={()=>setRole(id)} variant={role===id?'default':'ghost'} className="rounded-xl"><Icon />{t.roles[index]}</Button>)}</div>
    {role==='customer'&&<CustomerApp lang={lang} setLang={setLang} />}
    {role==='waiter'&&<WaiterApp lang={lang} setLang={setLang} />}
    {role==='admin'&&<AdminApp lang={lang} setLang={setLang} />}
  </main>;
}

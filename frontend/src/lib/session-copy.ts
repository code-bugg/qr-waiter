export const sessionCopy = {
  ro: {
    title: 'Sesiuni mese', intro: 'Deschide sesiunea mesei și oferă codul QR clienților.', table: 'Masa', choose: 'Alege masa',
    empty: 'Nicio sesiune deschisă', emptyText: 'Alege masa, apoi creează sau redeschide sesiunea ei.',
    create: 'Creează sau redeschide sesiunea', creating: 'Se deschide sesiunea…', refreshing: 'Se verifică sesiunea…', refresh: 'Actualizează',
    status: 'Status', opened: 'Deschisă la', expires: 'Expiră la', open: 'Deschide linkul', copy: 'Copiază linkul', copied: 'Link copiat', copying: 'Se copiază…',
    copyFailed: 'Linkul nu a putut fi copiat. Selectează-l în câmpul de mai jos și copiază-l manual.', link: 'Link pentru clienți',
    inactive: 'Sesiunea este inactivă. Creează sau redeschide o sesiune înainte de a oferi codul clienților.',
    checking: 'Se verifică starea sesiunii…', unavailable: 'Starea nu a putut fi verificată. Actualizează înainte de a distribui linkul.',
  },
  ru: {
    title: 'Сессии столов', intro: 'Откройте сессию стола и предоставьте QR-код гостям.', table: 'Стол', choose: 'Выберите стол',
    empty: 'Сессия не открыта', emptyText: 'Выберите стол, затем создайте или откройте его сессию.',
    create: 'Создать или открыть сессию', creating: 'Открываем сессию…', refreshing: 'Проверяем сессию…', refresh: 'Обновить',
    status: 'Статус', opened: 'Открыта', expires: 'Истекает', open: 'Открыть ссылку', copy: 'Копировать ссылку', copied: 'Ссылка скопирована', copying: 'Копируем…',
    copyFailed: 'Не удалось скопировать ссылку. Выделите её в поле ниже и скопируйте вручную.', link: 'Ссылка для гостей',
    inactive: 'Сессия неактивна. Создайте или откройте сессию, прежде чем передавать код гостям.',
    checking: 'Проверяем состояние сессии…', unavailable: 'Не удалось проверить состояние. Обновите его перед отправкой ссылки.',
  },
  en: {
    title: 'Table sessions', intro: 'Open a table session and share its QR code with your guests.', table: 'Table', choose: 'Choose table',
    empty: 'No session opened', emptyText: 'Choose a table, then create or reopen its session.',
    create: 'Create or reopen session', creating: 'Opening session…', refreshing: 'Checking session…', refresh: 'Refresh',
    status: 'Status', opened: 'Opened at', expires: 'Expires at', open: 'Open link', copy: 'Copy link', copied: 'Link copied', copying: 'Copying…',
    copyFailed: 'Unable to copy the link. Select it in the field below and copy it manually.', link: 'Customer link',
    inactive: 'This session is inactive. Create or reopen a session before sharing a code with guests.',
    checking: 'Checking the session status…', unavailable: 'Unable to verify the status. Refresh before sharing the link.',
  },
} as const;

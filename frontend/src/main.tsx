import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import DesignPreview from './DesignPreview';
import { SessionRoute } from './SessionRoute';
import { StaffRoute } from './StaffRoute';
import { StaffEntry } from './EntryPages';
import { resolveAppRoute } from './lib/app-route';
import { staffCopy } from './lib/staff-copy';
import { staffReturnPath } from './lib/staff';
import { auth0Audience, auth0ClientId, auth0Domain, isAuth0Configured } from '@/lib/auth0-config';
import './styles.css';

const route = resolveAppRoute(window.location.pathname, window.location.search, import.meta.env.DEV);

function StaffApplication() {
  const [staffPath, setStaffPath] = useState(route.kind === 'staff' && route.role === 'admin' ? '/admin' : '/waiter');
  const role = staffPath === '/admin' ? 'admin' : 'waiter';
  const content = <StaffRoute role={role} />;
  if (!isAuth0Configured) {
    return <main className="session-shell"><section className="session-card"><h1>TableBell</h1><p role="alert">{staffCopy.ro.setup}</p><a href="/staff">TableBell</a></section></main>;
  }
  return <Auth0Provider domain={auth0Domain} clientId={auth0ClientId}
    authorizationParams={{ redirect_uri: window.location.origin, audience: auth0Audience }}
    onRedirectCallback={(appState) => {
      const destination = staffReturnPath(appState?.returnTo, '/waiter');
      window.history.replaceState({}, document.title, destination);
      setStaffPath(destination);
    }}>
    {content}
  </Auth0Provider>;
}

// The development screens have no route or dynamic import in production.
const DevelopmentTools = import.meta.env.DEV ? React.lazy(() => import('./EntryPages').then((module) => ({ default: module.DevelopmentTools }))) : null;
const CustomerPreview = import.meta.env.DEV ? React.lazy(() => import('./EntryPages').then((module) => ({ default: module.CustomerPreview }))) : null;
let content: React.ReactNode;
switch (route.kind) {
  case 'customer-entry': content = <DesignPreview />; break;
  case 'session': content = <SessionRoute guid={route.guid} />; break;
  case 'staff-entry': content = <StaffEntry />; break;
  case 'staff': case 'staff-callback': content = <StaffApplication />; break;
  case 'dev-tools': content = DevelopmentTools && <DevelopmentTools />; break;
  case 'customer-preview': content = CustomerPreview && <CustomerPreview />; break;
  default: content = <SessionRoute guid="" />;
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><React.Suspense fallback={<main className="session-shell"><p role="status">TableBell…</p></main>}>{content}</React.Suspense></React.StrictMode>,
);

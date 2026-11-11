import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import DesignPreview from './DesignPreview';
import { SessionRoute } from './SessionRoute';
import {
  auth0Audience,
  auth0ClientId,
  auth0Domain,
  isAuth0Configured,
} from '@/lib/auth0-config';
import './styles.css';

const path = window.location.pathname.replace(/\/$/, '');
const match = /^\/session\/([^/]+)$/.exec(path);
let guid = '';
try { guid = match ? decodeURIComponent(match[1]) : ''; } catch { /* Invalid URL: show invalid-link state. */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={isAuth0Configured ? auth0Domain : 'localhost.invalid'}
      clientId={isAuth0Configured ? auth0ClientId : 'not-configured'}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: isAuth0Configured ? auth0Audience : undefined,
      }}
    >
      {path === '' ? <DesignPreview /> : <SessionRoute guid={guid} />}
    </Auth0Provider>
  </React.StrictMode>,
);

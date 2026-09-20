import React from 'react';
import ReactDOM from 'react-dom/client';
import DesignPreview from './DesignPreview';
import { SessionRoute } from './SessionRoute';
import './styles.css';

const path = window.location.pathname.replace(/\/$/, '');
const match = /^\/session\/([^/]+)$/.exec(path);
let guid = '';
try { guid = match ? decodeURIComponent(match[1]) : ''; } catch { /* Invalid URL: show invalid-link state. */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {path === '' ? <DesignPreview /> : <SessionRoute guid={guid} />}
  </React.StrictMode>,
);

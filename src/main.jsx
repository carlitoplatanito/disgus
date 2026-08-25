import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import injectStyles from './index.css?inline'

const style = document.createElement('style');
style.textContent = injectStyles;
document.head.appendChild(style);

const win = window.top || window;
const doc = win.document;

function getMetaContent(property) {
  return doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content');
}

function getMetaContents(property) {
  return Array.from(doc.querySelectorAll(`meta[property="${property}"]`)).map(r => r.getAttribute('content'));
}

function parseBool(val, defaultValue = true) {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() !== 'false';
  return Boolean(val);
}

function readConfig() {
  const script = doc.querySelector('script[data-disgus]');

  return {
    relays: script?.getAttribute('data-relays')?.split(',').map(r => r.trim())
      || getMetaContents('nostr:relay')
      || ['wss://brb.io', 'wss://relay.nosphr.com'],
    pubkey: script?.getAttribute('data-pubkey')
      || getMetaContent('nostr:pubkey')
      || false,
    event_id: script?.getAttribute('data-event-id')
      || getMetaContent('nostr:event_id')
      || false,
    canonical: getMetaContent('og:url')
      || doc.querySelector('link[rel="canonical"]')?.href
      || doc.location.href,
    title: getMetaContent('og:title')
      || doc.title,
    share: parseBool(
      script?.getAttribute('data-share') ?? getMetaContent('nostr:share'),
      true
    ),
  };
}

function mountApp(domRoot, overrides = {}) {
  const config = {
    domRoot,
    ...readConfig(),
    ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => v != null)),
    ...win.disgusConfig,
  };
  config.share = parseBool(config.share, true);
  ReactDOM.createRoot(config.domRoot).render(
    <React.StrictMode>
      <App config={config} />
    </React.StrictMode>,
  );
}

// ---- Web Component ----
class DisgusComments extends HTMLElement {
  connectedCallback() {
    mountApp(this, {
      pubkey: this.getAttribute('pubkey') || undefined,
      relays: this.getAttribute('relays')?.split(',').map(r => r.trim()),
      event_id: this.getAttribute('event-id') || undefined,
      share: this.hasAttribute('share') ? parseBool(this.getAttribute('share')) : undefined,
    });
  }
}

customElements.define('disgus-comments', DisgusComments);

// ---- Legacy auto-init ----
const legacyRoot = doc.getElementById('disgus');
if (legacyRoot) {
  mountApp(legacyRoot);
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const win = window.top || window; // incase in iframe
const doc = win.document;

const defaultConfig = {
  title: doc.querySelector('meta[property="og:title"')?.getAttribute('content') || doc.title,
  rootId: 'disgus',
  image: doc.querySelector('meta[property="og:image"')?.getAttribute('content') ||
    'https://avatars.githubusercontent.com/u/137208',
  admin: doc.querySelector('meta[property="nostr:pubkey"]')?.getAttribute('content'),
  relay: doc.querySelector('meta[property="nostr:relay"]')?.getAttribute('content'),
  canonical: doc.querySelector('meta[property="og:url"')?.getAttribute('content') || doc.querySelector('link[rel="canonical"]')?.href || doc.location.href,
  nos2x: window.top.nostr || window.nostr || false
};

const config = {
  ...defaultConfig,
  ...win.disgusConfig // override config before calling script if you would like...
};

window.nostrRelay = config.relay;

ReactDOM.createRoot(doc.getElementById(config.rootId)).render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>,
)

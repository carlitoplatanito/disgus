import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const win = window.top || window; // incase in iframe
const doc = win.document;

const defaultConfig = {
  domRoot: doc.getElementById('disgus'),

  relays: Array.from(doc.querySelectorAll('meta[property="nostr:relay"]')).map((r) => r.getAttribute('content')) || ['wss://brb.io', 'wss://relay.nosphr.com'],
  // pubkey of the author, if none use a random
  pubkey: doc.querySelector('meta[property="nostr:pubkey"]')?.getAttribute('content') || false,

  // root event_id if you already know it, if not it will find it by canonical/pubkey pair
  event_id: doc.querySelector('meta[property="nostr:event_id"]')?.getAttribute('content') || false,

  // page properties (use OpenGraph where possible with page defaults as backup)
  canonical: doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || doc.querySelector('link[rel="canonical"]')?.href || doc.location.href,
  title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || doc.title,
  
  // description: doc.querySelector('meta[property="og:description"')?.getAttribute('content') || doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
  // image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
};

const config = {
  ...defaultConfig,
  ...win.disgusConfig // override config before calling script if you would like...
};

ReactDOM.createRoot(config.domRoot).render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>,
)

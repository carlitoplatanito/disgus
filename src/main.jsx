import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const doc = window.top?.document || window.document;

const config = {
  title: doc.title,
  image: doc.querySelector('meta[property="og:image"')?.getAttribute('content') ||
    doc.querySelector('meta[property="twitter:image"')?.getAttribute('content') ||
    'https://avatars.githubusercontent.com/u/137208',
  admin: doc.querySelector('meta[property="nostr:pubkey"]')?.getAttribute('content'),
  relay: doc.querySelector('meta[property="nostr:relay"]')?.getAttribute('content'),
  canonical: doc.querySelector('link[rel="canonical"]')?.href || doc.location.href,
  nos2x: window.top.nostr || window.nostr || false
};

window.nostrRelay = config.relay;

ReactDOM.createRoot(document.getElementById('comments')).render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>,
)

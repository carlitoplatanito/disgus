# 🤮 Disgus

![Workflow](https://github.com/carlitoplatanito/disgus/actions/workflows/main.yml/badge.svg)
![npm version](https://img.shields.io/npm/v/disgus.svg)

A commenting system for your blog or website based on
[Nostr](https://github.com/nostr-protocol/nostr) open protocol. It's like Disqus
but Nostier...

Demo available at https://carlitoplatanito.com/demo

## Requirements

Must have a Nostr `pubkey` and `relay`.

NIP07 compatible browser plug-in for login.

## Usage

### Web Component (recommended)

Place a `<disgus-comments>` element where you want comments to appear:

```html
<disgus-comments
  pubkey="YOUR_NOSTR_PUBKEY"
  relays="wss://relay1.com,wss://relay2.com"
></disgus-comments>

<script src="https://unpkg.com/disgus" data-disgus></script>
```

No separate CSS file needed -- styles are bundled inline.

### Single script tag (with data attributes)

Or use a script tag with `data-disgus` and `data-*` attributes. No meta tags
needed:

```html
<div id="disgus"></div>

<script
  src="https://unpkg.com/disgus"
  data-disgus
  data-pubkey="YOUR_NOSTR_PUBKEY"
  data-relays="wss://relay1.com,wss://relay2.com"
>
</script>
```

### Legacy (meta tags)

Still works with `<meta>` tags for sites that prefer declarative config in the
`<head>`:

```html
<meta property="nostr:pubkey" content="YOUR_NOSTR_PUB_KEY" />
<meta property="nostr:relay" content="wss://relay1.com" />
<meta property="nostr:relay" content="wss://relay2.com" />

<div id="disgus"></div>

<script src="https://unpkg.com/disgus"></script>
```

Config priority: Web Component attributes > `data-*` attributes > meta tags >
defaults.

## How it works

Every page/author gets a Nostr note/event created by a random user when posting
the first response.

This event becomes the 'root' note for all the other responses in the thread.

Offers NIP-07 for login or just type a name to post as a **Rando** (non-NIP05
verified temp guest account).

> If you have the same relays set on Damus or whatever other Nostr client you
> will be able to see replies, etc. The 'author' user will get alerts as they
> are tagged in the root post as well.

## Configuration

| Option             | Web Component attr                             | data-* attr     | Meta tag                 |
| ------------------ | ---------------------------------------------- | --------------- | ------------------------ |
| Pubkey             | `pubkey`                                       | `data-pubkey`   | `nostr:pubkey`           |
| Relays (comma-sep) | `relays`                                       | `data-relays`   | `nostr:relay` (multiple) |
| Event ID           | `event-id`                                     | `data-event-id` | `nostr:event_id`         |
| Canonical URL      | Auto (og:url / link[rel=canonical] / location) |                 | `og:url`                 |
| Title              | Auto (og:title / document.title)               |                 | `og:title`               |
| Share Button       | `share` ("true"/"false")                       | `data-share`    | `nostr:share`            |

## Development

```sh
npm start       # Vite dev server with HMR
npm run build     # Build for production
npm run preview   # Serve the built demo via HTTP (open http://localhost:4173)
```

The demo page at `/dist/index.html` uses the built `<disgus-comments>` web
component and works from `file://` or any HTTP server.

## Work In Progress

More features coming -- open a ticket, pull request or hit me on Nostr
(_@carlitoplatanito.com)

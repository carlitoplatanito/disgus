# 🤮 Disgus

A commenting system for your blog or website based on [Nostr](https://github.com/nostr-protocol/nostr) open protocol. It's like Disqus but Nostier...

## Requirements

Must have a Nostr `pubkey` and `relay`.

NIP07 compatible browser plug-in for login and admistration.

## Usage

Add the following code to the head of your page.

```html
<!-- SHOULD provide a canonical URL -->
<link rel="canonical" href="https://your-website.com/blog-post" />
<meta property="nostr:pubkey" content="YOUR_NOSTR_PUB_KEY" />
<meta property="nostr:relay" content="YOUR_NOSTR_RELAY" />

<!-- CAN provide the exact event_id for the channel to avoid ambuigity -->
<meta property="nostr:channel" content="LEAVE_EMPTY_IF_NONE" />
```

Add the following where you would like the comments to load up in the body of your page.

```html
<div id="comments"></div>
<script type="javascript" src="https://unpkg.com/disgus/dist/.js" async></script>
```

## How it works

Every page/author gets a channel created on the relay specified in the header. The comments are simply the messages inside of the channel.

Any Nostr client should be able to join and communicate in the channel outside of the website as well.

By default the page title is set at the `name` of the channel, the canonical URL is set as the `about` and image used as the `picture`. (Considering just using the page icon as well)

## Todo

- [] Anonymous posting
- [] Reacting to comments & channel/page
- [] Admistrative functions (mute message and/or user)


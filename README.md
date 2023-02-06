# 🤮 Disgus

A commenting system for your blog or website based on [Nostr](https://github.com/nostr-protocol/nostr) open protocol. It's like Disqus but Nostier...

Demo available at https://carlitoplatanito.com/demo

## Requirements

Must have a Nostr `pubkey` and `relay`.

NIP07 compatible browser plug-in for login.

## Usage

The script will grab the title & URL from the meta of the page.

Define the authors `pubkey` using the `nostr:pubkey` property and relays as `nostr:relay`.


```html
<title>YOUR SITE TITLE</title>

<!-- IF NO CANONICAL IS PROVIDED IT WILL USE THE WEBSITE URL -->
<link rel="canonical" href="https://your-website.com/blog-post" />

<!-- PROVIDE the pubkey so it can be tagged for responses/alerts -->
<meta property="nostr:pubkey" content="YOUR_NOSTR_PUB_KEY" />

<!-- CAN provide multiple relays -->
<meta property="nostr:relay" content="OPTIONAL_NOSTR_RELAY" />
<meta property="nostr:relay" content="OPTIONAL_NOSTR_RELAY" />
<!-- CAN provide the exact event_id for the root event to avoid ambuigity -->
<meta property="nostr:event_id" content="OPTIONAL_IF_NONE_IT_WILL_CREATE_OR_FIND_IT" />

<!-- MUST PROVIDE CSS -->
<link rel="stylesheet" href="https://unpkg.com/disgus/dist/style.css">
```

Add the following where you would like the comments to load up in the body of your page.

```html
<!-- div with the ID disgus where you would like to display the comments & form -->
<div id="disgus"></div>

<!-- this can go at the end of the body -->
<script type="module" src="https://unpkg.com/disgus/dist/index.js" async></script>
```

## How it works

Every page/author gets a Nostr note/event created by a random user when posting the first response.

This event becomes the 'root' note for all the other responses in the thread.

Offers NIP-07 for login or just type a name to post as a **Rando** (non-NIP05 veriefied temp guest like account).

> If you have the same relays set on Damus or whatever other Nostr client you will be able to see replies, etc. The 'author' user will get alerts as they are tagged in the root post as well.

## Work In Progress

Lot's of ideas and features coming to this but feel free to open a ticket, pull request or hit me on Nostr (_@carlitoplatanito.com)

import { SimplePool, finalizeEvent, getEventHash, generateSecretKey, getPublicKey } from 'nostr-tools';
import { hexToBytes, bytesToHex } from 'nostr-passkey';

export const getComments = (config, rootEvent, force) => new Promise((resolve) => {
  const { relays } = config;
  const pool = new SimplePool();
  let comments = [];
  let since = 0;
  let cached = {};
  let returned = false;
  const commentsCacheKey = `c:${rootEvent.id}`;

  if (localStorage.getItem(commentsCacheKey)) {
    try {
      cached = JSON.parse(localStorage.getItem(commentsCacheKey));
      if (cached?.comments) {
        comments = cached.comments;
        if (comments && !force) {
          resolve(comments);
          return;
        }
        since = force ? 0 : (cached.updated_at || 0);
      }
    } catch (e) {
      /* ignore invalid JSON */
    }
  }

  const queriedIds = new Set([rootEvent.id]);
  // Use Set for O(1) comment ID tracking to eliminate O(N) Array.prototype.some scans during event streaming
  const commentIds = new Set();
  if (comments && comments.length > 0) {
    comments.forEach((c) => {
      if (c && c.id) {
        queriedIds.add(c.id);
        commentIds.add(c.id);
      }
    });
  }

  const fetchPass = (idsToQuery) => {
    let newEventsFound = 0;
    const sub = pool.subscribe(relays, {
      limit: 500,
      kinds: [1],
      since,
      '#e': Array.from(idsToQuery)
    }, {
      onevent(event) {
        // O(1) Set lookup prevents duplicate insertion and eliminates O(N²) quadratic overhead as events stream
        if (event && event.id && !commentIds.has(event.id)) {
          commentIds.add(event.id);
          comments.push(event);
          newEventsFound++;
        }
        if (event && event.id && !localStorage.getItem(`e:${event.id}`)) {
          localStorage.setItem(`e:${event.id}`, JSON.stringify(event));
        }
      },
      oneose() {
        try { sub.close(); } catch (e) { /* ignore */ }

        // Check if any newly discovered comments have IDs that haven't been queried yet
        const unqueriedIds = new Set();
        comments.forEach((c) => {
          if (c && c.id && !queriedIds.has(c.id)) {
            unqueriedIds.add(c.id);
            queriedIds.add(c.id);
          }
        });

        if (unqueriedIds.size > 0 && newEventsFound > 0) {
          fetchPass(unqueriedIds);
        } else {
          if (returned) return;

          // Comments are already deduplicated in O(1) upon receipt, avoiding O(N²) filter + findIndex scan on EOSE
          const now = Math.floor(Date.now() / 1000);

          localStorage.setItem(commentsCacheKey, JSON.stringify({
            ...cached,
            updated_at: now,
            comments: comments
          }));
          cached.updated_at = now;
          resolve(comments);
          returned = true;

          try { pool.close(relays); } catch (e) { /* ignore */ }
        }
      }
    });
  };

  fetchPass(queriedIds);
});

export const getPubkey = (pubkey, relays) => new Promise((resolve) => {
  let user = { pubkey, created_at: 0 };
  let returned = false;

  if (localStorage.getItem(`p:${pubkey}`)) {
    user = JSON.parse(localStorage.getItem(`p:${pubkey}`));
    if (user.created_at > 0) {
      resolve(user);
      return;
    }
  }

  const pool = new SimplePool();
  const sub = pool.subscribe(relays, {
    kinds: [0],
    authors: [pubkey]
  }, {
    onevent(_event) {
      if (returned) return;
      if (!user.created_at || _event.created_at > user.created_at) {
        try {
          user = {
            ...user,
            ...JSON.parse(_event.content),
            created_at: _event.created_at
          };
          localStorage.setItem(`p:${pubkey}`, JSON.stringify(user));
          resolve(user);
          returned = true;
        } catch (e) {
          // invalid JSON content
        }
      }
    },
    oneose() {
      try { sub.close(); } catch (e) { /* ignore */ }
      try { pool.close(relays); } catch (e) { /* ignore */ }
    }
  });
});

export const createRootEvent = (config) => new Promise((resolve) => {
  const { pubkey, title, description, canonical, relays } = config;
  const tags = [];
  let content = title || '';

  if (pubkey) {
    tags.push(['p', pubkey]);
    content += ` by #[${tags.length - 1}]`;
  }

  if (description) {
    content += `\n${description}`;
  }

  content += `\nMore: ${canonical}\n\nComments powered by Disgus`;

  tags.push(['r', canonical]);
  tags.push(['client', 'Disgus']);

  const secretKey = generateSecretKey();
  const signedEvent = finalizeEvent({
    kind: 1,
    content,
    tags,
    created_at: Math.floor(Date.now() / 1000),
  }, secretKey);

  const user = { pubkey: getPublicKey(secretKey), privateKey: bytesToHex(secretKey) };

  postComment(signedEvent, user, relays).then((_event) => {
    localStorage.setItem(`r:${canonical}`, JSON.stringify(_event));
    resolve(_event);
  });
});

export const getRootEvent = (config) => new Promise((resolve) => {
  const { pubkey, canonical, relays, event_id } = config;
  let returned = false;

  if (event_id && localStorage.getItem(`e:${event_id}`)) {
    try {
      const cached = JSON.parse(localStorage.getItem(`e:${event_id}`));
      if (cached && cached.id && Array.isArray(cached.tags)) {
        localStorage.setItem(`r:${canonical}`, JSON.stringify(cached));
        resolve(cached);
        return;
      } else {
        localStorage.removeItem(`e:${event_id}`);
      }
    } catch (e) {
      localStorage.removeItem(`e:${event_id}`);
    }
  }

  if (localStorage.getItem(`r:${canonical}`)) {
    try {
      const cached = JSON.parse(localStorage.getItem(`r:${canonical}`));
      if (cached && cached.id && Array.isArray(cached.tags)) {
        resolve(cached);
        return;
      } else {
        localStorage.removeItem(`r:${canonical}`);
      }
    } catch (e) {
      localStorage.removeItem(`r:${canonical}`);
    }
  }

  const pool = new SimplePool();
  let sub;

  if (event_id) {
    sub = pool.subscribe(relays, { ids: [event_id], kinds: [1], limit: 1 }, {
      onevent(event) {
        if (returned) return;
        localStorage.setItem(`e:${event_id}`, JSON.stringify(event));
        localStorage.setItem(`r:${canonical}`, JSON.stringify(event));
        resolve(event);
        returned = true;
      },
      oneose() {
        try { sub.close(); } catch (e) { /* ignore */ }
        try { pool.close(relays); } catch (e) { /* ignore */ }
      }
    });
    return;
  }

  const filter = { '#r': [canonical] };
  if (pubkey) {
    filter['#p'] = [pubkey];
  }

  sub = pool.subscribe(relays, { limit: 1, kinds: [1], ...filter }, {
    onevent(event) {
      if (returned) return;
      localStorage.setItem(`r:${canonical}`, JSON.stringify(event));
      resolve(event);
      returned = true;
    },
    oneose() {
      try { sub.close(); } catch (e) { /* ignore */ }
      try { pool.close(relays); } catch (e) { /* ignore */ }
    }
  });
});

export const postComment = (event, user, relays) => new Promise((resolve) => {
  const pool = new SimplePool();
  const now = Math.floor(Date.now() / 1000);
  let returned = false;
  let signedEvent;

  (async () => {
    if (user?.signer) {
      signedEvent = await user.signer.signEvent({
        kind: 1,
        content: event.content,
        tags: event.tags,
        created_at: now,
      });
    } else if (user?.privateKey) {
      signedEvent = finalizeEvent({
        kind: 1,
        content: event.content,
        tags: event.tags,
        created_at: now,
      }, hexToBytes(user.privateKey));
    } else if (window.nostr) {
      event.kind = 1;
      event.created_at = now;
      event.id = getEventHash(event);
      const { sig } = await window.nostr.signEvent(event);
      event.sig = sig;
      signedEvent = event;
    } else {
      alert('No signing method available. Install a NIP-07 extension or use a passkey.');
      return;
    }

    const pubs = pool.publish(relays, signedEvent);
    pubs.forEach((p) => {
      p.then(() => {
        if (!returned) {
          resolve(signedEvent);
          returned = true;
        }
      }).catch((err) => {
        console.log(err);
      });
    });
  })();
});

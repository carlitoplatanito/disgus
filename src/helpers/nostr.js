import {relayInit, getEventHash, getBlankEvent, generatePrivateKey, getPublicKey, signEvent} from 'nostr-tools';

export const initPool = (relays) => {
  const pool = relays.map((relay) => relayInit(relay));

  return pool;
};

export const getComments = (config, rootEvent) => new Promise((resolve, reject) => {
  const { relays } = config;
  const pool = initPool(relays);
  let comments = [];
  let since = 0;

  if (localStorage.getItem(`e:${rootEvent.id}`)) {
    const cached = JSON.parse(localStorage.getItem(`e:${rootEvent.id}`));

    comments = cached.comments;
    resolve(comments);
    since = cached.updated_at;
    const now = Math.floor(new Date().getTime() / 1000);
    // return;
  }

  pool.map(async (conn) => {
    await conn.connect()
      
    const sub = conn.sub([
      {
        limit: 100,
        kinds: [1],
        since,
        '#e': [ rootEvent.id ]
      }
    ]);

    sub.on('event', (event) => {
      if (event.content) {
        comments.push(event);
      }
    });

    sub.on('eose', () => {
      // remove dupes
      comments = comments.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.id === value.id
        ))
      );
      resolve(comments);
      
      const now = Math.floor(new Date().getTime() / 1000);

      localStorage.setItem(`e:${rootEvent.id}`, JSON.stringify({
          last_updated: now,
          comments
      }));

      sub.unsub();
      conn.close();
    });
  })
});

export const getUser = (pubkey, relays) => new Promise((resolve, reject) => {
  if (localStorage.getItem(`p:${pubkey}`)) {
      resolve(JSON.parse(localStorage.getItem(`p:${pubkey}`)));
      return;
  }

  const pool = initPool(relays);

  pool.map(async (conn) => {
    await conn.connect();
    const sub = conn.sub([
      {
        limit: 1,
        kinds: [0],
        authors: [ pubkey ]
      }
    ]);

    sub.on('event', (event) => {
      localStorage.setItem(`p:${pubkey}`, event.content);
      resolve(JSON.parse(event.content));
    });

    sub.on('eose', () => {
      sub.unsub();
      conn.close();
    });
  });
});

export const createRootEvent = (config, user) => new Promise((resolve, reject) => {
  const { pubkey, title, description, canonical, relays } = config;
  const tags = [];
  let content = title;

  if (pubkey) {
    tags.push(['p', pubkey]);
    content += ` by #[${tags.length - 1}]`;
  }

  if (description) {
    content += `\n${description}`;
  }
  
  content += `\n\n${canonical}\nThoughts?`;

  tags.push(['r', canonical]);
  tags.push(['client', 'Disgus']);
  const event = {
    content,
    tags
  };

  if (pubkey && user.pubkey === pubkey) {
    event.pubkey = pubkey;
    postComment(event, false, relay).then((ev) => {
      resolve(ev);
    });
  } else {
    const randomPrivate = generatePrivateKey();
    const randomPubkey = getPublicKey(randomPrivate);

    event.pubkey = randomPubkey;
    postComment(event, randomPrivate, relays).then((ev) => {
      resolve(ev);
    });
  }
});

export const getRootEvent = (config) => new Promise(async (resolve, reject) => {
  const { pubkey, canonical, relays } = config;
  const pool = initPool(relays);

  if (localStorage.getItem(`r:${canonical}`)) {
    resolve(JSON.parse(localStorage.getItem(`r:${canonical}`)));
    return;
  }

  const filter = { '#r': [ canonical ] };

  if (pubkey) {
    filter['#p'] = [ pubkey ];
  }

  const found = 0;

  pool.map(async (conn, i) => {
    await conn.connect();
  
    const sub = conn.sub([
      {
        limit: 1,
        kinds: [1],
        ...filter
      }
    ]);

    sub.on('event', (event) => {
      localStorage.setItem(`r:${canonical}`, JSON.stringify(event));
      resolve(event);
      found++;
    });

    sub.on('eose', () => {
      sub.unsub();
      conn.close();

      if (found <= 0 && i >= pool.length) {
        reject();
      }
    });
  });
});

export const postComment = (event, privateKey, relays) => new Promise(async(resolve, reject) => {
  const pool = initPool(relays);

  event.kind = 1;
  event.created_at = Math.floor(Date.now() / 1000);
  event.id = getEventHash(event);

  if (privateKey) {
    event.pubkey = getPublicKey(privateKey);
    event.sig = signEvent(event, privateKey);

    pool.map(async (conn) => {
      await conn.connect();
      const publisher = conn.publish(event);

      publisher.on('seen', (e) => {
        resolve(e);
      })

      publisher.on('failed', () => {
        console.error(conn, event);
        reject();
      })
    });
  } else if (window.nostr) {
    window.nostr.signEvent(event).then((signedEvent) => {
      pool.map(async (conn) => {
        await conn.connect();
        const publisher = conn.publish(signedEvent);

        publisher.on('seen', (e) => {
          resolve(e);
        });

        publisher.on('failed', () => {
          reject(signedEvent);
        });
      });
    });
  }
});

export const createGuest = (name, relays) => new Promise((resolve, reject) => {
  const pool = initPool(relays);
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);
  const guestProfile = {
    name,
    about: 'Random User from Disgus'
  };

  const event = getBlankEvent();

  event.kind = 0;
  event.pubkey = publicKey;
  event.content = JSON.stringify(guestProfile);
  event.tags = [['client', 'Disgus']];
  event.created_at = Math.floor(Date.now() / 1000);
  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  pool.map(async (conn) => {
    await conn.connect();
    const publisher = conn.publish(event);

    publisher.on('seen', () => {
      localStorage.setItem('user', JSON.stringify({
        pubkey: publicKey,
        privateKey: privateKey,
        ...guestProfile,
        created_at: event.created_at
      }));
      conn.close();
      resolve({
        pubkey: publicKey,
        privateKey: privateKey,
        created_at: event.createdAt,
        ...guestProfile
      });
    });

    publisher.on('failed', () => {
      conn.close();
      reject('There was an error');
    });
  });
});

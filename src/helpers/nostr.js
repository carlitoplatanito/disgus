import {relayInit, getEventHash, getBlankEvent, generatePrivateKey, getPublicKey, signEvent} from 'nostr-tools';

export const getComments = (canonical, relay) => new Promise((resolve, reject) => {
  const pool = relay.map((r)=>relayInit(r));
  let messages = [];
  let since = 0;

  if (localStorage.getItem(`r:${canonical}`)) {
    const cachedComments = JSON.parse(localStorage.getItem(`r:${canonical}`));

    messages = cachedComments.messages;
    since = cachedComments.updated_at;
  }

  pool.map((conn, i) => {
    conn.connect()
      .then(() => {
        const sub = conn.sub([
          {
            limit: 100,
            kinds: [1],
            since,
            '#r': [ canonical ]
          }
        ]);

        sub.on('event', (event) => {
          if (event.content) {
            messages.push(event);
          }
        });

        sub.on('eose', () => {
          messages = messages.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.id === value.id
            ))
          );
          const now = Math.floor(new Date().getTime() / 1000);

          localStorage.setItem(`r:${canonical}`, JSON.stringify({
              last_updated: now,
              messages
          }));
          resolve(messages);
          sub.unsub();
          conn.close();
        });
      })
      .catch(reject);
  });
});

export const getUser = (pubkey, relay = window.nostrRelay) => new Promise((resolve, reject) => {
  const localUser = localStorage.getItem(`u:${pubkey}`) ? JSON.parse(localStorage.getItem(`u:${pubkey}`)) : false;

  if (localUser && localUser.created_at > 0) {
      resolve(localUser);
      return;
  }

  const pool = relay.map((r) => relayInit(r));
  let metadata = {
    pubkey,
    created_at: 0
  };

  pool.map((conn) => {
    conn.connect()
      .then(() => {
          const sub = conn.sub([
            {
                kinds: [0],
                authors: [ pubkey ]
            }
          ]);

          sub.on('event', (event) => {
              if (event.created_at > metadata.created_at) {
                  metadata = {
                      ...metadata,
                      ...JSON.parse(event.content),
                      created_at: event.created_at
                  };
              }
          });

          sub.on('eose', () => {
              localStorage.setItem(`u:${pubkey}`, JSON.stringify(metadata));
              resolve(metadata);
              sub.unsub();
              conn.close();
          });
      })
      .catch(reject);
    });
});

export const postComment = (event, privateKey, relay) => new Promise((resolve, reject) => {
  const pool = relay.map((r) => relayInit(r));

  event.kind = 1;
  event.created_at = Math.floor(Date.now() / 1000);
  event.id = getEventHash(event);

  if (privateKey) {
    event.sig = signEvent(event, privateKey);

    pool.map((conn) => {
      conn.connect()
      .then(() => {
        const publisher = conn.publish(event);

        publisher.on('seen', (e) => {
          resolve(e);
          conn.close();
        })

        publisher.on('failed', () => {
          console.error(conn, signedEvent);
          reject();
          conn.close();
        })
      });
    });
  } else if (window.nostr) {
    window.nostr.signEvent(event).then((signedEvent) => {
      pool.map((conn) => {
        conn.connect()
        .then(() => {
          const publisher = conn.publish(signedEvent);

          publisher.on('seen', (e) => {
            resolve(e);
            conn.close();
          })

          publisher.on('failed', () => {
            reject(signedEvent);
            conn.close();
          })
        });
      });
    });
  }
});

export const createGuest = (name, relay = window.nostrRelay) => new Promise((resolve, reject) => {
  const pool = relay.map((r) => relayInit(r));
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);
  const guestProfile = {
    name,
    about: 'Random User',
    picture: 'https://i.pravatar.cc/300'
  };

  const event = getBlankEvent();

  event.kind = 0;
  event.pubkey = publicKey;
  event.content = JSON.stringify(guestProfile);
  event.tags = [['client', 'Disgus']];
  event.created_at = Math.floor(Date.now() / 1000);
  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  pool.map((conn) => {
    conn.connect().then(() => {
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
});

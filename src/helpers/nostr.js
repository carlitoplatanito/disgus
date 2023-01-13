import {relayInit, getEventHash, getBlankEvent, generatePrivateKey, getPublicKey, signEvent} from 'nostr-tools';

export function getChannels(pubkey, relay = window.nostrRelay) {
    return new Promise((resolve, reject) => {
        if (sessionStorage.getItem(`channels.${pubkey}`)) {
            resolve(JSON.parse(sessionStorage.getItem(`channels.${pubkey}`)))
            return;
        }

        const pool = relayInit(relay);
        const channels = [];
    
        pool.connect().then(() => {
            let sub = pool.sub([
                {
                kinds: [40],
                authors: [pubkey],
                // '#e': [id]
                }
            ]);
        
            sub.on('event', (event) => {
              channels.push(event);
            });
        
            sub.on('eose', () => {
                sessionStorage.setItem(`channels.${pubkey}`, JSON.stringify(channels))
                resolve(channels);
                sub.unsub();
                pool.close();
            });
        })
        .catch(reject)
    });
}

export const getChannel = (event_id, relay = window.nostrRelay) => new Promise((resolve, reject) => {
  const relay = relayInit(relay);
  const channel = {
    created_at: 0
  };

  if (localStorage.getItem(event_id)) {
    resolve(JSON.parse(localStorage.getItem(event_id)));
    return;
  }

  relay.connect().then(() => {
    let sub = relay.sub([
      {
        kinds: [40],
        ids: [event_id],
        // '#e': [id]
      }
    ]);

    sub.on('event', (event) => {
      if (event.created_at > channel.created_at) {
        const content = JSON.parse(event.content);

        channel = {
          ...content,
          id: event_id,
          pubkey: event.pubkey,
          created_at: event.created_at
        };
      }
    });

    sub.on('eose', () => {
      localStorage.setItem(event_id, channel);
      resolve(channel);
      sub.unsub();
      relay.close();
    });
  })
  .catch(reject)
});

export const getComments = (channel_id, relay) => new Promise((resolve, reject) => {
  const pool = relayInit(relay);
  let messages = [];
  let since = 0;

  if (localStorage.getItem(`channel.${channel_id}`)) {
    const cachedChannel = JSON.parse(localStorage.getItem(`channel.${channel_id}`));

    messages = cachedChannel.messages;
    since = cachedChannel.updated_at;
  }

  pool.connect()
    .then(() => {
      const sub = pool.sub([
        {
          limit: 100,
          kinds: [42, 43, 44],
          since,
          '#e': [ channel_id ]
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

        localStorage.setItem(`channel.${channel_id}`, JSON.stringify({
            last_updated: now,
            messages
        }));
        resolve(messages);
        sub.unsub();
        pool.close();
      });
    })
    .catch(reject);
});

export const getUser = (pubkey, relay = window.nostrRelay) => new Promise((resolve, reject) => {
    const localUser = localStorage.getItem(pubkey) ? JSON.parse(localStorage.getItem(pubkey)) : false;

    if (localUser) {
        resolve(localUser);
        return;
    }

    const pool = relayInit(relay);
    let metadata = {
        created_at: 0
    };

    pool.connect()
        .then(() => {
            const sub = pool.sub([
            {
                limit: 2,
                kinds: [0],
                authors: [ pubkey ]
            }
            ]);

            sub.on('event', (event) => {
                console.log(event.kind, event.content, event);
                if (event.created_at > metadata.created_at) {
                    metadata = {
                        ...metadata,
                        ...JSON.parse(event.content),
                        pubkey,
                        created_at: event.created_at
                    };
                }
            });

            sub.on('eose', () => {
                localStorage.setItem(pubkey, JSON.stringify(metadata));
                resolve(metadata);
                sub.unsub();
                pool.close();
            });
        })
        .catch(reject);
});

export const postComment = (data, relay) => new Promise((resolve, reject) => {
  const event = getBlankEvent();
  const pool = relayInit(relay);
  const nos2x = window.top.nostr || window.nostr || false;

  event.kind = 42;
  event.tags = [['e', data.channel.id, relay]];
  event.content = data.comment;
  event.pubkey = data.user.pubkey;
  event.created_at = Math.floor(Date.now() / 1000);
  event.id = getEventHash(event);

  if (data.user.privateKey) {
    event.sig = signEvent(event, data.user.privateKey);

    pool.connect()
      .then(() => {
        const publisher = pool.publish(event);

        publisher.on('seen', (e) => {
          resolve(e);
          pool.close();
        })

        publisher.on('failed', () => {
          reject(signedEvent);
          pool.close();
        })
      });
  } else if (nos2x) {
    nos2x.signEvent(event).then((signedEvent) => {
      console.log(signedEvent);
      pool.connect()
        .then(() => {
          const publisher = pool.publish(signedEvent);

          publisher.on('seen', (e) => {
            resolve(e);
            pool.close();
          })

          publisher.on('failed', () => {
            reject(signedEvent);
            pool.close();
          })
        });
      });
  }
});

export const createGuest = (name, relay = window.nostrRelay) => new Promise((resolve, reject) => {
  const pool = relayInit(relay);
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);
  const guestProfile = {
    name,
    about: 'Disgus Guest Account',
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

  pool.connect().then(() => {
    const publisher = pool.publish(event);

    publisher.on('seen', () => {
      localStorage.setItem('user', JSON.stringify({
        pubkey: publicKey,
        privateKey: privateKey,
        ...guestProfile,
        created_at: event.created_at
      }))
      pool.close();
      resolve({
        pubkey: publicKey,
        privateKey: privateKey,
        created_at: event.createdAt,
        ...guestProfile
      });
    });

    publisher.on('failed', () => {
      pool.close();
      reject('There was an error');
    });
  });
});

export const createChannel = (data, relay = window.nostrRelay) => new Promise((resolve, reject) => {
  const event = getBlankEvent();
  const pool = relayInit(relay);

  event.kind = 40;
  event.tags = [
      // ['e', event.id, relay],
      ['client', 'Disgus']
  ];
  event.content = JSON.stringify(data.channel);
  event.created_at = Math.floor(Date.now() / 1000);
  event.pubkey = data.user.pubkey;
  event.id = getEventHash(event);
  
  if (!data.user.privateKey && window.top.nostr) {
    window.top.nostr.signEvent(event).then((signedEvent) => {
      pool.connect()
        .then(() => {
          const publisher = pool.publish(signedEvent);

          publisher.on('seen', () => {
            pool.close();
            resolve({
              ...data.channel,
              created_at: event.created_at,
              pubkey: event.pubkey,
              id: event.id
            });
          })

          publisher.on('failed', () => {
            pool.close();
            reject('There was an error');
          })
        });
      });
  } else if (data.user.privateKey && localStorage.getItem('pubkey')) {
    event.sig = signEvent(event, data.user.privateKey);

    pool.connect().then(() => {
      const publisher = pool.publish(event);

      publisher.on('seen', () => {
        pool.close();
        resolve({
          ...data.channel,
          created_at: event.created_at,
          pubkey: event.pubkey,
          id: event.id
        });
      });

      publisher.on('failed', () => {
        pool.close();
        reject('There was an error');
      });
    });
  }
});

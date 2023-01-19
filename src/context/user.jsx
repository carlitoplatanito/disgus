import React, { useEffect, useState, useContext } from 'react';
import { relayInit, getEventHash, getBlankEvent, generatePrivateKey, getPublicKey, signEvent } from 'nostr-tools';
import { initPool, getPubkey } from '../helpers/nostr';
import { RootContext } from './root';

const cacheKey = 'disgusUser';

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
    const { config } = useContext(RootContext);
    const [user, setUser] = useState(false);
    
    useEffect(() => {
        if (!user && localStorage.getItem(cacheKey)) {
            const localUser = JSON.parse(localStorage.getItem(cacheKey));

            // return what we have saved
            setUser(localUser);
            // but check for updates
            getPubkey(localUser.pubkey, config.relays).then((_user) => setUser({ ...localUser, ..._user }));
        }
    }, [!user]);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;

export function useUser() {
    const { config } = useContext(RootContext);
    const { relays } = config;
    const { user, setUser } = useContext(UserContext);

    const signIn = () => {
        if (user) {
            return;
        }
    
        if (window.nostr) {
            window.nostr.getPublicKey().then((pubkey) => {
                getPubkey(pubkey, relays).then((_user) => {
                    localStorage.setItem(cacheKey, JSON.stringify(_user));
                    setUser(_user);
                });
            });
        } else {
            const privateKey = prompt('Enter your private key', '');
            const pubkey = getPublicKey(privateKey);

            if (pubkey) {
                getPubkey(publicKey, relays).then((_user) => {
                    localStorage.setItem(cacheKey, JSON.stringify(_user));
                    setUser({
                        ...privateKey,
                        _user
                    });
                });
            }
        }
    }

    const signInGuest = (name) => {
        if (user) {
            return;
        }

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

        const pool = initPool(relays);
        pool.map(async (conn) => {
            await conn.connect();
            const publisher = conn.publish(event);

            publisher.on('seen', () => {
                if (!user) {
                    localStorage.setItem(cacheKey, JSON.stringify({
                        pubkey: publicKey,
                        privateKey: privateKey,
                        created_at: event.created_at,
                        ...guestProfile
                    }));
                    setUser({
                        pubkey: publicKey,
                        privateKey: privateKey,
                        created_at: event.created_at,
                        ...guestProfile
                    });
                }
                conn.close();
            });

            publisher.on('failed', () => {
                conn.close();
            });
        });
    }

    const signOut = () => {
        localStorage.removeItem(cacheKey);
        setUser(false);
    }

    return { user, signIn, signOut, signInGuest };
}
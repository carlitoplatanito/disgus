import React, { useEffect, useState, useContext, useMemo } from 'react';
import { getPublicKey } from 'nostr-tools/pure';
import { SimplePool, finalizeEvent, generateSecretKey, getEventHash } from 'nostr-tools';
import {
  hasStoredPasskeyIdentity,
  unlockPasskeyIdentity,
  registerPasskeyIdentity,
  importPasskeyIdentityFromNsec,
  buildPasskeySignerShim,
  getStoredPasskeyPubkey,
  exportPasskeyIdentityAsNsec,
  bytesToHex,
} from 'nostr-passkey';
import { hexToBytes } from 'nostr-passkey';
import { getPubkey } from '../helpers/nostr';
import { RootContext } from './root';

const cacheKey = 'disgusUser';

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
    const { config } = useContext(RootContext);
    const [user, setUser] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            const stored = localStorage.getItem(cacheKey);
            return stored ? JSON.parse(stored) : false;
        } catch (e) {
            return false;
        }
    });
    const [passkeyAvailable, setPasskeyAvailable] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            return hasStoredPasskeyIdentity();
        } catch (e) {
            return false;
        }
    });

    // Synchronously initialize state from localStorage to avoid extra mount re-renders and layout flashes.
    // Scope dependencies strictly to user.pubkey and relays to prevent redundant effect executions.
    useEffect(() => {
        let isMounted = true;
        if (user?.pubkey && config?.relays) {
            getPubkey(user.pubkey, config.relays).then((_user) => {
                if (isMounted && _user) {
                    setUser((prev) => (prev ? { ...prev, ..._user } : _user));
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [user?.pubkey, config?.relays]);

    const contextValue = useMemo(() => ({
        user, setUser, passkeyAvailable, setPasskeyAvailable
    }), [user, passkeyAvailable]);

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;

export function useUser() {
    const { config } = useContext(RootContext);
    const { relays } = config;
    const { user, setUser, passkeyAvailable, setPasskeyAvailable } = useContext(UserContext);

    const finishSignIn = (_user) => {
        localStorage.setItem(cacheKey, JSON.stringify({ pubkey: _user.pubkey }));
        getPubkey(_user.pubkey, relays).then((profile) => {
            const merged = { ..._user, ...profile, pubkey: _user.pubkey };
            localStorage.setItem(cacheKey, JSON.stringify(merged));
            setUser(merged);
        });
    };

    const signInExtension = () => {
        if (user || !window.nostr) return;
        window.nostr.getPublicKey().then((pubkey) => finishSignIn({ pubkey }));
    };

    const signInWithKey = () => {
        if (user) return;
        const privateKey = prompt('Enter your private key (hex):', '');
        if (!privateKey) return;
        const pubkey = getPublicKey(hexToBytes(privateKey));
        if (pubkey) {
            finishSignIn({ pubkey, privateKey });
        } else {
            alert('Incorrect key.');
        }
    };

    const signInPasskey = async () => {
        if (user) return;

        try {
            let result;
            if (hasStoredPasskeyIdentity()) {
                result = await unlockPasskeyIdentity();
            } else {
                result = await registerPasskeyIdentity();
            }

            const signer = buildPasskeySignerShim(result.secretKey);
            const _user = { pubkey: result.pubkey, signer };
            localStorage.setItem(cacheKey, JSON.stringify({ pubkey: result.pubkey }));

            getPubkey(result.pubkey, relays).then((profile) => {
                setUser({ ..._user, ...profile });
            });
        } catch (err) {
            console.log('Passkey error:', err);
        }
    };

    const importPasskeyFromNsec = async () => {
        if (user) return;

        const nsec = prompt('Enter your nsec (nsec1... or hex private key):', '');
        if (!nsec) return;

        try {
            const result = await importPasskeyIdentityFromNsec(nsec);
            const signer = buildPasskeySignerShim(result.secretKey);
            const _user = { pubkey: result.pubkey, signer };
            localStorage.setItem(cacheKey, JSON.stringify({ pubkey: result.pubkey }));

            getPubkey(result.pubkey, relays).then((profile) => {
                setPasskeyAvailable(true);
                setUser({ ..._user, ...profile });
            });
        } catch (err) {
            alert('Failed to import passkey: ' + err.message);
        }
    };

    const exportPasskeyNsec = async () => {
        if (!user?.signer) return;

        try {
            const nsec = await exportPasskeyIdentityAsNsec();
            alert('Your nsec: ' + nsec + '\n\nStore this safely!');
        } catch (err) {
            alert('Failed to export nsec: ' + err.message);
        }
    };

    const signInRandom = (_name) => {
        if (user || config?.disable_guest) return;

        const name = _name || prompt('What\'s your name?', 'Randy Rando');
        if (!name || name.length <= 0) return;

        const secretKey = generateSecretKey();
        const pubkey = getPublicKey(secretKey);
        const privateKeyHex = bytesToHex(secretKey);
        const randomProfile = { name, about: 'Random Guest' };

        const signedEvent = finalizeEvent({
            kind: 0,
            content: JSON.stringify(randomProfile),
            tags: [['client', 'Disgus']],
            created_at: Math.floor(Date.now() / 1000),
        }, secretKey);

        const pool = new SimplePool();
        let okCount = 0;
        const pubs = pool.publish(relays, signedEvent);
        pubs.forEach((p) => {
            p.then(() => {
                if (!user) {
                    const userData = {
                        pubkey,
                        privateKey: privateKeyHex,
                        created_at: signedEvent.created_at,
                        ...randomProfile,
                    };
                    localStorage.setItem(cacheKey, JSON.stringify(userData));
                    setUser(userData);
                }
                okCount++;
                if (okCount === relays.length) {
                    pool.close(relays);
                }
            }).catch((err) => {
                console.log(err);
                okCount++;
                if (okCount === relays.length) {
                    pool.close(relays);
                }
            });
        });
    };

    const signOut = () => {
        if (user?.signer) {
            user.signer.destroy();
        }
        localStorage.removeItem(cacheKey);
        setUser(false);
    };

    return {
        user,
        extensionAvailable: !!window.nostr,
        signInExtension,
        signInWithKey,
        signInPasskey,
        importPasskeyFromNsec,
        exportPasskeyNsec,
        signInRandom,
        signOut,
        passkeyAvailable,
    };
}
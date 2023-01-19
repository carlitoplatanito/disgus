import React, { useEffect, useState, useContext } from 'react';
import { relayInit, getEventHash, getBlankEvent, generatePrivateKey, getPublicKey, signEvent } from 'nostr-tools';
import { initPool, getRootEvent, getComments } from '../helpers/nostr';

export const RootContext = React.createContext({});

export const RootProvider = ({ config, children }) => {
    const [rootEvent, setRootEvent] = useState(false);
    const [comments, setComments] = useState(false);

    useEffect(() => {
        if (!rootEvent) {
            getRootEvent(config).then((_event) => {
                setRootEvent(_event);
            });
        } else {
            getComments(config, rootEvent).then((_comments) => {
                setComments(_comments);
            });
        }
    }, [rootEvent]);

    return <RootContext.Provider value={{ config, rootEvent, setRootEvent, comments, setComments }}>{children}</RootContext.Provider>;
}

export const RootConsumer = RootContext.Consumer;

export function useRoot() {
    const { config, rootEvent, setRootEvent, comments, setComments } = useContext(RootContext);

    const createRootEvent = () => {};

    const refreshComments = () => {
        getComments(config, rootEvent, true).then((_comments) => {
            setComments(_comments);
        });
    };

    return { config, rootEvent, createRootEvent, comments, refreshComments };
}
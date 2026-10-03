import React, { useEffect, useState, useContext, useRef } from 'react';
import { getRootEvent, createRootEvent, getComments } from '../helpers/nostr';

export const RootContext = React.createContext({});

export const RootProvider = ({ config, children }) => {
    const [rootEvent, setRootEvent] = useState(false);
    const [comments, setComments] = useState(false);

    useEffect(() => {
        getRootEvent(config).then((_event) => {
            if (_event) {
                setRootEvent(_event);
                getComments(config, _event).then((_comments) => {
                    setComments(_comments);
                });
            }
        });
    }, []);

    return <RootContext.Provider value={{ config, rootEvent, setRootEvent, comments, setComments }}>{children}</RootContext.Provider>;
}

export const RootConsumer = RootContext.Consumer;

export function useRoot() {
    const { config, rootEvent, setRootEvent, comments, setComments } = useContext(RootContext);
    const rootEventRef = useRef(rootEvent);
    rootEventRef.current = rootEvent;

    const createRoot = () => new Promise((resolve, reject) => {
        createRootEvent(config).then((_event) => {
            setRootEvent(_event);
            rootEventRef.current = _event;
            resolve(_event);
        })
    });

    const refreshComments = () => {
        const root = rootEventRef.current;
        if (!root) return;
        getComments(config, root, true).then((_comments) => {
            setComments(_comments);
        });
    };

    return { config, rootEvent, createRoot, comments, refreshComments };
}
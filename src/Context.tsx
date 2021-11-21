
import React, { useEffect, useState } from 'react';
import { createContext } from 'react';
import { Client } from 'theworld-client';

export const TheWorldContext = createContext<Client>(undefined as any);

export function TheWorldProvider({ client, children, loading } : { client:Client, children:any, loading:()=>JSX.Element }) {
    const Loading = loading;
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        (async () => {
            await client.connect();
            setConnected(true);
        })();
    });

    return (
        <TheWorldContext.Provider value={client}>
            {connected ? children : (
                Loading ? <Loading/> : <></>
            )}
        </TheWorldContext.Provider>
    )
};

export const TheWorldConsumer = TheWorldContext.Consumer;
'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
    children: ReactNode;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function SWRProvider({ children }: SWRProviderProps) {
    return (
        <SWRConfig
            value={{
                fetcher,
                revalidateOnFocus: false,
                revalidateIfStale: false,
                dedupingInterval: 60000, // Dedupe requests within 60 seconds
            }}
        >
            {children}
        </SWRConfig>
    );
}

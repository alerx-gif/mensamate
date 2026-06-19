'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function DefaultFacilityRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        // Handled by server-side cookies now, keeping file for reference or future client-side needs
        /*
        if (pathname === '/' && !searchParams.get('facility')) {
            const defaultFacility = localStorage.getItem('defaultFacility');
            if (defaultFacility) {
                router.replace(`/?facility=${defaultFacility}`);
            }
        }
        */
    }, [pathname, searchParams, router]);

    return null;
}

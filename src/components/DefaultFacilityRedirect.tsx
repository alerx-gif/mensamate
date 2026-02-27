'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function DefaultFacilityRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        // Only run on the root page when no facility is explicitly selected
        if (pathname === '/' && !searchParams.get('facility')) {
            const defaultFacility = localStorage.getItem('defaultFacility');
            if (defaultFacility) {
                router.replace(`/?facility=${defaultFacility}`);
            }
        }
    }, [pathname, searchParams, router]);

    return null;
}

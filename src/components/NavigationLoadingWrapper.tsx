"use client";

import React, { useEffect, useState } from 'react';
import ContentSkeleton from './ContentSkeleton';

interface NavigationLoadingWrapperProps {
    children: React.ReactNode;
    currentFacilityId: number;
}

export default function NavigationLoadingWrapper({ children, currentFacilityId }: NavigationLoadingWrapperProps) {
    const [isNavigating, setIsNavigating] = useState(false);

    // Whenever the actual server renders this component with the new currentFacilityId,
    // the navigation is complete. So we can turn off the loading skeleton.
    useEffect(() => {
        setIsNavigating(false);
    }, [currentFacilityId]);

    useEffect(() => {
        const handleNavStart = () => {
            setIsNavigating(true);
        };

        window.addEventListener('facilityNavigationStart', handleNavStart);
        return () => window.removeEventListener('facilityNavigationStart', handleNavStart);
    }, []);

    if (isNavigating) {
        return <ContentSkeleton />;
    }

    return <>{children}</>;
}

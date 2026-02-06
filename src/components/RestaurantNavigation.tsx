"use client";

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Facility } from '@/types/eth';
import { prefetchMenu } from './MenuContent';
import styles from './RestaurantNavigation.module.css';

interface RestaurantNavigationProps {
    facilities: Facility[];
}

export default function RestaurantNavigation({ facilities }: RestaurantNavigationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeLocation, setActiveLocation] = useState<string>('Zentrum');
    const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});

    const currentFacilityId = searchParams.get('facility') || (facilities[0]?.id.toString() || '');

    // Get today's date for prefetching
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });

    // Priority lists
    const ZENTRUM_PRIORITY = ['Mensa Polyterrasse', 'Polysnack', 'Archimedes'];
    const HOENGG_PRIORITY = ['Food Market', 'Fusion', 'Rice Up'];

    // Group facilities by location
    const groupedFacilities = useMemo(() => {
        const grouped = facilities.reduce((acc, facility) => {
            let loc = facility.location || 'Other';
            if (loc === 'Basel') loc = 'Other';

            if (!acc[loc]) acc[loc] = [];
            acc[loc].push(facility);
            return acc;
        }, {} as Record<string, Facility[]>);

        // Sort each group
        Object.keys(grouped).forEach(loc => {
            let priorityList: string[] = [];
            if (loc === 'Zentrum') priorityList = ZENTRUM_PRIORITY;
            else if (loc === 'Hönggerberg') priorityList = HOENGG_PRIORITY;

            grouped[loc].sort((a, b) => {
                const aName = a.shortName || a.name;
                const bName = b.shortName || b.name;

                const aIndex = priorityList.findIndex(p => aName.toLowerCase().includes(p.toLowerCase()));
                const bIndex = priorityList.findIndex(p => bName.toLowerCase().includes(p.toLowerCase()));

                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return aName.localeCompare(bName);
            });
        });

        return grouped;
    }, [facilities]);

    // Define section order
    const locations = ['Zentrum', 'Hönggerberg', 'Oerlikon', 'Other'];

    const selectFacility = (id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('facility', id.toString());
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    // Prefetch menu data on hover
    const handleMouseEnter = useCallback((facilityId: number) => {
        prefetchMenu(facilityId, today);
    }, [today]);

    const toggleExpand = (loc: string) => {
        setExpandedLocations(prev => ({
            ...prev,
            [loc]: !prev[loc]
        }));
    };

    if (facilities.length === 0) return null;

    const activeList = groupedFacilities[activeLocation] || [];
    const isExpanded = expandedLocations[activeLocation];
    // Show more items initially if it's a scroll view, maybe show all?
    // User requested "scroll that goes further than device width", so let's show all by default or a larger subset.
    // Let's remove the "show more" logic for now and just leverage the scroll view as requested.
    const visibleFacilities = activeList;

    return (
        <div className={styles.container}>
            {/* Segmented Control for Categories */}
            <div className={styles.segmentedControlWrapper}>
                <div className={styles.segmentedControl}>
                    {locations.map(loc => (
                        groupedFacilities[loc] && groupedFacilities[loc].length > 0 && (
                            <button
                                key={loc}
                                className={`${styles.tab} ${activeLocation === loc ? styles.activeTab : ''}`}
                                onClick={() => setActiveLocation(loc)}
                            >
                                {loc}
                            </button>
                        )
                    ))}
                </div>
            </div>

            {/* Scrollable Pills for Restaurants */}
            <div className={styles.scrollWrapper}>
                <div className={styles.pillContainer}>
                    {visibleFacilities.map((facility) => (
                        <button
                            key={facility.id}
                            onClick={() => selectFacility(facility.id)}
                            onMouseEnter={() => handleMouseEnter(facility.id)}
                            onTouchStart={() => handleMouseEnter(facility.id)}
                            className={`${styles.pill} ${currentFacilityId === facility.id.toString() ? styles.activePill : ''}`}
                        >
                            {facility.shortName || facility.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


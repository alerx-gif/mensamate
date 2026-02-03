"use client";

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Facility } from '@/types/eth';
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
        router.push(`/?${params.toString()}`);
    };

    const toggleExpand = (loc: string) => {
        setExpandedLocations(prev => ({
            ...prev,
            [loc]: !prev[loc]
        }));
    };

    if (facilities.length === 0) return null;

    const activeList = groupedFacilities[activeLocation] || [];
    const isExpanded = expandedLocations[activeLocation];
    // Show top 3 or all if expanded
    const visibleFacilities = isExpanded ? activeList : activeList.slice(0, 3);
    const hasMore = activeList.length > 3;

    return (
        <div className={styles.container}>
            <div className={styles.tabsScrollContainer}>
                <div className={styles.tabs}>
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

            <div className={styles.restaurantListWrapper}>
                <div className={styles.restaurantList}>
                    {visibleFacilities.map((facility) => (
                        <button
                            key={facility.id}
                            onClick={() => selectFacility(facility.id)}
                            className={`${styles.restaurantButton} ${currentFacilityId === facility.id.toString() ? styles.activeRestaurant : ''}`}
                        >
                            {facility.shortName || facility.name}
                        </button>
                    ))}
                    {hasMore && (
                        <button
                            className={styles.expandButton}
                            onClick={() => toggleExpand(activeLocation)}
                            title={isExpanded ? "Show Less" : "Show More"}
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

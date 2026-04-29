"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Facility } from '@/types/eth';
import styles from './RestaurantNavigation.module.css';

interface RestaurantNavigationProps {
    facilities: Facility[];
}

export default function RestaurantNavigation({ facilities }: RestaurantNavigationProps) {
    const searchParams = useSearchParams();
    const [activeLocation, setActiveLocation] = useState<string>('Zentrum');
    const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});
    const [locations, setLocations] = useState<string[]>(['Zentrum', 'Hönggerberg', 'Oerlikon', 'UZH', 'Other']);

    useEffect(() => {
        const loadLocations = () => {
            const savedVisible = localStorage.getItem('visibleLocations');
            const savedOrder = localStorage.getItem('locationOrder');

            let currentOrder = ['Zentrum', 'Hönggerberg', 'Oerlikon', 'UZH', 'Other'];
            let currentVisible = currentOrder;

            try {
                if (savedOrder) currentOrder = JSON.parse(savedOrder);
                if (savedVisible) currentVisible = JSON.parse(savedVisible);
            } catch (e) { }

            setLocations(currentOrder.filter(loc => currentVisible.includes(loc)));
        };
        loadLocations();
        window.addEventListener('locationsUpdated', loadLocations);
        return () => window.removeEventListener('locationsUpdated', loadLocations);
    }, []);

    const currentFacilityId = searchParams.get('facility') || (facilities[0]?.id.toString() || '');

    // Sync the tab selector with the currently selected facility
    useEffect(() => {
        const currentFacility = facilities.find(f => f.id.toString() === currentFacilityId);
        if (currentFacility) {
            let loc = currentFacility.location || 'Other';
            if (loc === 'Basel') loc = 'Other';
            setActiveLocation(loc);
        }
    }, [currentFacilityId, facilities]);

    // Priority lists
    const ZENTRUM_PRIORITY = ['Mensa Polyterrasse', 'Polysnack', 'Archimedes'];
    const HOENGG_PRIORITY = ['Food Market', 'Fusion', 'Rice Up'];
    const UZH_PRIORITY = ['Obere Mensa', 'Untere Mensa', 'Mensa Irchel', 'Seerose', 'Lichthof'];

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
            else if (loc === 'UZH') priorityList = UZH_PRIORITY;

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

    const locationsWithFacilities = useMemo(() => {
        return locations.filter(loc => groupedFacilities[loc] && groupedFacilities[loc].length > 0);
    }, [locations, groupedFacilities]);

    useEffect(() => {
        if (locationsWithFacilities.length > 0 && !locationsWithFacilities.includes(activeLocation)) {
            // Keep the active location matched if the URL has one, else default to the first visible location
            const currentFacility = facilities.find(f => f.id.toString() === currentFacilityId);
            let urlLoc = 'Zentrum';
            if (currentFacility) {
                urlLoc = currentFacility.location || 'Other';
                if (urlLoc === 'Basel') urlLoc = 'Other';
            }
            if (locationsWithFacilities.includes(urlLoc)) {
                setActiveLocation(urlLoc);
            } else {
                setActiveLocation(locationsWithFacilities[0]);
            }
        }
    }, [locationsWithFacilities, activeLocation, facilities, currentFacilityId]);

    const getFacilityUrl = (id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('facility', id.toString());
        return `/?${params.toString()}`;
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
    // Show more items initially if it's a scroll view, maybe show all?
    // User requested "scroll that goes further than device width", so let's show all by default or a larger subset.
    // Let's remove the "show more" logic for now and just leverage the scroll view as requested.
    const visibleFacilities = activeList;

    return (
        <div className={styles.container}>
            {/* Segmented Control for Categories */}
            {locationsWithFacilities.length > 1 && (
                <div className={styles.segmentedControlWrapper}>
                    <div className={styles.segmentedControl}>
                        {locationsWithFacilities.map(loc => (
                            <button
                                key={loc}
                                className={`${styles.tab} ${activeLocation === loc ? styles.activeTab : ''}`}
                                onClick={() => setActiveLocation(loc)}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Scrollable Pills for Restaurants */}
            <div className={styles.scrollWrapper}>
                <div className={styles.pillContainer}>
                    {visibleFacilities.map((facility) => (
                        <Link
                            key={facility.id}
                            href={getFacilityUrl(facility.id)}
                            prefetch={true}
                            className={`${styles.pill} ${currentFacilityId === facility.id.toString() ? styles.activePill : ''}`}
                            style={{ textDecoration: 'none' }}
                        >
                            {facility.shortName || facility.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

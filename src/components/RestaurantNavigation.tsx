"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Facility } from '@/types/eth';
import styles from './RestaurantNavigation.module.css';

interface RestaurantNavigationProps {
    facilities: Facility[];
}

export default function RestaurantNavigation({ facilities }: RestaurantNavigationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'Zentrum': true,
        'Hönggerberg': true,
        'Oerlikon': true,
        'Basel': true,
        'Other': true,
    });

    const currentFacilityId = searchParams.get('facility') || (facilities[0]?.id.toString() || '');

    // Group facilities by location
    const groupedFacilities = facilities.reduce((acc, facility) => {
        const loc = facility.location || 'Other';
        if (!acc[loc]) acc[loc] = [];
        acc[loc].push(facility);
        return acc;
    }, {} as Record<string, Facility[]>);

    // Define section order
    const sectionOrder = ['Zentrum', 'Hönggerberg', 'Oerlikon', 'Basel', 'Other'];

    const selectFacility = (id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('facility', id.toString());
        router.push(`/?${params.toString()}`);
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev: Record<string, boolean>) => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (facilities.length === 0) return null;

    return (
        <div className={styles.container}>
            {sectionOrder.map(section => {
                const sectionFacilities = groupedFacilities[section];
                if (!sectionFacilities || sectionFacilities.length === 0) return null;

                const isExpanded = expandedSections[section];

                return (
                    <div key={section} className={styles.section}>
                        <button
                            className={styles.sectionHeader}
                            onClick={() => toggleSection(section)}
                        >
                            <span className={styles.sectionTitle}>{section}</span>
                            <span className={styles.chevron}>{isExpanded ? '−' : '+'}</span>
                        </button>

                        {isExpanded && (
                            <div className={styles.grid}>
                                {sectionFacilities.map((facility) => (
                                    <button
                                        key={facility.id}
                                        onClick={() => selectFacility(facility.id)}
                                        className={`${styles.button} ${currentFacilityId === facility.id.toString() ? styles.active : ''}`}
                                    >
                                        {facility.shortName || facility.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

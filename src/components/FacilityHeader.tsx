'use client';

import { useState, useEffect } from 'react';
import { Facility, OpeningHours } from '@/types/eth';
import FacilityDetailModal from './FacilityDetailModal';
import styles from './FacilityHeader.module.css';

interface FacilityHeaderProps {
    facility: Facility;
    openingHours?: OpeningHours[];
    dateString: string;
}

// Helper to parse time string "HH:MM" to minutes since midnight
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Get the opening hours status text
function getOpeningStatus(openingHours: OpeningHours[] | undefined): { text: string; type: 'closed' | 'open' | 'closing' } | null {
    if (!openingHours || openingHours.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Collect all actual service windows (meal times) from all opening hours
    // The parent opening hours (e.g., 11:15-19:30) are just containers
    // The real service times are in mealTimes (e.g., Mittag 11:15-13:30, Abend 17:30-19:30)
    const serviceWindows: { timeFrom: string; timeTo: string; name?: string }[] = [];

    for (const oh of openingHours) {
        if (oh.mealTimes && oh.mealTimes.length > 0) {
            // Use meal times as the actual service windows
            for (const mt of oh.mealTimes) {
                serviceWindows.push({
                    timeFrom: mt.timeFrom,
                    timeTo: mt.timeTo,
                    name: mt.name
                });
            }
        } else {
            // Fallback to parent opening hours if no meal times
            serviceWindows.push({
                timeFrom: oh.timeFrom,
                timeTo: oh.timeTo
            });
        }
    }

    if (serviceWindows.length === 0) return null;

    // Sort service windows by start time
    const sortedWindows = serviceWindows.sort((a, b) =>
        timeToMinutes(a.timeFrom) - timeToMinutes(b.timeFrom)
    );

    // Check each window in order
    for (let i = 0; i < sortedWindows.length; i++) {
        const window = sortedWindows[i];
        const openTime = timeToMinutes(window.timeFrom);
        const closeTime = timeToMinutes(window.timeTo);

        // Before this window opens
        if (currentMinutes < openTime) {
            return { text: `Opens at ${window.timeFrom}`, type: 'closed' };
        }

        // Within this window
        if (currentMinutes >= openTime && currentMinutes < closeTime) {
            const minutesLeft = closeTime - currentMinutes;
            if (minutesLeft <= 15) {
                return { text: `Closing soon (${window.timeTo})`, type: 'closing' };
            }
            return { text: `Open until ${window.timeTo}`, type: 'open' };
        }

        // After this window closes - check if there's a next window today
        if (i < sortedWindows.length - 1) {
            const nextWindow = sortedWindows[i + 1];
            const nextOpenTime = timeToMinutes(nextWindow.timeFrom);

            // We're in the gap between this window and the next
            if (currentMinutes >= closeTime && currentMinutes < nextOpenTime) {
                return { text: `Opens at ${nextWindow.timeFrom}`, type: 'closed' };
            }
        }
    }

    // After all windows have closed
    return { text: 'Closed', type: 'closed' };
}

export default function FacilityHeader({ facility, openingHours, dateString }: FacilityHeaderProps) {
    const [showModal, setShowModal] = useState(false);
    const [openingStatus, setOpeningStatus] = useState<{ text: string; type: 'closed' | 'open' | 'closing' } | null>(null);

    useEffect(() => {
        // Initial status
        setOpeningStatus(getOpeningStatus(openingHours));

        // Update every minute
        const interval = setInterval(() => {
            setOpeningStatus(getOpeningStatus(openingHours));
        }, 60000);

        return () => clearInterval(interval);
    }, [openingHours]);

    return (
        <>
            <button
                className={styles.titleButton}
                onClick={() => setShowModal(true)}
                aria-label={`View details for ${facility.name}`}
            >
                <h2 className={styles.facilityTitle}>
                    {facility.name}
                    <span className={styles.infoIcon}>ⓘ</span>
                </h2>
            </button>
            <p className={styles.dateSubtitle}>
                {dateString}
                {openingStatus && (
                    <>
                        <span className={styles.dateSeparator}>•</span>
                        <span className={`${styles.openingStatus} ${styles[openingStatus.type]}`}>
                            {openingStatus.text}
                        </span>
                    </>
                )}
            </p>

            {showModal && (
                <FacilityDetailModal
                    facility={facility}
                    openingHours={openingHours}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

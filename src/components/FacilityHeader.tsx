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

    // Find the relevant opening hour window
    for (const oh of openingHours) {
        const openTime = timeToMinutes(oh.timeFrom);
        const closeTime = timeToMinutes(oh.timeTo);

        // Before this window opens
        if (currentMinutes < openTime) {
            return { text: `Opens at ${oh.timeFrom}`, type: 'closed' };
        }

        // Within this window
        if (currentMinutes >= openTime && currentMinutes < closeTime) {
            const minutesLeft = closeTime - currentMinutes;
            if (minutesLeft <= 15) {
                return { text: `Closing soon (${oh.timeTo})`, type: 'closing' };
            }
            return { text: `Open until ${oh.timeTo}`, type: 'open' };
        }
    }

    // After all windows have closed - show next day or "Closed"
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

'use client';

import useSWR, { preload } from 'swr';
import { Facility, WeeklyRota, OpeningHours } from '@/types/eth';
import MenuDisplay from './MenuDisplay';
import FacilityHeader from './FacilityHeader';
import RestaurantNavigation from './RestaurantNavigation';
import styles from './MenuContent.module.css';

interface MenuContentProps {
    facilityId: number;
    facility: Facility;
    today: string;
    dateString: string;
    facilities: Facility[];
}

interface MenuData {
    weeklyRota: WeeklyRota | null;
    openingHours: OpeningHours[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Export prefetch function for hover prefetching
export function prefetchMenu(facilityId: number, date: string) {
    preload(`/api/menu?facilityId=${facilityId}&date=${date}`, fetcher);
}

export default function MenuContent({ facilityId, facility, today, dateString, facilities }: MenuContentProps) {
    const { data, error, isLoading } = useSWR<MenuData>(
        `/api/menu?facilityId=${facilityId}&date=${today}`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    const displayedMenus = data?.weeklyRota?.meals || [];
    const openingHours = data?.openingHours || [];

    // Loading skeleton for the bottom part
    const LoadingSkeleton = () => (
        <div className={styles.loadingContainer}>
            <div className={styles.menuSkeletons}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className={styles.cardSkeleton}>
                        <div className={styles.imageSkeleton} />
                        <div className={styles.textSkeleton} />
                        <div className={styles.textSkeletonShort} />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <FacilityHeader
                facility={facility}
                openingHours={openingHours}
                dateString={dateString}
            />

            <RestaurantNavigation facilities={facilities} />

            {isLoading ? (
                <LoadingSkeleton />
            ) : error ? (
                <div className={styles.errorState}>
                    <p>Failed to load menu. Please try again.</p>
                </div>
            ) : displayedMenus.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No menus found for today ({today}) at this location.</p>
                </div>
            ) : (
                <MenuDisplay meals={displayedMenus} />
            )}

            {!isLoading && displayedMenus.length > 0 && (
                <div className={styles.weeklyLink}>
                    <a href={`/week?facility=${facilityId}`} className={styles.weeklyButton}>
                        View Weekly Menu
                    </a>
                </div>
            )}
        </>
    );
}

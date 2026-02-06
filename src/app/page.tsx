import { Suspense } from 'react';
import { getFacilities } from '@/lib/eth-client';
import MenuContent from '@/components/MenuContent';
import styles from './page.module.css';

// Revalidate facilities every hour (they rarely change)
export const revalidate = 3600;

// Loading skeleton for the menu section
function MenuSkeleton() {
  return (
    <div className={styles.skeletonContainer}>
      {/* Header skeleton */}
      <div className={styles.headerSkeleton}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </div>

      {/* Menu skeleton cards */}
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
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Fetch facilities (cached for 1 hour)
  const facilities = await getFacilities();

  // Sort facilities alphabetically
  facilities.sort((a, b) => {
    const nameA = a.shortName || a.nameDe || a.name || '';
    const nameB = b.shortName || b.nameDe || b.name || '';
    return nameA.localeCompare(nameB);
  });

  // Get the selected facility from URL params
  const resolvedParams = await searchParams;
  const selectedFacilityIdStr = typeof resolvedParams.facility === 'string'
    ? resolvedParams.facility
    : '9'; // Default to Mensa Polyterrasse (ID: 9)

  const selectedFacilityId = parseInt(selectedFacilityIdStr, 10);
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  // Get Today's Date in YYYY-MM-DD using Swiss timezone
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
  const dateString = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={styles.main}>
      {/* Menu Content - Uses SWR for client-side caching */}
      {facilities.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Failed to load restaurants.</p>
        </div>
      ) : !selectedFacility ? (
        <div className={styles.emptyState}>
          <p>Select a restaurant.</p>
        </div>
      ) : (
        <Suspense fallback={<MenuSkeleton />}>
          <MenuContent
            facilityId={selectedFacilityId}
            facility={selectedFacility}
            today={today}
            dateString={dateString}
            facilities={facilities}
          />
        </Suspense>
      )}
    </div>
  );
}

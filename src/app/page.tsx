import { Suspense } from 'react';
import { getFacilities } from '@/lib/eth-client';
import RestaurantNavigation from '@/components/RestaurantNavigation';
import FacilityContent from '@/components/FacilityContent';
import ContentSkeleton from '@/components/ContentSkeleton';
import FacilityHeader from '@/components/FacilityHeader';
import AsyncFacilityHeader from '@/components/AsyncFacilityHeader';
import styles from './page.module.css';

// Revalidate data every 5 minutes
export const revalidate = 300;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const facilities = await getFacilities();

  // Sort facilities alphabetically
  facilities.sort((a, b) => {
    const nameA = a.shortName || a.nameDe || a.name || '';
    const nameB = b.shortName || b.nameDe || b.name || '';
    return nameA.localeCompare(nameB);
  });

  // Default to Mensa Polyterasse (ID: 9) if no facility is specified
  const selectedFacilityIdStr = typeof resolvedParams.facility === 'string'
    ? resolvedParams.facility
    : '9';

  const selectedFacilityId = parseInt(selectedFacilityIdStr, 10);
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  // Get Today's Date in YYYY-MM-DD using Swiss timezone
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
  const dateString = new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Zurich', weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={styles.main}>
      {facilities.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Failed to load restaurants.</p>
        </div>
      ) : !selectedFacility ? (
        <div className={styles.emptyState}>
          <p>Select a restaurant.</p>
        </div>
      ) : (
        <>
          <Suspense
            key={`header-${selectedFacility.id}`}
            fallback={<FacilityHeader facility={selectedFacility} dateString={dateString} />}
          >
            <AsyncFacilityHeader facility={selectedFacility} today={today} dateString={dateString} />
          </Suspense>

          <RestaurantNavigation facilities={facilities} />

          <Suspense key={`content-${selectedFacility.id}`} fallback={<ContentSkeleton />}>
            <FacilityContent selectedFacility={selectedFacility} today={today} />
          </Suspense>
        </>
      )}
    </div>
  );
}

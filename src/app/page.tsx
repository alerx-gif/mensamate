import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getAllFacilities } from '@/lib/unified-client';
import { FacilityNavItem } from '@/types/eth';
import RestaurantNavigation from '@/components/RestaurantNavigation';
import FacilityContent from '@/components/FacilityContent';
import ContentSkeleton from '@/components/ContentSkeleton';
import NavigationLoadingWrapper from '@/components/NavigationLoadingWrapper';
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
  const cookieStore = await cookies();
  const defaultFacilityCookie = cookieStore.get('defaultFacility')?.value;
  const facilities = await getAllFacilities();

  // Sort facilities alphabetically
  facilities.sort((a, b) => {
    const nameA = a.shortName || a.nameDe || a.name || '';
    const nameB = b.shortName || b.nameDe || b.name || '';
    return nameA.localeCompare(nameB);
  });

  // Default to user's favorite, or Mensa Polyterasse (ID: 9) if no facility is specified
  const selectedFacilityIdStr = typeof resolvedParams.facility === 'string'
    ? resolvedParams.facility
    : defaultFacilityCookie || '9';

  const selectedFacilityId = parseInt(selectedFacilityIdStr, 10);
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  // Only the fields RestaurantNavigation reads cross the server/client boundary.
  // Passing full Facility objects would serialize ~26KB of unused extended details
  // (payment options, features, address, caterer) into the RSC payload per load.
  const navFacilities: FacilityNavItem[] = facilities.map(f => ({
    id: f.id,
    name: f.name,
    shortName: f.shortName,
    location: f.location,
  }));

  // Get Today's Date in YYYY-MM-DD using Swiss timezone
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
  const dateString = new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Zurich', weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={styles.main}>
      {facilities.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <p className={styles.emptyText}>Failed to load restaurants</p>
        </div>
      ) : !selectedFacility ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📍</div>
          <p className={styles.emptyText}>Select a restaurant</p>
        </div>
      ) : (
        <>
          <Suspense fallback={<FacilityHeader facility={selectedFacility} dateString={dateString} />}>
            <AsyncFacilityHeader facility={selectedFacility} today={today} dateString={dateString} />
          </Suspense>

          <RestaurantNavigation facilities={navFacilities} selectedFacilityId={selectedFacilityId} />

          <Suspense key={`content-${selectedFacility.id}`} fallback={<ContentSkeleton />}>
            <NavigationLoadingWrapper currentFacilityId={selectedFacility.id}>
              <FacilityContent selectedFacility={selectedFacility} today={today} />
            </NavigationLoadingWrapper>
          </Suspense>
        </>
      )}
    </div>
  );
}

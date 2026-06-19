import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getAllFacilities, getOpeningHours } from '@/lib/unified-client';
import RestaurantNavigation from '@/components/RestaurantNavigation';
import FacilityContent from '@/components/FacilityContent';
import ContentSkeleton from '@/components/ContentSkeleton';
import FacilityHeader from '@/components/FacilityHeader';
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

  // Get Today's Date in YYYY-MM-DD using Swiss timezone
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
  const dateString = new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Zurich', weekday: 'short', month: 'short', day: 'numeric' });

  const openingHours = selectedFacility 
    ? await getOpeningHours(selectedFacility.id, today) 
    : undefined;

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
          <FacilityHeader facility={selectedFacility} openingHours={openingHours} dateString={dateString} />

          <RestaurantNavigation facilities={facilities} selectedFacilityId={selectedFacilityId} />

          <Suspense key={`content-${selectedFacility.id}`} fallback={<ContentSkeleton />}>
            <FacilityContent selectedFacility={selectedFacility} today={today} />
          </Suspense>
        </>
      )}
    </div>
  );
}

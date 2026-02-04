import { getFacilities, getDailyMenu, getOpeningHours } from '@/lib/eth-client';
import { Facility, WeeklyRota } from '@/types/eth';
import MenuCard from '@/components/MenuCard';
import RestaurantNavigation from '@/components/RestaurantNavigation';
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

  // Get Today's Date in YYYY-MM-DD using Swiss timezone (works on Vercel)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });

  let weeklyRota: WeeklyRota | null = null;
  let openingHours: import('@/types/eth').OpeningHours[] = [];

  if (selectedFacilityId) {
    weeklyRota = await getDailyMenu(selectedFacilityId, today);
    openingHours = await getOpeningHours(selectedFacilityId, today);
  }

  const displayedMenus = weeklyRota?.meals || [];
  const dateString = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={styles.main}>
      <RestaurantNavigation facilities={facilities} />

      {selectedFacility && (
        <FacilityHeader
          facility={selectedFacility}
          openingHours={openingHours}
          dateString={dateString}
        />
      )}



      {facilities.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Failed to load restaurants.</p>
        </div>
      ) : !selectedFacilityId ? (
        <div className={styles.emptyState}>
          <p>Select a restaurant.</p>
        </div>
      ) : displayedMenus.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No menus found for today ({today}) at this location.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayedMenus.map((meal, index) => (
            <MenuCard key={meal.id || index} meal={meal} />
          ))}
        </div>
      )}

      {selectedFacilityId && (
        <div style={{ textAlign: 'center', margin: '2rem 0 1rem 0' }}>
          <a href={`/week?facility=${selectedFacilityId}`} style={{
            display: 'inline-block',
            padding: '0.8rem 1.5rem',
            backgroundColor: 'var(--text-color)',
            color: 'white',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '600',
            boxShadow: 'var(--shadow-sm)'
          }}>
            View Weekly Menu
          </a>
        </div>
      )}
    </div>
  );
}

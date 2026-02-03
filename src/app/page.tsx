import { getFacilities, getDailyMenu } from '@/lib/eth-client';
import { Facility, WeeklyRota } from '@/types/eth';
import MenuCard from '@/components/MenuCard';
import RestaurantNavigation from '@/components/RestaurantNavigation';
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

  const selectedFacilityIdStr = typeof resolvedParams.facility === 'string'
    ? resolvedParams.facility
    : (facilities[0]?.id.toString() || '');

  const selectedFacilityId = parseInt(selectedFacilityIdStr, 10);
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  // Get Today's Date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  let weeklyRota: WeeklyRota | null = null;

  if (selectedFacilityId) {
    weeklyRota = await getDailyMenu(selectedFacilityId, today);
  }

  const displayedMenus = weeklyRota?.meals || [];

  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            <span className={styles.titleMensa}>Mensa</span>
            <span className={styles.titleMate}>Mate</span>
          </h1>
          <span className={styles.alphaTag}>ALPHA</span>
        </div>
      </header>

      <RestaurantNavigation facilities={facilities} />

      {selectedFacility && (
        <>
          <h2 className={styles.facilityTitle}>{selectedFacility.name}</h2>
          <p className={styles.dateSubtitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </>
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

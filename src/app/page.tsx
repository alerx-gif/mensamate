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
          <h1 className={styles.title}>Mensa Mate</h1>
          <span className={styles.alphaTag}>ALPHA</span>
        </div>
        <p className={styles.subtitle}>Today's Menu Plans ({today})</p>
      </header>

      <RestaurantNavigation facilities={facilities} />

      {selectedFacilityId && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <a href={`/week?facility=${selectedFacilityId}`} style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#333',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            View Weekly Menu
          </a>
        </div>
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
    </div>
  );
}

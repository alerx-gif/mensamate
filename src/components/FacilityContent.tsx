import { getDailyMenu } from '@/lib/eth-client';
import { Facility } from '@/types/eth';
import MenuDisplay from './MenuDisplay';
import styles from '../app/page.module.css';

interface FacilityContentProps {
    selectedFacility: Facility;
    today: string;
}

export default async function FacilityContent({
    selectedFacility,
    today
}: FacilityContentProps) {

    const weeklyRota = await getDailyMenu(selectedFacility.id, today);

    const displayedMenus = weeklyRota?.meals || [];

    return (
        <>
            {displayedMenus.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No menus found for today ({today}) at this location.</p>
                </div>
            ) : (
                <MenuDisplay meals={displayedMenus} />
            )}

            <div style={{ textAlign: 'center', margin: '2rem 0 1rem 0' }}>
                <a href={`/week?facility=${selectedFacility.id}`} style={{
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
        </>
    );
}

import { getDailyMenu } from '@/lib/unified-client';
import { Facility } from '@/types/eth';
import MenuDisplay from './MenuDisplay';
import styles from '../app/page.module.css';
import { ArrowRight } from 'lucide-react';

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
                    <div className={styles.emptyIcon}>🍽️</div>
                    <p className={styles.emptyText}>No menus today</p>
                </div>
            ) : (
                <MenuDisplay meals={displayedMenus} facilityId={selectedFacility.id} date={today} />
            )}

            <div style={{ textAlign: 'center', margin: '2rem 0 1rem 0' }}>
                <a href={`/week?facility=${selectedFacility.id}`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--text-color)',
                    color: 'var(--card-bg, white)',
                    border: '1px solid var(--text-color)',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
                }}>
                    Weekly Menu <ArrowRight size={18} />
                </a>
            </div>
        </>
    );
}

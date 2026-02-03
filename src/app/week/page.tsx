import { getFacilities, getWeeklyMenu } from '@/lib/eth-client';
import WeeklyMenuGrid from '@/components/WeeklyMenuGrid';
import Link from 'next/link';
import styles from './page.module.css';

// Revalidate data every 5 minutes
export const revalidate = 300;

export default async function WeeklyPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const facilityIdStr = typeof resolvedParams.facility === 'string' ? resolvedParams.facility : '';
    const facilityId = facilityIdStr ? parseInt(facilityIdStr, 10) : null;

    // Default to today if no date provided, though we usually just want the current week
    const date = typeof resolvedParams.date === 'string'
        ? resolvedParams.date
        : new Date().toISOString().split('T')[0];

    const facilities = await getFacilities();
    const selectedFacility = facilities.find(f => f.id === facilityId);

    let weeklyPlan = null;
    if (facilityId) {
        weeklyPlan = await getWeeklyMenu(facilityId, date);
    }

    return (
        <div className={styles.main}>
            <header className={styles.header}>
                <Link href={`/?facility=${facilityId}`} className={styles.backLink}>
                    ← Back to Daily View
                </Link>
                <h1 className={styles.title}>
                    Weekly Menu: {selectedFacility?.name || 'Select a Restaurant'}
                </h1>
            </header>

            {!facilityId ? (
                <div className={styles.emptyState}>
                    <p>Please go back and select a restaurant first.</p>
                </div>
            ) : !weeklyPlan || weeklyPlan.days.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No weekly plan found for this week.</p>
                </div>
            ) : (
                <WeeklyMenuGrid plan={weeklyPlan} />
            )}
        </div>
    );
}

import styles from './page.module.css';

/*
 * Mirrors the real weekly layout: back link, title, the day selector strip and
 * a card grid. Uses --gray-bg / --gray-light, which actually exist; the previous
 * version referenced --border-color and --bg-color, so it rendered invisible.
 */
export default function Loading() {
    return (
        <div className={styles.main}>
            <header className={styles.header}>
                <div className={styles.skeletonBackLink} />
                <div className={styles.skeletonTitle} />
            </header>

            <div className={styles.skeletonDayBar}>
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={styles.skeletonTab} />
                ))}
            </div>

            <div className={styles.skeletonPanelHeader}>
                <div className={styles.skeletonDayTitle} />
                <div className={styles.skeletonDayMeta} />
            </div>

            <div className={styles.skeletonGrid}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={styles.skeletonCard}>
                        <div className={styles.skeletonImage} />
                        <div className={styles.skeletonCardBody}>
                            <div className={styles.skeletonLineWide} />
                            <div className={styles.skeletonLineNarrow} />
                            <div className={styles.skeletonPrice} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

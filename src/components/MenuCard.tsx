import styles from './MenuCard.module.css';
import { Meal } from '@/types/eth';
import { getImageUrl } from '@/lib/eth-client';

interface MenuCardProps {
    meal: Meal;
}

export default function MenuCard({ meal }: MenuCardProps) {
    const imageUrl = getImageUrl(meal.imageId);

    return (
        <article className={styles.card}>
            {imageUrl && (
                <div className={styles.imageWrapper}>
                    <img src={imageUrl} alt={meal.name} className={styles.image} />
                    {meal.label && <span className={styles.category}>{meal.label}</span>}
                </div>
            )}
            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{meal.name}</h3>
                    <div className={styles.prices}>
                        <span className={styles.priceTag} title="Student">S: {meal.prices.student.toFixed(2)}</span>
                        <span className={styles.priceTag} title="Staff">I: {meal.prices.staff.toFixed(2)}</span>
                    </div>
                </div>
                <p className={styles.description}>{meal.description}</p>
            </div>
        </article>
    );
}

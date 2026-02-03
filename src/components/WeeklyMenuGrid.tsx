import React from 'react';
import { WeeklyPlan } from '@/types/eth';
import MenuCard from './MenuCard';
import styles from './WeeklyMenuGrid.module.css';

interface WeeklyMenuGridProps {
    plan: WeeklyPlan;
}

export default function WeeklyMenuGrid({ plan }: WeeklyMenuGridProps) {
    return (
        <div className={styles.container}>
            {plan.days.map((day, index) => (
                <div key={index} className={styles.dayColumn}>
                    <h2 className={styles.dayTitle}>{day.dayOfWeek}</h2>
                    <div className={styles.mealsList}>
                        {day.meals.map((meal, mIndex) => (
                            <MenuCard key={meal.id || mIndex} meal={meal} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

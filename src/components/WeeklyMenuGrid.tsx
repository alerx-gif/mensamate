"use client";

import React, { useState } from 'react';
import { WeeklyPlan } from '@/types/eth';
import MenuCard from './MenuCard';
import styles from './WeeklyMenuGrid.module.css';

interface WeeklyMenuGridProps {
    plan: WeeklyPlan;
}

export default function WeeklyMenuGrid({ plan }: WeeklyMenuGridProps) {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);

    const nextDay = () => {
        if (currentDayIndex < plan.days.length - 1) {
            setCurrentDayIndex(prev => prev + 1);
        }
    };

    const prevDay = () => {
        if (currentDayIndex > 0) {
            setCurrentDayIndex(prev => prev - 1);
        }
    };

    return (
        <div className={styles.container}>
            {/* Mobile View: Day by Day */}
            <div className={styles.mobileView}>
                <div className={styles.navigationControls}>
                    <button
                        onClick={prevDay}
                        disabled={currentDayIndex === 0}
                        className={styles.navButton}
                    >
                        ← Prev
                    </button>
                    <span className={styles.dayIndicator}>
                        {plan.days[currentDayIndex]?.dayOfWeek}
                    </span>
                    <button
                        onClick={nextDay}
                        disabled={currentDayIndex === plan.days.length - 1}
                        className={styles.navButton}
                    >
                        Next →
                    </button>
                </div>

                <div className={styles.mobileDayContent}>
                    {plan.days[currentDayIndex] && (
                        <div className={styles.mealsList}>
                            {plan.days[currentDayIndex].meals.map((meal, mIndex) => (
                                <MenuCard key={meal.id || mIndex} meal={meal} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop View: Horizontal Scroll / Grid */}
            <div className={styles.desktopView}>
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
        </div>
    );
}

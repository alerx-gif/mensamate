"use client";

import React, { useState, useEffect } from 'react';
import { WeeklyPlan } from '@/types/eth';
import MenuCard from './MenuCard';
import styles from './WeeklyMenuGrid.module.css';

interface WeeklyMenuGridProps {
    plan: WeeklyPlan;
}

export default function WeeklyMenuGrid({ plan }: WeeklyMenuGridProps) {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);

    // Initialize to current day of the week on mount to avoid hydration errors
    useEffect(() => {
        const currentDay = new Date().getDay();
        const defaultIndex = currentDay === 0 ? 6 : currentDay - 1;
        setCurrentDayIndex(Math.min(Math.max(0, defaultIndex), plan.days.length - 1));
    }, [plan.days.length]);

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
                        aria-label="Previous Day"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span className={styles.dayIndicator}>
                        {plan.days[currentDayIndex]?.dayOfWeek}
                    </span>
                    <button
                        onClick={nextDay}
                        disabled={currentDayIndex === plan.days.length - 1}
                        className={styles.navButton}
                        aria-label="Next Day"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>

                <div className={styles.mobileDayContent}>
                    {plan.days[currentDayIndex] && (
                        <div className={styles.mealsList}>
                            {plan.days[currentDayIndex].meals.map((meal, mIndex) => (
                                <MenuCard key={meal.id || mIndex} meal={meal} facilityId={plan.facilityId} />
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
                                <MenuCard key={meal.id || mIndex} meal={meal} facilityId={plan.facilityId} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

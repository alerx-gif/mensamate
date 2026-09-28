"use client";

import React, { useState, useEffect } from 'react';
import { Meal } from '@/types/eth';
import MenuCard from './MenuCard';
import styles from './MenuDisplay.module.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { splitByMealTime } from '@/lib/mealTime';

interface MenuDisplayProps {
    meals: Meal[];
    facilityId?: number;
    date?: string;
}

export default function MenuDisplay({ meals, facilityId, date }: MenuDisplayProps) {
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [liveMeals, setLiveMeals] = useState<Meal[]>(meals);
    const [hasAttemptedRefetch, setHasAttemptedRefetch] = useState(false);
    const [showSecondary, setShowSecondary] = useState(false);
    const [isEvening, setIsEvening] = useState(() => new Date().getHours() >= 14);

    useEffect(() => {
        const checkTime = () => setIsEvening(new Date().getHours() >= 14);
        // Check every minute in case the app is left open across the 14:00 boundary
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Sync state when props change
    useEffect(() => {
        setLiveMeals(meals);
        // Reset the fetch flag so we can attempt a refetch if re-selected
        setHasAttemptedRefetch(false);
    }, [meals, facilityId, date]);

    // Fetch missing images if needed
    useEffect(() => {
        const hasMissingImages = liveMeals.some(m => !m.imageId && !m.imageUrl);

        if (hasMissingImages && !hasAttemptedRefetch && facilityId && date) {
            setHasAttemptedRefetch(true);

            let active = true;
            const fetchImages = async () => {
                try {
                    const res = await fetch(`/api/menu?facility=${facilityId}&date=${date}`);
                    if (!res.ok) return;

                    const freshMeals: Meal[] = await res.json();

                    if (active && freshMeals.length > 0) {
                        setLiveMeals(prev => {
                            const updated = prev.map(m => {
                                const fresh = freshMeals.find(f => f.id === m.id || f.name === m.name);
                                if (fresh && ((!m.imageId && fresh.imageId) || (!m.imageUrl && fresh.imageUrl))) {
                                    return {
                                        ...m,
                                        imageId: fresh.imageId || m.imageId,
                                        imageUrl: fresh.imageUrl || m.imageUrl
                                    };
                                }
                                return m;
                            });

                            // Only trigger a re-render if an image was actually found
                            const changed = prev.some((p, i) => p.imageId !== updated[i].imageId || p.imageUrl !== updated[i].imageUrl);
                            return changed ? updated : prev;
                        });
                    }
                } catch (error) {
                    console.error('Failed to refetch missing images:', error);
                }
            };

            fetchImages();
            return () => { active = false; };
        }
    }, [liveMeals, hasAttemptedRefetch, facilityId, date]);

    // Group meals
    const { primaryMenus, secondaryMenus, secondaryLabel } = React.useMemo(() => {
        const { lunch: lunchMenus, dinner: dinnerMenus } = splitByMealTime(liveMeals);

        if (isEvening) {
            return {
                primaryMenus: dinnerMenus.length > 0 ? dinnerMenus : lunchMenus,
                secondaryMenus: dinnerMenus.length > 0 ? lunchMenus : [],
                secondaryLabel: 'Show Lunch Menus'
            };
        } else {
            return {
                primaryMenus: lunchMenus.length > 0 ? lunchMenus : dinnerMenus,
                secondaryMenus: lunchMenus.length > 0 ? dinnerMenus : [],
                secondaryLabel: 'Show Dinner Menus'
            };
        }
    }, [liveMeals, isEvening]);

    const hasSecondary = secondaryMenus.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.controlsRight}>
                <button
                    className={`${styles.toggleButton} ${viewMode === 'card' ? styles.active : ''}`}
                    onClick={() => setViewMode('card')}
                    aria-label="Grid View"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                </button>
                <button
                    className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List View"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
                </div>
            </div>

            <div className={viewMode === 'card' ? styles.grid : styles.list}>
                {primaryMenus.map((meal, index) => (
                    <MenuCard
                        key={meal.id || index}
                        meal={meal}
                        viewMode={viewMode}
                        index={index}
                        facilityId={facilityId}
                    />
                ))}
            </div>

            {hasSecondary && (
                <div className={styles.secondarySection}>
                    <div className={styles.dividerContainer}>
                        <div className={styles.divider}></div>
                        <button 
                            className={styles.secondaryToggle}
                            onClick={() => setShowSecondary(!showSecondary)}
                            aria-expanded={showSecondary}
                        >
                            {showSecondary ? 'Hide' : secondaryLabel}
                            {showSecondary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className={styles.divider}></div>
                    </div>
                    {showSecondary && (
                        <div className={`${viewMode === 'card' ? styles.grid : styles.list} ${styles.secondaryMenus}`}>
                            {secondaryMenus.map((meal, index) => (
                                <MenuCard
                                    key={meal.id || index}
                                    meal={meal}
                                    viewMode={viewMode}
                                    index={index}
                                    facilityId={facilityId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

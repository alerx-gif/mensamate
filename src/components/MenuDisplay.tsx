"use client";

import React, { useState, useEffect } from 'react';
import { Meal } from '@/types/eth';
import MenuCard from './MenuCard';
import styles from './MenuDisplay.module.css';
import { BicepsFlexed, Scale, ChevronDown, ChevronUp } from 'lucide-react';

interface MenuDisplayProps {
    meals: Meal[];
    facilityId?: number;
    date?: string;
}

export default function MenuDisplay({ meals, facilityId, date }: MenuDisplayProps) {
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [liveMeals, setLiveMeals] = useState<Meal[]>(meals);
    const [hasAttemptedRefetch, setHasAttemptedRefetch] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'none' | 'protein' | 'balanced'>('none');
    const [showSecondary, setShowSecondary] = useState(false);
    const [isEvening, setIsEvening] = useState(() => new Date().getHours() >= 14);

    useEffect(() => {
        const checkTime = () => setIsEvening(new Date().getHours() >= 14);
        // Check every minute in case the app is left open across the 14:00 boundary
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Calculate highlighted meal
    const highlightedMealId = React.useMemo(() => {
        if (activeFilter === 'none' || liveMeals.length === 0) return null;

        let bestMeal = null;
        let bestScore = -Infinity;

        liveMeals.forEach(meal => {
            if (!meal.nutrition) return;

            if (activeFilter === 'protein') {
                const protein = meal.nutrition.protein || 0;
                if (protein > bestScore) {
                    bestScore = protein;
                    bestMeal = meal.id;
                }
            } else if (activeFilter === 'balanced') {
                // Goal: ~50% carbs, 30% protein, 20% fat
                const carbs = meal.nutrition.carbohydrates || 0;
                const protein = meal.nutrition.protein || 0;
                const fat = meal.nutrition.fat || 0;
                
                const totalCals = (carbs * 4) + (protein * 4) + (fat * 9);
                if (totalCals === 0) return;

                const carbPct = (carbs * 4) / totalCals;
                const proteinPct = (protein * 4) / totalCals;
                const fatPct = (fat * 9) / totalCals;

                const carbDiff = Math.abs(carbPct - 0.50);
                const proteinDiff = Math.abs(proteinPct - 0.30);
                const fatDiff = Math.abs(fatPct - 0.20);
                
                const distance = carbDiff + proteinDiff + fatDiff;
                const score = -distance; // We want to minimize distance
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMeal = meal.id;
                }
            }
        });

        return bestMeal;
    }, [activeFilter, liveMeals]);

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
        const dinnerMenus = liveMeals.filter(m => 
            m.label?.toLowerCase().includes('abend') || 
            m.name.toLowerCase().includes('abend') || 
            m.line?.toLowerCase().includes('abend')
        );
        const lunchMenus = liveMeals.filter(m => !dinnerMenus.includes(m));

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
                <div className={styles.controlsLeft}>
                    <button
                        className={`${styles.filterButton} ${activeFilter === 'protein' ? styles.active : ''}`}
                        onClick={() => setActiveFilter(prev => prev === 'protein' ? 'none' : 'protein')}
                        title="Highest Protein"
                        aria-label="Filter Highest Protein"
                    >
                        <BicepsFlexed size={20} />
                    </button>
                    <button
                        className={`${styles.filterButton} ${activeFilter === 'balanced' ? styles.active : ''}`}
                        onClick={() => setActiveFilter(prev => prev === 'balanced' ? 'none' : 'balanced')}
                        title="Most Balanced"
                        aria-label="Filter Most Balanced"
                    >
                        <Scale size={20} />
                    </button>
                </div>
                
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
                        isHighlighted={meal.id === highlightedMealId}
                        activeFilter={activeFilter}
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
                                    isHighlighted={meal.id === highlightedMealId}
                                    activeFilter={activeFilter}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

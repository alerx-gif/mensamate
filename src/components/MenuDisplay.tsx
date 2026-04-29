"use client";

import React, { useState, useEffect } from 'react';
import { Meal } from '@/types/eth';
import MenuCard from './MenuCard';
import styles from './MenuDisplay.module.css';

interface MenuDisplayProps {
    meals: Meal[];
    facilityId?: number;
    date?: string;
}

export default function MenuDisplay({ meals, facilityId, date }: MenuDisplayProps) {
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [liveMeals, setLiveMeals] = useState<Meal[]>(meals);
    const [hasAttemptedRefetch, setHasAttemptedRefetch] = useState(false);

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
                    // Add timestamp to bypass browser cache
                    const res = await fetch(`/api/menu?facility=${facilityId}&date=${date}&t=${Date.now()}`);
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

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
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

            <div className={viewMode === 'card' ? styles.grid : styles.list}>
                {liveMeals.map((meal, index) => (
                    <MenuCard
                        key={meal.id || index}
                        meal={meal}
                        viewMode={viewMode}
                        index={index}
                        facilityId={facilityId}
                    />
                ))}
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { Meal } from '@/types/eth';
import MenuCard from './MenuCard';
import styles from './MenuDisplay.module.css';

interface MenuDisplayProps {
    meals: Meal[];
}

export default function MenuDisplay({ meals }: MenuDisplayProps) {
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

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
                {meals.map((meal, index) => (
                    <MenuCard
                        key={meal.id || index}
                        meal={meal}
                        viewMode={viewMode}
                    />
                ))}
            </div>
        </div>
    );
}

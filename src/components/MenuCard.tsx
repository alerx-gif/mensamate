"use client";

import React, { useState } from 'react';
import styles from './MenuCard.module.css';
import { Meal } from '@/types/eth';
import { getImageUrl } from '@/lib/eth-client';
import MenuModal from './MenuModal';

interface MenuCardProps {
    meal: Meal;
}

export default function MenuCard({ meal }: MenuCardProps) {
    const imageUrl = getImageUrl(meal.imageId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Determine dietary status
    const isVegan = meal.type?.toLowerCase().includes('vegan');
    const isVegetarian = !isVegan && meal.type?.toLowerCase().includes('vegetarisch');

    const dietaryLabel = isVegan ? 'VEGAN' : isVegetarian ? 'VEGI' : null;

    return (
        <>
            <article className={styles.card} onClick={() => setIsModalOpen(true)}>
                {imageUrl && (
                    <div className={styles.imageWrapper}>
                        <img src={imageUrl} alt={meal.name} className={styles.image} />
                        <div className={styles.tagsContainer}>
                            {meal.label && <span className={styles.category}>{meal.label}</span>}
                            {dietaryLabel && <span className={styles.dietaryTag}>{dietaryLabel}</span>}
                        </div>
                    </div>
                )}
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>{meal.name}</h3>
                        {!imageUrl && dietaryLabel && <span className={styles.dietaryTagInline}>{dietaryLabel}</span>}
                    </div>
                    <p className={styles.description}>{meal.description}</p>
                    <div className={styles.priceDisplay}>
                        <span className={styles.price}>CHF {meal.prices.student.toFixed(2)}</span>
                    </div>
                </div>
            </article>

            {isModalOpen && (
                <MenuModal meal={meal} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}

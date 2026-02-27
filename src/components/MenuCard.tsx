"use client";

import React, { useState } from 'react';
import styles from './MenuCard.module.css';
import { Meal } from '@/types/eth';
import { getImageUrl } from '@/lib/eth-client';
import MenuModal from './MenuModal';
import { useFavorites } from '@/lib/useFavorites';
import { useAuth } from '@/components/auth/AuthProvider';
import { isUzhFacility } from '@/lib/uzh-client';

interface MenuCardProps {
    meal: Meal;
    viewMode?: 'card' | 'list';
    index?: number;
    facilityId?: number;
}

export default function MenuCard({ meal, viewMode = 'card', index = 0, facilityId }: MenuCardProps) {
    // Support both ETH (imageId) and UZH (imageUrl) images
    const imageUrl = meal.imageUrl || getImageUrl(meal.imageId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Favorites logic
    const { isFavorite, toggleFavorite } = useFavorites();
    const { session } = useAuth();
    const uniqueMenuId = meal.id ? String(meal.id) : meal.name;
    const isFav = facilityId ? isFavorite(facilityId, uniqueMenuId) : false;

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent opening the modal
        if (facilityId) {
            toggleFavorite(facilityId, uniqueMenuId, meal.name, meal.description, meal.label || meal.line, imageUrl || undefined, meal.nutrition);
        }
    };

    // Determine dietary status
    const isVegan = meal.type?.toLowerCase().includes('vegan');
    const isVegetarian = !isVegan && meal.type?.toLowerCase().includes('vegetarisch');

    const dietaryLabel = isVegan ? 'VEGAN' : isVegetarian ? 'VEGI' : null;

    return (
        <>
            <article
                className={`${styles.card} ${viewMode === 'list' ? styles.cardList : ''}`}
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => setIsModalOpen(true)}
            >
                {imageUrl && (
                    <div className={styles.imageWrapper}>
                        <img src={imageUrl} alt={meal.name} className={styles.image} />
                        <div className={styles.tagsContainer}>
                            {/* Hide category label in list view */}
                            {viewMode === 'card' && meal.label && (
                                <span className={styles.category}>{meal.label}</span>
                            )}
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
                        {session && facilityId && !isUzhFacility(facilityId) && (
                            <button
                                className={`${styles.favoriteButton} ${isFav ? styles.isFavorite : ''}`}
                                onClick={handleFavoriteClick}
                                aria-label="Favorite Menu"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </article>

            {isModalOpen && (
                <MenuModal meal={meal} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}

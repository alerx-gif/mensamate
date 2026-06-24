"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './MenuCard.module.css';
import { Meal } from '@/types/eth';
import { getImageUrl } from '@/lib/eth-client';
import MenuModal from './MenuModal';
import { useFavorites } from '@/lib/useFavorites';
import { useAuth } from '@/components/auth/AuthProvider';
import { isUzhFacility } from '@/lib/uzh-client';
import { useAllergens } from '@/lib/useAllergens';
import { AlertTriangle, BicepsFlexed, Scale } from 'lucide-react';

interface MenuCardProps {
    meal: Meal;
    viewMode?: 'card' | 'list';
    index?: number;
    facilityId?: number;
    isHighlighted?: boolean;
    activeFilter?: 'none' | 'protein' | 'balanced';
}

export default function MenuCard({ meal, viewMode = 'card', index = 0, facilityId, isHighlighted = false, activeFilter = 'none' }: MenuCardProps) {
    // Support both ETH (imageId) and UZH (imageUrl) images
    const imageUrl = meal.imageUrl || getImageUrl(meal.imageId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Favorites logic
    const { isFavorite, toggleFavorite } = useFavorites();
    const { session } = useAuth();
    const uniqueMenuId = meal.id ? String(meal.id) : meal.name;
    const isFav = facilityId ? isFavorite(facilityId, uniqueMenuId) : false;

    // Allergens logic
    const { hasSelectedAllergen, getTriggeringAllergens } = useAllergens();
    const isAllergenWarning = hasSelectedAllergen(meal.allergens);
    const triggeringAllergens = getTriggeringAllergens(meal.allergens);

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
                className={`${styles.card} ${viewMode === 'list' ? styles.cardList : ''} ${isHighlighted ? styles.highlighted : ''}`}
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => setIsModalOpen(true)}
            >
                {imageUrl && (
                    <div className={styles.imageWrapper}>
                        <Image 
                            src={imageUrl} 
                            alt={meal.name} 
                            className={styles.image} 
                            fill 
                            style={{ objectFit: 'cover' }} 
                            sizes="(max-width: 768px) 100vw, 400px" 
                            priority={index < 2}
                        />
                        <div className={styles.leftTagsContainer}>
                            {isHighlighted && activeFilter === 'protein' && <span className={styles.topPickTag} title="Highest Protein"><BicepsFlexed size={16} /></span>}
                            {isHighlighted && activeFilter === 'balanced' && <span className={styles.topPickTag} title="Most Balanced"><Scale size={16} /></span>}
                        </div>
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
                        <h3 className={styles.title}>
                            {!imageUrl && isHighlighted && activeFilter === 'protein' && <span className={styles.topPickTagInlineLeft} title="Highest Protein"><BicepsFlexed size={14} /></span>}
                            {!imageUrl && isHighlighted && activeFilter === 'balanced' && <span className={styles.topPickTagInlineLeft} title="Most Balanced"><Scale size={14} /></span>}
                            {meal.name}
                        </h3>
                        {!imageUrl && dietaryLabel && <span className={styles.dietaryTagInline}>{dietaryLabel}</span>}
                    </div>
                    <p className={styles.description}>{meal.description}</p>
                    <div className={styles.priceDisplay}>
                        <div className={styles.priceDisplayLeft}>
                            <span className={styles.price}>CHF {meal.prices.student.toFixed(2)}</span>
                            {isAllergenWarning && (
                                <div 
                                    className={styles.allergenWarning} 
                                    title={`Contains selected allergens: ${triggeringAllergens.join(', ')}`}
                                >
                                    <AlertTriangle size={18} />
                                </div>
                            )}
                        </div>
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
                <MenuModal meal={meal} onClose={() => setIsModalOpen(false)} facilityId={facilityId} />
            )}
        </>
    );
}

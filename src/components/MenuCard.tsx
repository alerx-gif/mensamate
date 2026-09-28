"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import styles from './MenuCard.module.css';
import { Meal } from '@/types/eth';
import { getImageUrl } from '@/lib/eth-client';
import { isUzhFacility } from '@/lib/uzh-client';
import { useAllergens } from '@/lib/useAllergens';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const MenuModal = dynamic(() => import('./MenuModal'), { ssr: false });

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
    // The exact variant the browser picked from the card's srcset, handed to the
    // modal so it shows the already-downloaded file instead of fetching again.
    const imageRef = useRef<HTMLImageElement>(null);
    const [loadedImageSrc, setLoadedImageSrc] = useState<string | undefined>();

    const openModal = () => {
        setLoadedImageSrc(imageRef.current?.currentSrc || undefined);
        setIsModalOpen(true);
    };

    // Allergens logic
    const { hasSelectedAllergen, getTriggeringAllergens } = useAllergens();
    const isAllergenWarning = hasSelectedAllergen(meal.allergens);
    const triggeringAllergens = getTriggeringAllergens(meal.allergens);

    // Determine dietary status
    const isVegan = meal.type?.toLowerCase().includes('vegan');
    const isVegetarian = !isVegan && meal.type?.toLowerCase().includes('vegetarisch');

    const dietaryLabel = isVegan ? 'VEGAN' : isVegetarian ? 'VEGI' : null;

    // 0 means "unknown", not free: the UZH weekly view carries no prices.
    const hasPrice = meal.prices.student > 0;

    return (
        <>
            <article
                className={`${styles.card} ${viewMode === 'list' ? styles.cardList : ''}`}
                onClick={openModal}
            >
                {imageUrl && (
                    <div className={styles.imageWrapper}>
                        <Image 
                            ref={imageRef}
                            src={imageUrl} 
                            alt={meal.name} 
                            className={styles.image} 
                            fill 
                            style={{ objectFit: 'cover' }} 
                            sizes="(max-width: 768px) 100vw, 400px" 
                            priority={index < 2}
                        />
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
                            {meal.name}
                        </h3>
                        {!imageUrl && dietaryLabel && <span className={styles.dietaryTagInline}>{dietaryLabel}</span>}
                    </div>
                    <p className={styles.description}>{meal.description}</p>
                    {(hasPrice || isAllergenWarning) && (
                        <div className={styles.priceDisplay}>
                            <div className={styles.priceDisplayLeft}>
                                {hasPrice && (
                                    <span className={styles.price}>CHF {meal.prices.student.toFixed(2)}</span>
                                )}
                                {isAllergenWarning && (
                                    <div
                                        className={styles.allergenWarning}
                                        title={`Contains selected allergens: ${triggeringAllergens.join(', ')}`}
                                    >
                                        <AlertTriangle size={18} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </article>

            {isModalOpen && (
                <MenuModal
                    meal={meal}
                    imageSrc={loadedImageSrc}
                    onClose={() => setIsModalOpen(false)}
                    facilityId={facilityId}
                />
            )}
        </>
    );
}

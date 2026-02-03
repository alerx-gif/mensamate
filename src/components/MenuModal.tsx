"use client";

import React, { useEffect, useState } from 'react';
import { Meal } from '@/types/eth';
import { getImageUrl } from '@/lib/eth-client';
import styles from './MenuModal.module.css';

interface MenuModalProps {
    meal: Meal;
    onClose: () => void;
}

export default function MenuModal({ meal, onClose }: MenuModalProps) {
    const imageUrl = getImageUrl(meal.imageId);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    // Dietary Logic
    const isVegan = meal.type?.toLowerCase().includes('vegan');
    const isVegetarian = !isVegan && meal.type?.toLowerCase().includes('vegetarisch');
    const dietaryLabel = isVegan ? 'VEGAN' : isVegetarian ? 'VEGI' : null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={handleClose}>×</button>

                {imageUrl && (
                    <div className={styles.imageWrapper}>
                        <img src={imageUrl} alt={meal.name} className={styles.image} />
                    </div>
                )}

                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.metaRow}>
                            {meal.label && <span className={styles.category}>{meal.label}</span>}
                            {dietaryLabel && <span className={styles.dietaryTag}>{dietaryLabel}</span>}
                        </div>
                        <h2 className={styles.title}>{meal.name}</h2>
                    </div>

                    <p className={styles.description}>{meal.description}</p>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Prices</h4>
                        <div className={styles.prices}>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>Student</span>
                                <span className={styles.priceValue}>{meal.prices.student.toFixed(2)}</span>
                            </div>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>Staff</span>
                                <span className={styles.priceValue}>{meal.prices.staff.toFixed(2)}</span>
                            </div>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>External</span>
                                <span className={styles.priceValue}>{meal.prices.external.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {meal.allergens && meal.allergens.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>Allergens</h4>
                            <div className={styles.allergensList}>
                                {meal.allergens.map((allergen, index) => (
                                    <span key={allergen.code || index} className={styles.allergenTag}>
                                        {allergen.desc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

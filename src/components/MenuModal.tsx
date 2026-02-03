"use client";

import React, { useEffect, useState, useRef } from 'react';
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
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const [energyUnit, setEnergyUnit] = useState<'kJ' | 'kcal'>('kJ');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';

        // Check if content is scrollable
        const checkScroll = () => {
            if (contentRef.current) {
                const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
                setShowScrollIndicator(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 10);
            }
        };

        checkScroll();
        contentRef.current?.addEventListener('scroll', checkScroll);

        return () => {
            document.body.style.overflow = 'unset';
            contentRef.current?.removeEventListener('scroll', checkScroll);
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

                <div className={styles.content} ref={contentRef}>
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
                                <span className={styles.priceValue}>CHF {meal.prices.student.toFixed(2)}</span>
                            </div>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>Staff</span>
                                <span className={styles.priceValue}>CHF {meal.prices.staff.toFixed(2)}</span>
                            </div>
                            <div className={styles.priceItem}>
                                <span className={styles.priceLabel}>External</span>
                                <span className={styles.priceValue}>CHF {meal.prices.external.toFixed(2)}</span>
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

                    {meal.nutrition && (meal.nutrition.energy || meal.nutrition.protein) && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>Nutrition (per 100g)</h4>
                            <div className={styles.nutritionGrid}>
                                {meal.nutrition.energy !== undefined && (
                                    <div
                                        className={`${styles.nutritionItem} ${styles.clickable}`}
                                        onClick={() => setEnergyUnit(prev => prev === 'kJ' ? 'kcal' : 'kJ')}
                                        title="Click to toggle kJ/kcal"
                                    >
                                        <span className={styles.nutritionValue}>
                                            {energyUnit === 'kJ'
                                                ? meal.nutrition.energy
                                                : Math.round(meal.nutrition.energy / 4.184)}
                                        </span>
                                        <span className={styles.nutritionLabel}>{energyUnit}</span>
                                    </div>
                                )}
                                {meal.nutrition.protein !== undefined && (
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{meal.nutrition.protein}g</span>
                                        <span className={styles.nutritionLabel}>Protein</span>
                                    </div>
                                )}
                                {meal.nutrition.carbohydrates !== undefined && (
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{meal.nutrition.carbohydrates}g</span>
                                        <span className={styles.nutritionLabel}>Carbs</span>
                                    </div>
                                )}
                                {meal.nutrition.fat !== undefined && (
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{meal.nutrition.fat}g</span>
                                        <span className={styles.nutritionLabel}>Fat</span>
                                    </div>
                                )}
                                {meal.nutrition.sugar !== undefined && (
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{meal.nutrition.sugar}g</span>
                                        <span className={styles.nutritionLabel}>Sugar</span>
                                    </div>
                                )}
                                {meal.nutrition.salt !== undefined && (
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{meal.nutrition.salt}g</span>
                                        <span className={styles.nutritionLabel}>Salt</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {showScrollIndicator && (
                    <div className={styles.scrollIndicator}>
                        <span>▼</span>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Meal } from '@/types/eth';
import { getImageUrl } from '@/lib/eth-client';
import { isUzhFacility } from '@/lib/uzh-client';
import { useAllergens } from '@/lib/useAllergens';
import { PieChart, Table } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './MenuModal.module.css';

interface MenuModalProps {
    meal: Meal;
    onClose: () => void;
    facilityId?: number;
}

export default function MenuModal({ meal, onClose, facilityId }: MenuModalProps) {
    // Support both ETH (imageId) and UZH (imageUrl) images
    const imageUrl = meal.imageUrl || getImageUrl(meal.imageId);
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const [energyUnit, setEnergyUnit] = useState<'kJ' | 'kcal'>('kJ');
    const [nutritionView, setNutritionView] = useState<'ring' | 'table'>('ring');
    const contentRef = useRef<HTMLDivElement>(null);

    // Swipe to close state
    const [touchStartY, setTouchStartY] = useState<number | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const minSwipeDistance = 80;

    useEffect(() => {
        setMounted(true);
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
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (contentRef.current && contentRef.current.scrollTop > 5) {
            return;
        }
        setTouchStartY(e.targetTouches[0].clientY);
        setSwipeOffset(0);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStartY) return;
        const currentY = e.targetTouches[0].clientY;

        const delta = currentY - touchStartY;
        if (delta > 0) {
            setSwipeOffset(delta);
        }
    };

    const onTouchEnd = () => {
        if (!touchStartY) return;

        if (swipeOffset > minSwipeDistance) {
            handleClose();
        } else {
            setSwipeOffset(0);
        }

        setTouchStartY(null);
    };

    // Dietary Logic
    const isVegan = meal.type?.toLowerCase().includes('vegan');
    const isVegetarian = !isVegan && meal.type?.toLowerCase().includes('vegetarisch');
    const dietaryLabel = isVegan ? 'VEGAN' : isVegetarian ? 'VEGI' : null;

    const { selectedAllergens } = useAllergens();

    const modalStyle: React.CSSProperties = {
        transform: isClosing ? 'translateY(100vh)' : (swipeOffset > 0 ? `translateY(${swipeOffset}px)` : undefined),
        transition: touchStartY && !isClosing ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    if (!mounted) return null;

    return createPortal(
        <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={handleClose}>
            <div
                className={`${styles.modal} ${isClosing ? styles.closing : ''}`}
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className={styles.dragIndicator}></div>
                <button className={styles.closeButton} onClick={handleClose}>×</button>

                <div className={styles.scrollArea} ref={contentRef}>
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
                                    {meal.allergens.map((allergen, index) => {
                                        const isHighlighted = selectedAllergens.some(selected => selected.toLowerCase() === allergen.desc?.toLowerCase());
                                        return (
                                            <span
                                                key={allergen.code || index}
                                                className={`${styles.allergenTag} ${isHighlighted ? styles.highlightedAllergen : ''}`}
                                                title={isHighlighted ? "Contains selected allergen" : undefined}
                                            >
                                                {allergen.desc}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className={styles.section}>
                            <div className={styles.nutritionHeader}>
                                <h4 className={styles.nutritionTitle}>
                                    Nutrition {facilityId && isUzhFacility(facilityId) ? '(per serving)' : '(per 100g)'}
                                </h4>
                                {meal.nutrition && (meal.nutrition.energy || meal.nutrition.protein || meal.nutrition.carbohydrates || meal.nutrition.fat) ? (
                                    <div className={styles.viewToggle}>
                                        <button
                                            className={`${styles.toggleBtn} ${nutritionView === 'ring' ? styles.active : ''}`}
                                            onClick={() => setNutritionView('ring')}
                                            title="Ring View"
                                        >
                                            <PieChart size={20} />
                                        </button>
                                        <button
                                            className={`${styles.toggleBtn} ${nutritionView === 'table' ? styles.active : ''}`}
                                            onClick={() => setNutritionView('table')}
                                            title="Table View"
                                        >
                                            <Table size={20} />
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            {!meal.nutrition || (!meal.nutrition.energy && !meal.nutrition.protein && !meal.nutrition.carbohydrates && !meal.nutrition.fat) ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-dark)' }}>
                                    Nutritional information unavailable for this item
                                </div>
                            ) : nutritionView === 'ring' ? (
                                (() => {
                                    const protein = meal.nutrition?.protein || 0;
                                    const carbs = meal.nutrition?.carbohydrates || 0;
                                    const fat = meal.nutrition?.fat || 0;
                                    const total = protein + carbs + fat;

                                    if (total === 0) {
                                        return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-dark)' }}>No macronutrient data available</div>;
                                    }

                                    const proteinPct = (protein / total) * 100;
                                    const carbsPct = (carbs / total) * 100;
                                    const fatPct = (fat / total) * 100;

                                    return (
                                        <div className={styles.ringContainerWrapper}>
                                            <div
                                                className={styles.ringContainer}
                                                style={{
                                                    background: `conic-gradient(
                                                        #6366f1 0% ${proteinPct}%, 
                                                        #10b981 ${proteinPct}% ${proteinPct + carbsPct}%, 
                                                        #f43f5e ${proteinPct + carbsPct}% 100%
                                                    )`
                                                }}
                                            >
                                                <div className={styles.ringCenter}>
                                                    <span className={styles.ringTotalValue}>{Number(total.toFixed(2))}</span>
                                                    <span className={styles.ringTotalUnit}>g</span>
                                                </div>
                                            </div>
                                            <div className={styles.ringLegend}>
                                                <div className={styles.legendItem}>
                                                    <div className={styles.legendColor} style={{ backgroundColor: '#6366f1' }}></div>
                                                    <span>Protein ({protein}g)</span>
                                                </div>
                                                <div className={styles.legendItem}>
                                                    <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
                                                    <span>Carbs ({carbs}g)</span>
                                                </div>
                                                <div className={styles.legendItem}>
                                                    <div className={styles.legendColor} style={{ backgroundColor: '#f43f5e' }}></div>
                                                    <span>Fat ({fat}g)</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
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
                            )}
                        </div>
                    </div>

                    {showScrollIndicator && (
                        <div className={styles.scrollIndicator}>
                            <span>▼</span>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

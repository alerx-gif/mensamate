'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Facility } from '@/types/eth';
import { useAllergens } from '@/lib/useAllergens';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, X, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
    onClose: () => void;
}

const ALL_LOCATIONS = ['Zentrum', 'Hönggerberg', 'Oerlikon', 'UZH', 'Other'];
const LOCATION_GROUP_ORDER = ['Zentrum', 'Hönggerberg', 'UZH', 'Other'];

const THEMES = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
    { value: 'system', label: 'System', Icon: Monitor },
] as const;

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const { knownAllergens, selectedAllergens, toggleAllergen, fetchAndMergeAllergens } = useAllergens();

    const [mounted, setMounted] = useState(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [defaultFacility, setDefaultFacility] = useState('');
    const [visibleLocations, setVisibleLocations] = useState<string[]>(ALL_LOCATIONS);
    const [locationOrder, setLocationOrder] = useState<string[]>(ALL_LOCATIONS);

    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);

    // Escape to dismiss, and keep Tab inside the dialog while it is open.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !panelRef.current) return;

            const focusable = panelRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        // Stop the page behind the dialog from scrolling with it.
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const previouslyFocused = document.activeElement as HTMLElement | null;
        panelRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [onClose]);

    useEffect(() => {
        fetch('/api/facilities')
            .then(res => res.json())
            .then(setFacilities)
            .catch(err => console.error('Failed to fetch facilities', err));

        const savedFacility = localStorage.getItem('defaultFacility');
        if (savedFacility) setDefaultFacility(savedFacility);

        const read = (key: string, fallback: string[]) => {
            try {
                const raw = localStorage.getItem(key);
                return raw ? (JSON.parse(raw) as string[]) : fallback;
            } catch {
                return fallback;
            }
        };
        setLocationOrder(read('locationOrder', ALL_LOCATIONS));
        setVisibleLocations(read('visibleLocations', ALL_LOCATIONS));
    }, []);

    // Allergens are always on screen now, so load them once rather than on expand.
    useEffect(() => {
        fetchAndMergeAllergens();
    }, [fetchAndMergeAllergens]);

    const groupedFacilities = useMemo(() => {
        const groups = facilities.reduce((acc, facility) => {
            const raw = facility.location || 'Other';
            const key = LOCATION_GROUP_ORDER.includes(raw) ? raw : 'Other';
            (acc[key] ||= []).push(facility);
            return acc;
        }, {} as Record<string, Facility[]>);

        return LOCATION_GROUP_ORDER
            .filter(key => groups[key]?.length)
            .map(key => [key, groups[key]] as const);
    }, [facilities]);

    const persistLocations = useCallback((visible: string[], order: string[]) => {
        localStorage.setItem('visibleLocations', JSON.stringify(visible));
        localStorage.setItem('locationOrder', JSON.stringify(order));
        window.dispatchEvent(new Event('locationsUpdated'));
    }, []);

    const handleToggleLocation = (location: string) => {
        const isVisible = visibleLocations.includes(location);
        // Hiding the last one would leave the navigation empty.
        if (isVisible && visibleLocations.length === 1) return;

        const updated = isVisible
            ? visibleLocations.filter(entry => entry !== location)
            : [...visibleLocations, location];

        setVisibleLocations(updated);
        persistLocations(updated, locationOrder);
    };

    const handleMoveLocation = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= locationOrder.length) return;

        const updated = [...locationOrder];
        [updated[index], updated[target]] = [updated[target], updated[index]];

        setLocationOrder(updated);
        persistLocations(visibleLocations, updated);
    };

    const handleSaveDefaultFacility = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setDefaultFacility(value);
        localStorage.setItem('defaultFacility', value);
        document.cookie = `defaultFacility=${value}; path=/; max-age=31536000`;
    };

    return (
        <div className={styles.scrim} onClick={onClose}>
            <div
                ref={panelRef}
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
                tabIndex={-1}
                onClick={event => event.stopPropagation()}
            >
                <header className={styles.header}>
                    <h2 id="settings-title" className={styles.title}>Settings</h2>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close settings">
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.body}>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Appearance</h3>
                        {mounted && (
                            <div className={styles.segmented} role="radiogroup" aria-label="Appearance">
                                {THEMES.map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={theme === value}
                                        className={`${styles.segment} ${theme === value ? styles.segmentActive : ''}`}
                                        onClick={() => setTheme(value)}
                                    >
                                        <Icon size={18} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Default restaurant</h3>
                        <p className={styles.sectionHint}>Opens here when you launch the app.</p>
                        <select
                            className={styles.select}
                            value={defaultFacility}
                            onChange={handleSaveDefaultFacility}
                            aria-label="Default restaurant"
                        >
                            <option value="">No default</option>
                            {groupedFacilities.map(([location, group]) => (
                                <optgroup key={location} label={location}>
                                    {group.map(facility => (
                                        <option key={facility.id} value={facility.id}>{facility.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Locations</h3>
                        <p className={styles.sectionHint}>Choose which groups appear in the navigation, and their order.</p>
                        <ul className={styles.locationList}>
                            {locationOrder.map((location, index) => {
                                const isVisible = visibleLocations.includes(location);
                                const isLastVisible = isVisible && visibleLocations.length === 1;
                                return (
                                    <li key={location} className={styles.locationRow}>
                                        <label className={styles.locationLabel}>
                                            <input
                                                type="checkbox"
                                                className={styles.checkbox}
                                                checked={isVisible}
                                                disabled={isLastVisible}
                                                onChange={() => handleToggleLocation(location)}
                                            />
                                            <span>{location}</span>
                                        </label>
                                        <div className={styles.reorder}>
                                            <button
                                                type="button"
                                                className={styles.reorderButton}
                                                onClick={() => handleMoveLocation(index, -1)}
                                                disabled={index === 0}
                                                aria-label={`Move ${location} up`}
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.reorderButton}
                                                onClick={() => handleMoveLocation(index, 1)}
                                                disabled={index === locationOrder.length - 1}
                                                aria-label={`Move ${location} down`}
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            Allergens
                            <span className={styles.badge}>Beta</span>
                        </h3>
                        <p className={styles.sectionHint}>
                            Meals containing anything you select are flagged with a warning.
                        </p>
                        {knownAllergens.length === 0 ? (
                            <p className={styles.muted}>Loading allergens…</p>
                        ) : (
                            <div className={styles.chips}>
                                {knownAllergens.map(allergen => {
                                    const isSelected = selectedAllergens.includes(allergen.desc);
                                    return (
                                        <label
                                            key={`${allergen.code}-${allergen.desc}`}
                                            className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={styles.visuallyHidden}
                                                checked={isSelected}
                                                onChange={() => toggleAllergen(allergen.desc)}
                                            />
                                            {allergen.desc}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
}

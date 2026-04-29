'use client';

import { useState, useEffect, useCallback } from 'react';
import { Allergen } from '@/types/eth';

export function useAllergens() {
    const [knownAllergens, setKnownAllergens] = useState<Allergen[]>([]);
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadFromStorage = useCallback(() => {
        try {
            const savedKnown = localStorage.getItem('knownAllergens');
            if (savedKnown) {
                setKnownAllergens(JSON.parse(savedKnown));
            }

            const savedSelected = localStorage.getItem('selectedAllergens');
            if (savedSelected) {
                setSelectedAllergens(JSON.parse(savedSelected));
            }
        } catch (e) {
            console.error('Failed to load allergens from localStorage', e);
        }
    }, []);

    const fetchAndMergeAllergens = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/allergens');
            if (!res.ok) throw new Error('Failed to fetch allergens');
            
            const data: { allergens: Allergen[] } = await res.json();
            
            setKnownAllergens(current => {
                const mergedMap = new Map<string, Allergen>();
                
                // Add existing
                current.forEach(a => mergedMap.set(a.desc.toLowerCase(), a));
                
                // Add new (overwrites existing, which is fine, might update code)
                data.allergens.forEach(a => mergedMap.set(a.desc.toLowerCase(), a));
                
                const merged = Array.from(mergedMap.values())
                    .sort((a, b) => a.desc.localeCompare(b.desc));
                
                localStorage.setItem('knownAllergens', JSON.stringify(merged));
                return merged;
            });
        } catch (error) {
            console.error('Error in fetchAndMergeAllergens:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load and setup listeners
    useEffect(() => {
        loadFromStorage();
        setIsLoading(false);

        const handleUpdate = () => {
            loadFromStorage();
        };

        window.addEventListener('allergensUpdated', handleUpdate);
        return () => window.removeEventListener('allergensUpdated', handleUpdate);
    }, [loadFromStorage]);

    const toggleAllergen = useCallback((allergenDesc: string) => {
        setSelectedAllergens(current => {
            const isSelected = current.includes(allergenDesc);
            const updated = isSelected 
                ? current.filter(desc => desc !== allergenDesc)
                : [...current, allergenDesc];
            
            localStorage.setItem('selectedAllergens', JSON.stringify(updated));
            // Dispatch event so other components (like MenuCard) update instantly
            window.dispatchEvent(new Event('allergensUpdated'));
            return updated;
        });
    }, []);

    // Helper to check if a meal's allergens overlap with selected allergens
    const hasSelectedAllergen = useCallback((mealAllergens?: Allergen[]) => {
        if (!mealAllergens || mealAllergens.length === 0 || selectedAllergens.length === 0) {
            return false;
        }
        
        return mealAllergens.some(a => 
            selectedAllergens.some(selected => selected.toLowerCase() === a.desc?.toLowerCase())
        );
    }, [selectedAllergens]);

    // Format list of triggering allergens for a tooltip
    const getTriggeringAllergens = useCallback((mealAllergens?: Allergen[]) => {
        if (!mealAllergens) return [];
        
        return mealAllergens
            .filter(a => selectedAllergens.some(selected => selected.toLowerCase() === a.desc?.toLowerCase()))
            .map(a => a.desc);
    }, [selectedAllergens]);


    return {
        knownAllergens,
        selectedAllergens,
        isLoading,
        fetchAndMergeAllergens,
        toggleAllergen,
        hasSelectedAllergen,
        getTriggeringAllergens
    };
}

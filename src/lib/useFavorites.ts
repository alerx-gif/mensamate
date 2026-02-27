'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Favorite {
    id: string;
    user_id: string;
    facility_id: number;
    menu_id: string;
    name?: string;
    description?: string;
    label?: string;
    image_url?: string;
    nutrition?: any;
}

export function useFavorites() {
    const { session, isLoading: isAuthLoading } = useAuth();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        async function fetchFavorites() {
            if (!session?.user) {
                if (mounted) {
                    setFavorites([]);
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            const { data, error } = await supabase
                .from('favorites')
                .select('*');

            if (!error && mounted && data) {
                setFavorites(data);
            }

            if (mounted) {
                setIsLoading(false);
            }
        }

        if (!isAuthLoading) {
            fetchFavorites();
        }

        return () => {
            mounted = false;
        };
    }, [session, isAuthLoading]);

    const toggleFavorite = useCallback(async (facility_id: number, menu_id: string | number, name?: string, description?: string, label?: string, image_url?: string, nutrition?: any) => {
        if (!session?.user) return; // Silent return if not logged in

        const menuIdStr = String(menu_id);
        const isFavorite = favorites.some(f => String(f.facility_id) === String(facility_id) && f.menu_id === menuIdStr);

        if (isFavorite) {
            // Optimistic update
            const targetFav = favorites.find(f => String(f.facility_id) === String(facility_id) && f.menu_id === menuIdStr);
            if (targetFav) {
                setFavorites(prev => prev.filter(f => f.id !== targetFav.id));
                await supabase.from('favorites').delete().eq('id', targetFav.id);
            }
        } else {
            // Optimistic update with fake ID
            const tempId = Math.random().toString(36).substring(7);
            const newFav: Favorite = { id: tempId, user_id: session.user.id, facility_id, menu_id: menuIdStr, name, description, label, image_url, nutrition };
            setFavorites(prev => [...prev, newFav]);

            const { data, error } = await supabase
                .from('favorites')
                .insert([{ user_id: session.user.id, facility_id, menu_id: menuIdStr, name, description, label, image_url, nutrition }])
                .select()
                .single();

            if (!error && data) {
                setFavorites(prev => prev.map(f => f.id === tempId ? data : f));
            } else {
                // Revert optimistic update
                setFavorites(prev => prev.filter(f => f.id !== tempId));
            }
        }
    }, [favorites, session, supabase]);

    const isFavorite = useCallback((facility_id: number, menu_id: string | number) => {
        return favorites.some(f => String(f.facility_id) === String(facility_id) && f.menu_id === String(menu_id));
    }, [favorites]);

    return { favorites, isLoading, toggleFavorite, isFavorite };
}

/**
 * Unified client that merges ETH and UZH facilities and routes
 * menu requests to the appropriate data source.
 */

import { Facility, WeeklyRota, WeeklyPlan } from '@/types/eth';
import { getFacilities as getEthFacilities, getDailyMenu as getEthDailyMenu, getWeeklyMenu as getEthWeeklyMenu, getOpeningHours as getEthOpeningHours } from './eth-client';
import { getUzhFacilities, getUzhDailyMenu, getUzhWeeklyMenu, isUzhFacility } from './uzh-client';
import type { OpeningHours } from '@/types/eth';

/**
 * Get all facilities from both ETH and UZH.
 */
export async function getAllFacilities(lang: 'de' | 'en' = 'de'): Promise<Facility[]> {
    const [ethFacilities, uzhFacilities] = await Promise.all([
        getEthFacilities(lang),
        Promise.resolve(getUzhFacilities()),
    ]);

    return [...ethFacilities, ...uzhFacilities];
}

/**
 * Get daily menu — routes to ETH or UZH client based on facility ID.
 */
export async function getDailyMenu(
    facilityId: number,
    date: string,
    lang: 'de' | 'en' = 'de'
): Promise<WeeklyRota | null> {
    if (isUzhFacility(facilityId)) {
        return getUzhDailyMenu(facilityId, date);
    }
    return getEthDailyMenu(facilityId, date, lang);
}

/**
 * Get weekly menu — routes to ETH or UZH client based on facility ID.
 */
export async function getWeeklyMenu(
    facilityId: number,
    date: string,
    lang: 'de' | 'en' = 'de'
): Promise<WeeklyPlan | null> {
    if (isUzhFacility(facilityId)) {
        return getUzhWeeklyMenu(facilityId, date);
    }
    return getEthWeeklyMenu(facilityId, date, lang);
}

/**
 * Get opening hours — only available for ETH facilities.
 * UZH facilities don't have this data via Food2050.
 */
export async function getOpeningHours(
    facilityId: number,
    date: string,
    lang: 'de' | 'en' = 'de'
): Promise<OpeningHours[]> {
    if (isUzhFacility(facilityId)) {
        return []; // UZH opening hours not available via Food2050
    }
    return getEthOpeningHours(facilityId, date, lang);
}

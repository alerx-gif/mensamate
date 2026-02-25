import { Facility, Meal, Price, Allergen, Nutrition, WeeklyRota, WeeklyPlan, DayMenu } from '@/types/eth';

// ─── UZH Restaurant → Food2050 URL Mapping ───────────────────────────────────
// Each entry maps a UZH facility to its Food2050 weekly menu URL.
// IDs use the 1000+ range to avoid collisions with ETH facility IDs.

export interface UzhFacilityConfig {
    id: number;
    name: string;
    shortName: string;
    location: string; // 'UZH Zentrum' | 'UZH Irchel' | 'UZH Other'
    food2050WeeklyUrl: string;
    food2050DetailUrlBase: string; // base for per-meal detail pages
}

export const UZH_FACILITIES: UzhFacilityConfig[] = [
    // ── UZH Zentrum ──
    {
        id: 1001,
        name: 'Obere Mensa UZH',
        shortName: 'Obere Mensa',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-zentrum/obere-mensa/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-zentrum/obere-mensa/mittagsverpflegung',
    },
    {
        id: 1002,
        name: 'Untere Mensa UZH',
        shortName: 'Untere Mensa',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-zentrum/untere-mensa/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-zentrum/untere-mensa/mittagsverpflegung',
    },
    {
        id: 1003,
        name: 'Lichthof Zentrum',
        shortName: 'Lichthof',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-zentrum/lichthof/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-zentrum/lichthof/mittagsverpflegung',
    },
    {
        id: 1004,
        name: 'Rämi59',
        shortName: 'Rämi59',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,rami-59/rami-59/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,rami-59/rami-59/mittagsverpflegung',
    },

    // ── UZH Irchel ──
    {
        id: 1010,
        name: 'Mensa Irchel',
        shortName: 'Mensa Irchel',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-irchel/mensa/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-irchel/mensa/mittagsverpflegung',
    },
    {
        id: 1011,
        name: 'Seerose Irchel',
        shortName: 'Seerose',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/uni-irchel/seerose/menu/seerose/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/uni-irchel/seerose/menu/seerose',
    },
    {
        id: 1012,
        name: 'Green Kitchen Lab Irchel',
        shortName: 'Green Kitchen',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/uni-irchel/green-kitchen/menu/green-kitchen/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/uni-irchel/green-kitchen/menu/green-kitchen',
    },
    {
        id: 1013,
        name: 'The YARD',
        shortName: 'The YARD',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-irchel,ks-oerlikon/the-yard/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-irchel,ks-oerlikon/the-yard/mittagsverpflegung',
    },

    // ── UZH Other ──
    {
        id: 1020,
        name: 'Mensa Oerlikon (Binzmühle)',
        shortName: 'Mensa Oerlikon',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-oerlikon/mensa-binzmuhle/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,campus-oerlikon/mensa-binzmuhle/mittagsverpflegung',
    },
    {
        id: 1021,
        name: 'Cityport Mensa',
        shortName: 'Cityport',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,cityport/cityport/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,cityport/cityport/mittagsverpflegung',
    },
    {
        id: 1022,
        name: 'ZZM Mensa',
        shortName: 'ZZM',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,zentrum-fur-zahnmedizin/zzm/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,zentrum-fur-zahnmedizin/zzm/mittagsverpflegung',
    },
    {
        id: 1023,
        name: 'Tierspital Mensa',
        shortName: 'Tierspital',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,tierspital-1/tierspital/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,tierspital-1/tierspital/mittagsverpflegung',
    },
    {
        id: 1024,
        name: 'Botanischer Garten',
        shortName: 'Bot. Garten',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,botanischer-garten/botanischer-garten/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,botanischer-garten/botanischer-garten/mittagsverpflegung',
    },
    {
        id: 1025,
        name: 'Platte14',
        shortName: 'Platte14',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,platte-14/platte-14/mittagsverpflegung/menu/weekly',
        food2050DetailUrlBase: 'https://app.food2050.ch/de/v2/zfv/universitat-zurich,platte-14/platte-14/mittagsverpflegung',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isUzhFacility(facilityId: number): boolean {
    return facilityId >= 1000;
}

export function getUzhConfig(facilityId: number): UzhFacilityConfig | undefined {
    return UZH_FACILITIES.find(f => f.id === facilityId);
}

// ─── Facilities ───────────────────────────────────────────────────────────────

export function getUzhFacilities(): Facility[] {
    return UZH_FACILITIES.map(f => ({
        id: f.id,
        name: f.name,
        shortName: f.shortName,
        nameDe: f.name,
        nameEn: f.name,
        type: 'Mensa / Restaurant',
        location: f.location,
    }));
}

// ─── Food2050 Data Parsing ────────────────────────────────────────────────────

/**
 * Fetch a Food2050 page and extract __NEXT_DATA__ JSON.
 */
async function fetchFood2050Data(url: string): Promise<any | null> {
    try {
        const res = await fetch(url, { next: { revalidate: 300 } });
        if (!res.ok) {
            console.error(`[UZH] Food2050 fetch failed: ${res.status} for ${url}`);
            return null;
        }

        const html = await res.text();

        // Extract __NEXT_DATA__ JSON
        const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (!match) {
            console.error('[UZH] No __NEXT_DATA__ found in Food2050 page');
            return null;
        }

        return JSON.parse(match[1]);
    } catch (error) {
        console.error('[UZH] Error fetching Food2050 data:', error);
        return null;
    }
}

/**
 * Map Food2050 category name to a dietary type string.
 */
function mapCategory(categoryName: string): string | undefined {
    const lower = categoryName.toLowerCase();
    if (lower === 'garden') return 'Vegan';
    if (lower === 'farm') return 'Vegetarisch';
    return undefined; // butcher, hit, voll anders, etc. are meat
}

/**
 * Map a Food2050 dish+menuItem to our Meal type.
 */
function mapDishToMeal(menuItem: any, fallbackId: number): Meal {
    const dish = menuItem.dish;
    const categoryName = menuItem.category?.name || '';
    const stats = dish.stats || {};

    // Prices (only available on detail pages)
    const prices: Price = { student: 0, staff: 0, external: 0 };
    if (menuItem.prices) {
        for (const p of menuItem.prices) {
            const label = p.priceCategory?.name?.toLowerCase() || '';
            const amount = parseFloat(p.amount) || 0;
            if (label.includes('studier')) prices.student = amount;
            else if (label.includes('mitarbeit')) prices.staff = amount;
            else if (label.includes('extern')) prices.external = amount;
        }
    }

    // Allergens
    const allergens: Allergen[] = (dish.allergens || []).map((a: any, idx: number) => ({
        code: idx,
        desc: a.allergen?.name || a.allergen?.externalId || 'Unknown',
    }));

    // Nutrition
    const nutrition: Nutrition = {
        energy: stats.energy?.amount ? Math.round(stats.energy.amount * 4.184) : undefined, // kcal → kJ
        protein: stats.protein?.amount,
        fat: stats.fat?.amount,
        carbohydrates: stats.carbohydrates?.amount,
        sugar: stats.sugar?.amount,
        salt: stats.salt?.amount,
    };

    // Determine dietary type
    let type = mapCategory(categoryName);
    if (!type) {
        if (dish.isVegan) type = 'Vegan';
        else if (dish.isVegetarian) type = 'Vegetarisch';
    }

    // Split Food2050's combined name into title + description
    // e.g. "Paniertes Schweinsschnitzel, Ketchup, Pommes frites, Menüsalat"
    //   → name: "Paniertes Schweinsschnitzel"
    //   → description: "Ketchup, Pommes frites, Menüsalat"
    const fullName = dish.name || 'Menu';
    const commaIndex = fullName.indexOf(',');
    let mealName: string;
    let mealDescription: string;

    if (commaIndex !== -1) {
        mealName = fullName.substring(0, commaIndex).trim();
        mealDescription = fullName.substring(commaIndex + 1).trim();
    } else {
        mealName = fullName;
        mealDescription = '';
    }

    return {
        id: fallbackId,
        label: categoryName || 'Menu',
        name: mealName,
        description: mealDescription,
        prices,
        imageId: undefined, // UZH uses direct image URLs, not IDs
        type,
        line: categoryName,
        allergens,
        nutrition,
        imageUrl: dish.imageUrl || undefined,
        detailUrl: menuItem.detailUrl || undefined,
    };
}

// ─── Daily Menu ───────────────────────────────────────────────────────────────

/**
 * Get daily menu for a UZH facility by scraping the Food2050 weekly page
 * and filtering to the requested date.
 */
export async function getUzhDailyMenu(
    facilityId: number,
    date: string
): Promise<WeeklyRota | null> {
    const config = getUzhConfig(facilityId);
    if (!config) return null;

    try {
        const data = await fetchFood2050Data(config.food2050WeeklyUrl);
        if (!data) return null;

        const pageProps = data.props?.pageProps;
        const daily = pageProps?.organisation?.outlet?.menuCategory?.calendar?.week?.daily;
        if (!daily || !Array.isArray(daily)) return null;

        // Find the day matching the requested date
        const targetDate = new Date(date);
        const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

        let matchedDay: any = null;
        for (const day of daily) {
            const dayDate = day.from?.dateLocal;
            if (dayDate) {
                const dayDateStr = dayDate.split('T')[0];
                if (dayDateStr === targetDateStr) {
                    matchedDay = day;
                    break;
                }
            }
        }

        if (!matchedDay || !matchedDay.menuItems) return null;

        // Map menu items to Meal objects
        // For the weekly view, we don't have prices/images — fetch detail pages in parallel
        const meals: Meal[] = [];
        const detailFetches: Promise<void>[] = [];

        for (let i = 0; i < matchedDay.menuItems.length; i++) {
            const item = matchedDay.menuItems[i];
            if (item.__typename === 'OutletMenuItemDish') {
                const meal = mapDishToMeal(item, 1000 + i);
                meals.push(meal);

                // Fetch detail page for prices and images
                if (item.detailUrl) {
                    const detailUrl = item.detailUrl;
                    const mealRef = meal;
                    detailFetches.push(
                        fetchFood2050Data(detailUrl).then(detailData => {
                            if (detailData) {
                                const detailItem = detailData.props?.pageProps?.organisation?.outlet?.menuCategory?.menuItem;
                                if (detailItem) {
                                    // Extract prices
                                    if (detailItem.prices) {
                                        for (const p of detailItem.prices) {
                                            const label = p.priceCategory?.name?.toLowerCase() || '';
                                            const amount = parseFloat(p.amount) || 0;
                                            if (label.includes('studier')) mealRef.prices.student = amount;
                                            else if (label.includes('mitarbeit')) mealRef.prices.staff = amount;
                                            else if (label.includes('extern')) mealRef.prices.external = amount;
                                        }
                                    }
                                    // Extract image URL
                                    if (detailItem.dish?.imageUrl) {
                                        (mealRef as any).imageUrl = detailItem.dish.imageUrl;
                                    }
                                    // Extract richer nutrition from detail
                                    const stats = detailItem.dish?.stats;
                                    if (stats) {
                                        mealRef.nutrition = {
                                            energy: stats.energy?.amount ? Math.round(stats.energy.amount * 4.184) : undefined,
                                            protein: stats.protein?.amount,
                                            fat: stats.fat?.amount,
                                            carbohydrates: stats.carbohydrates?.amount,
                                            sugar: stats.sugar?.amount,
                                            salt: stats.salt?.amount,
                                        };
                                    }
                                }
                            }
                        }).catch(() => { /* silently ignore individual detail failures */ })
                    );
                }
            }
        }

        // Wait for all detail fetches
        await Promise.all(detailFetches);

        // Get day name from the data
        const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const dayOfWeek = dayNames[targetDate.getDay()] || 'Tag';

        return {
            id: facilityId * 100 + targetDate.getDay(),
            facilityId: facilityId,
            validFrom: targetDateStr,
            dayOfWeek,
            meals,
        };
    } catch (error) {
        console.error('[UZH] Error getting daily menu:', error);
        return null;
    }
}

// ─── Weekly Menu ──────────────────────────────────────────────────────────────

/**
 * Get weekly menu for a UZH facility.
 */
export async function getUzhWeeklyMenu(
    facilityId: number,
    date: string
): Promise<WeeklyPlan | null> {
    const config = getUzhConfig(facilityId);
    if (!config) return null;

    try {
        const data = await fetchFood2050Data(config.food2050WeeklyUrl);
        if (!data) return null;

        const pageProps = data.props?.pageProps;
        const daily = pageProps?.organisation?.outlet?.menuCategory?.calendar?.week?.daily;
        if (!daily || !Array.isArray(daily)) return null;

        const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const days: DayMenu[] = [];

        for (const day of daily) {
            if (!day.menuItems || day.menuItems.length === 0) continue;

            const dayDate = day.from?.dateLocal;
            const dateObj = dayDate ? new Date(dayDate) : new Date();
            const dayOfWeek = dayNames[dateObj.getDay()] || 'Tag';

            const meals: Meal[] = day.menuItems
                .filter((item: any) => item.__typename === 'OutletMenuItemDish')
                .map((item: any, idx: number) => mapDishToMeal(item, facilityId * 1000 + idx));

            if (meals.length > 0) {
                days.push({ dayOfWeek, meals });
            }
        }

        return {
            id: facilityId * 100,
            facilityId,
            validFrom: date,
            days,
        };
    } catch (error) {
        console.error('[UZH] Error getting weekly menu:', error);
        return null;
    }
}

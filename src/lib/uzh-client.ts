import { Facility, Meal, Price, Allergen, Nutrition, WeeklyRota, WeeklyPlan, DayMenu } from '@/types/eth';
import { parseFlightDocument, findNode, type FlightDocument } from './food2050-flight';

// ─── UZH Restaurant → Food2050 URL Mapping ───────────────────────────────────
// Each entry maps a UZH facility to its Food2050 weekly menu URL.
// IDs use the 1000+ range to avoid collisions with ETH facility IDs.

export interface UzhFacilityConfig {
    id: number;
    name: string;
    shortName: string;
    location: string; // 'UZH Zentrum' | 'UZH Irchel' | 'UZH Other'
    food2050WeeklyUrl: string;
}

export const UZH_FACILITIES: UzhFacilityConfig[] = [
    // ── UZH Zentrum ──
    {
        id: 1001,
        name: 'Obere Mensa UZH',
        shortName: 'Obere Mensa',
        location: 'UZH',
        // Food2050 renamed this outlet's category from `mittagsverpflegung` to
        // `lunch`; the old URL still answers 200 but with `menuCategory: null`.
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,campus-zentrum/obere-mensa/lunch/menu/weekly',
    },
    {
        id: 1002,
        name: 'Untere Mensa UZH',
        shortName: 'Untere Mensa',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,campus-zentrum/untere-mensa/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1003,
        name: 'Lichthof Zentrum',
        shortName: 'Lichthof',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,campus-zentrum/lichthof/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1004,
        name: 'Rämi59',
        shortName: 'Rämi59',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,rami-59/rami-59/mittagsverpflegung/menu/weekly',
    },

    // ── UZH Irchel ──
    {
        id: 1010,
        name: 'Mensa Irchel',
        shortName: 'Mensa Irchel',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,campus-irchel/mensa/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1011,
        name: 'Seerose Irchel',
        shortName: 'Seerose',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/uni-irchel/seerose/menu/seerose/weekly',
    },
    {
        id: 1012,
        name: 'Green Kitchen Lab Irchel',
        shortName: 'Green Kitchen',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,campus-irchel/green-kitchen-lab/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1013,
        name: 'The YARD',
        shortName: 'The YARD',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,campus-irchel,ks-oerlikon/the-yard/mittagsverpflegung/menu/weekly',
    },

    // ── UZH Other ──
    {
        id: 1020,
        name: 'Mensa Oerlikon (Binzmühle)',
        shortName: 'Mensa Oerlikon',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,campus-oerlikon/mensa-binzmuhle/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1021,
        name: 'Cityport Mensa',
        shortName: 'Cityport',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,cityport/cityport/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1022,
        name: 'ZZM Mensa',
        shortName: 'ZZM',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,zentrum-fur-zahnmedizin/zzm/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1023,
        name: 'Tierspital Mensa',
        shortName: 'Tierspital',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,tierspital-1/tierspital/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1024,
        name: 'Botanischer Garten',
        shortName: 'Bot. Garten',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,botanischer-garten/botanischer-garten/mittagsverpflegung/menu/weekly',
    },
    {
        id: 1025,
        name: 'Platte14',
        shortName: 'Platte14',
        location: 'UZH',
        food2050WeeklyUrl: 'https://app.food2050.ch/de/zfv/universitat-zurich,platte-14/platte-14/mittagsverpflegung/menu/weekly',
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
 * Shape of the pieces of the Food2050 GraphQL payload we actually read.
 * Everything is optional: this is a third-party payload we do not control, and
 * a missing branch has to degrade to "no data" rather than throw.
 */
interface F2050Measurement {
    amount?: number;
    unit?: string;
}

interface F2050Stats {
    energy?: F2050Measurement;
    protein?: F2050Measurement;
    fat?: F2050Measurement;
    saturatedFat?: F2050Measurement;
    carbohydrates?: F2050Measurement;
    sugar?: F2050Measurement;
    salt?: F2050Measurement;
}

interface F2050Dish {
    id?: string;
    name?: string;
    description?: string;
    imageUrl?: string;
    isVegan?: boolean;
    isVegetarian?: boolean;
    stats?: F2050Stats;
    allergens?: { allergen?: { name?: string; externalId?: string } }[];
}

interface F2050MenuItem {
    __typename?: string;
    id?: string;
    detailUrl?: string;
    category?: { name?: string };
    dish?: F2050Dish;
    prices?: { amount?: string; priceCategory?: { name?: string } }[];
}

interface F2050Day {
    from?: { dateLocal?: string };
    menuItems?: F2050MenuItem[];
}

interface F2050Outlet {
    menuCategory?: { calendar?: { week?: { daily?: F2050Day[] } } };
}

/**
 * How long a fetched Food2050 page stays warm. Caching happens at the `fetch`
 * layer rather than around the parsed result on purpose: a parse failure then
 * costs one bad render instead of being frozen in for the full window, so the
 * app recovers as soon as upstream does.
 */
const FOOD2050_REVALIDATE = 7200;

/** Raised when a page loads but carries no payload we can read. */
class Food2050FormatError extends Error {
    constructor(url: string) {
        super(`[UZH] No readable menu at ${url} — Food2050's page format or this outlet's menu category slug has likely changed`);
        this.name = 'Food2050FormatError';
    }
}

/**
 * ISO 8601 week and week-year of a YYYY-MM-DD date. Computed in UTC so the
 * server's own timezone cannot shift the day.
 */
function isoWeekOf(date: string): { week: number; year: number } {
    const d = new Date(`${date}T00:00:00Z`);
    // Move to the Thursday of this week: its year is the ISO week-year.
    const weekday = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - weekday);
    const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
    return { week, year: d.getUTCFullYear() };
}

/**
 * The weekly page for the week containing `date`.
 *
 * The bare weekly URL always means "the current week", so its cached copy goes
 * stale at the week boundary: the first visitors each Monday were served last
 * week's payload, which has no entry for today, and saw "No menus today" until
 * the background revalidation landed. Pinning the week in the URL gives every
 * week its own cache entry.
 */
function weeklyUrlFor(config: UzhFacilityConfig, date: string): string {
    const { week, year } = isoWeekOf(date);
    return `${config.food2050WeeklyUrl}?week=${week}&year=${year}`;
}

/**
 * Fetch a Food2050 page and return its parsed RSC flight payload.
 *
 * Throws Food2050FormatError when the page is served but carries nothing we can
 * read, so that a format change is distinguishable from a mensa that simply has
 * no menu today. Callers turn that into an empty result *and* a loud log rather
 * than silently showing an empty plate.
 */
async function fetchFood2050Document(url: string): Promise<FlightDocument | null> {
    const res = await fetch(url, { next: { revalidate: FOOD2050_REVALIDATE } });
    if (!res.ok) {
        console.error(`[UZH] Food2050 fetch failed: ${res.status} for ${url}`);
        return null;
    }

    const doc = parseFlightDocument(await res.text());
    if (!doc) throw new Food2050FormatError(url);
    return doc;
}

/**
 * Locate a node by shape rather than by flight row id — ids are assigned in
 * streaming order and are not stable across pages or deployments.
 *
 * Only the matched subtree is hydrated. The payload deduplicates repeated
 * objects (allergens, categories) into `$`-path references, which without that
 * step arrive as literal "$7:props:..." strings.
 */
function selectNode<T>(
    doc: FlightDocument,
    predicate: (node: Record<string, unknown>) => boolean
): T | undefined {
    const node = findNode(doc.rows, predicate);
    return node ? (doc.hydrate(node) as T) : undefined;
}

/** The weekly page's outlet node, holding one entry per day of the week. */
function selectOutlet(doc: FlightDocument): F2050Outlet | undefined {
    return selectNode<F2050Outlet>(doc, node => {
        const menuCategory = node.menuCategory as F2050Outlet['menuCategory'];
        return Array.isArray(menuCategory?.calendar?.week?.daily);
    });
}

/**
 * A dish detail page's menu item. Detail pages have no weekly calendar, so they
 * are matched on carrying the `prices` array the weekly payload lacks — which
 * is the reason to fetch them at all.
 */
function selectDetailItem(doc: FlightDocument): F2050MenuItem | undefined {
    return selectNode<F2050MenuItem>(doc, node =>
        node.__typename === 'OutletMenuItemDish' && Array.isArray(node.prices)
    );
}

/**
 * Food2050 `externalId` → the ETH feed's German allergen wording.
 *
 * The weekly payload carries only the id, and the detail payload's German
 * `name` differs from the ETH feed's ("Sojabohne" vs "Soja"), so neither is
 * usable as-is. The saved allergen filter matches on this text and its
 * selectable options come from the ETH facilities (see /api/allergens), so a
 * UZH meal is only ever filterable if it uses the exact ETH spelling.
 *
 * Two ids have no ETH counterpart and are deliberately widened rather than kept
 * verbatim: `wheat` and `kamut` are both gluten-bearing cereals, and since the
 * filter offers no "Weizen" option a user avoiding gluten would otherwise miss
 * a dish tagged only with those. Over-flagging is the safe direction here, and
 * mapAllergens dedupes the result when a dish carries several of them.
 */
const ALLERGEN_NAMES_DE: Record<string, string> = {
    celery: 'Sellerie',
    cerealsContainingGluten: 'Gluten',
    eggs: 'Ei',
    fish: 'Fisch',
    kamut: 'Gluten',
    milk: 'Milch, Laktose',
    mustard: 'Senf',
    nuts: 'Schalenfrüchte',
    peanuts: 'Erdnüsse',
    sesame: 'Sesam',
    soybeans: 'Soja',
    sulphites: 'Sulfite',
    wheat: 'Gluten',
};

function mapAllergens(dish: F2050Dish | undefined): Allergen[] {
    const seen = new Set<string>();
    const allergens: Allergen[] = [];

    for (const entry of dish?.allergens ?? []) {
        const externalId = entry.allergen?.externalId;
        const desc = (externalId && ALLERGEN_NAMES_DE[externalId])
            || entry.allergen?.name
            || externalId;
        if (!desc) continue;

        const key = desc.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        // The ETH feed supplies real numeric allergen codes; Food2050 has none,
        // so index order stands in. Only `desc` is used for matching.
        allergens.push({ code: allergens.length, desc });
    }

    return allergens;
}

/** Map a Food2050 category name to a dietary type string. */
function mapCategory(categoryName: string): string | undefined {
    const lower = categoryName.toLowerCase();
    if (lower === 'garden') return 'Vegan';
    if (lower === 'farm') return 'Vegetarisch';
    return undefined; // butcher, hit, voll anders, etc. are meat
}

function mapNutrition(stats: F2050Stats | undefined): Nutrition {
    if (!stats) return {};

    // `amount` is per serving, which is what the ETH feed reports too.
    // Food2050 gives energy in kcal while the UI stores kJ and divides by
    // 4.184 to display kcal, so convert unless upstream already sent kJ.
    let energy: number | undefined;
    if (typeof stats.energy?.amount === 'number') {
        energy = stats.energy.unit?.toLowerCase() === 'kj'
            ? Math.round(stats.energy.amount)
            : Math.round(stats.energy.amount * 4.184);
    }

    return {
        energy,
        protein: stats.protein?.amount,
        fat: stats.fat?.amount,
        saturatedFat: stats.saturatedFat?.amount,
        carbohydrates: stats.carbohydrates?.amount,
        sugar: stats.sugar?.amount,
        salt: stats.salt?.amount,
    };
}

function mapPrices(menuItem: F2050MenuItem): Price {
    const prices: Price = { student: 0, staff: 0, external: 0 };

    for (const p of menuItem.prices ?? []) {
        const label = p.priceCategory?.name?.toLowerCase() || '';
        const amount = parseFloat(p.amount ?? '') || 0;
        if (label.includes('studier')) prices.student = amount;
        else if (label.includes('mitarbeit')) prices.staff = amount;
        else if (label.includes('extern')) prices.external = amount;
    }

    return prices;
}

/**
 * Map a Food2050 menu item to our Meal type.
 *
 * Note that `name` and `description` are separate fields in the payload. An
 * earlier version split a single combined string on its first comma; doing that
 * now would truncate names that legitimately contain one.
 */
function mapDishToMeal(menuItem: F2050MenuItem, id: number): Meal {
    const dish = menuItem.dish ?? {};
    const categoryName = menuItem.category?.name || '';

    let type = mapCategory(categoryName);
    if (!type) {
        if (dish.isVegan) type = 'Vegan';
        else if (dish.isVegetarian) type = 'Vegetarisch';
    }

    return {
        id,
        label: categoryName || 'Menu',
        name: dish.name || 'Menu',
        description: dish.description || '',
        prices: mapPrices(menuItem),
        imageId: undefined, // UZH uses direct image URLs, not IDs
        type,
        line: categoryName,
        allergens: mapAllergens(dish),
        nutrition: mapNutrition(dish.stats),
        imageUrl: dish.imageUrl || undefined,
        detailUrl: menuItem.detailUrl || undefined,
    };
}

const DAY_NAMES_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

/** The calendar date a day entry covers, as YYYY-MM-DD in Food2050's own local time. */
function dayDate(day: F2050Day): string | undefined {
    return day.from?.dateLocal?.split('T')[0];
}

function dishItems(day: F2050Day): F2050MenuItem[] {
    return (day.menuItems ?? []).filter(item => item.__typename === 'OutletMenuItemDish');
}

// ─── Daily Menu ───────────────────────────────────────────────────────────────

/**
 * Get the daily menu for a UZH facility.
 *
 * The weekly page carries names, categories and allergens but no prices,
 * images or nutrition — those live on each dish's detail page, so the selected
 * day's items are enriched in parallel. Detail pages are per-day URLs, so only
 * the handful for the requested day are fetched, and each one is cached by the
 * same fetch layer as the weekly page.
 */
export async function getUzhDailyMenu(
    facilityId: number,
    date: string
): Promise<WeeklyRota | null> {
    const config = getUzhConfig(facilityId);
    if (!config) return null;

    try {
        const weeklyUrl = weeklyUrlFor(config, date);
        const doc = await fetchFood2050Document(weeklyUrl);
        if (!doc) return null;

        const outlet = selectOutlet(doc);
        if (!outlet) throw new Food2050FormatError(weeklyUrl);

        const daily = outlet.menuCategory?.calendar?.week?.daily;
        if (!daily) return null;

        const day = daily.find(d => dayDate(d) === date);
        if (!day) return null;

        const items = dishItems(day);
        const meals = items.map((item, index) => mapDishToMeal(item, facilityId * 1000 + index));

        await Promise.all(items.map(async (item, index) => {
            if (!item.detailUrl) return;
            try {
                const detailDoc = await fetchFood2050Document(item.detailUrl);
                const detailItem = detailDoc && selectDetailItem(detailDoc);
                if (!detailItem) return;

                const meal = meals[index];
                meal.prices = mapPrices(detailItem);
                meal.imageUrl = detailItem.dish?.imageUrl || meal.imageUrl;
                meal.nutrition = mapNutrition(detailItem.dish?.stats);
                // The detail payload lists allergens the weekly summary omits.
                const detailAllergens = mapAllergens(detailItem.dish);
                if (detailAllergens.length) meal.allergens = detailAllergens;
            } catch {
                // One unavailable detail page should not cost us the whole day's
                // menu — the meal keeps its weekly-page fields.
            }
        }));

        return {
            id: facilityId * 100 + new Date(date).getDay(),
            facilityId,
            validFrom: date,
            dayOfWeek: DAY_NAMES_DE[new Date(date).getDay()] || 'Tag',
            meals,
        };
    } catch (error) {
        console.error('[UZH] Error getting daily menu:', error);
        return null;
    }
}

// ─── Weekly Menu ──────────────────────────────────────────────────────────────

/**
 * Get the weekly menu for a UZH facility.
 *
 * Deliberately does not fetch detail pages: that would be one request per dish
 * per day (~15 for a week, per facility) to fill in prices the weekly grid does
 * not show.
 */
export async function getUzhWeeklyMenu(
    facilityId: number,
    date: string
): Promise<WeeklyPlan | null> {
    const config = getUzhConfig(facilityId);
    if (!config) return null;

    try {
        const weeklyUrl = weeklyUrlFor(config, date);
        const doc = await fetchFood2050Document(weeklyUrl);
        if (!doc) return null;

        const outlet = selectOutlet(doc);
        if (!outlet) throw new Food2050FormatError(weeklyUrl);

        const daily = outlet.menuCategory?.calendar?.week?.daily;
        if (!daily) return null;

        const days: DayMenu[] = [];

        for (const day of daily) {
            const items = dishItems(day);
            if (items.length === 0) continue;

            const iso = dayDate(day);
            // Parse as UTC midnight so the weekday cannot shift under a server
            // running in a timezone behind Zurich.
            const weekday = iso ? new Date(`${iso}T00:00:00Z`).getUTCDay() : new Date().getDay();

            days.push({
                dayOfWeek: DAY_NAMES_DE[weekday] || 'Tag',
                meals: items.map((item, index) => mapDishToMeal(item, facilityId * 1000 + index)),
            });
        }

        return { id: facilityId * 100, facilityId, validFrom: date, days };
    } catch (error) {
        console.error('[UZH] Error getting weekly menu:', error);
        return null;
    }
}

import { Facility, WeeklyRota, Meal, FacilityResponseRaw, WeeklyRotaResponseRaw, Price, WeeklyPlan, DayMenu } from '@/types/eth';

const API_BASE = 'https://idapps.ethz.ch/cookpit-pub-services/v1';
const CLIENT_ID = 'ethz-wcms';

export async function getFacilities(lang: 'de' | 'en' = 'de'): Promise<Facility[]> {
    try {
        const url = `${API_BASE}/facilities?client-id=${CLIENT_ID}&lang=${lang}&rs-first=0&rs-size=200`;
        const res = await fetch(url, { next: { revalidate: 3600 } });

        if (!res.ok) {
            console.error(`Fetch facilities failed: ${res.status} ${res.statusText}`);
            throw new Error('Failed to fetch facilities');
        }

        const data: FacilityResponseRaw = await res.json();

        if (data["facility-array"]) {
            return data["facility-array"].map(f => {
                let location = 'Other';
                const facilityUrl = f["facility-url"] || '';

                if (facilityUrl.includes('/zentrum/')) location = 'Zentrum';
                else if (facilityUrl.includes('/hoenggerberg/')) location = 'Hönggerberg';
                else if (facilityUrl.includes('/basel/')) location = 'Basel';
                else if (facilityUrl.includes('/oerlikon/')) location = 'Oerlikon';

                // Map manager name
                const managerGiven = (f as any)["manager-given-name"];
                const managerSurname = (f as any)["manager-surname"];
                const managerName = managerGiven && managerSurname
                    ? `${managerGiven} ${managerSurname}`
                    : undefined;

                // Map payment options
                const paymentOptions = (f as any)["payment-option-array"]?.map((p: any) => ({
                    code: p.code,
                    desc: p.desc,
                    descShort: p["desc-short"]
                })) || [];

                // Map features
                const features = (f as any)["facility-feature-array"]?.map((feat: any) => ({
                    code: feat.code,
                    desc: feat.desc,
                    descShort: feat["desc-short"]
                })) || [];

                return {
                    id: f["facility-id"],
                    name: f["facility-name"],
                    shortName: f["facility-name"],
                    nameDe: f["facility-name"],
                    nameEn: f["facility-name"],
                    type: f["publication-type-desc"],
                    location: location,
                    // Extended details
                    building: (f as any).building,
                    floor: (f as any).floor,
                    roomNr: (f as any)["room-nr"],
                    addressLine2: (f as any)["address-line-2"],
                    addressLine3: (f as any)["address-line-3"],
                    phone: (f as any).phone,
                    facilityUrl: facilityUrl || undefined,
                    catererName: (f as any)["caterer-name"],
                    catererUrl: (f as any)["caterer-url"],
                    managerName: managerName,
                    paymentOptions: paymentOptions,
                    features: features
                };
            });
        }

        return [];
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return [];
    }
}

/**
 * Helper function to extract meals from the deeply nested API structure.
 * Structure: day -> opening-hour-array -> meal-time-array -> line-array -> meal
 */
function extractMealsFromDay(dayData: any): Meal[] {
    const meals: Meal[] = [];

    if (!dayData["opening-hour-array"]) return meals;

    for (const openingHour of dayData["opening-hour-array"]) {
        if (!openingHour["meal-time-array"]) continue;

        for (const mealTime of openingHour["meal-time-array"]) {
            if (!mealTime["line-array"]) continue;

            for (const line of mealTime["line-array"]) {
                const menu = line["meal"];
                if (!menu) continue;

                const prices: Price = { student: 0, staff: 0, external: 0 };
                // API uses "meal-price-array" not "price-array"
                const priceArray = menu["meal-price-array"] || menu["price-array"];
                if (priceArray) {
                    for (const p of priceArray) {
                        if (p["customer-group-desc"] === "Studierende") prices.student = p.price;
                        // API uses "Interne" not "Mitarbeitende"
                        if (p["customer-group-desc"] === "Interne" || p["customer-group-desc"] === "Mitarbeitende") prices.staff = p.price;
                        if (p["customer-group-desc"] === "Extern" || p["customer-group-desc"] === "Externe") prices.external = p.price;
                    }
                }

                // API provides image-url directly, extract ID from it or use as-is
                const imageUrl = menu["image-url"];
                const imageId = imageUrl ? parseInt(imageUrl.split('/').pop() || '0', 10) : undefined;

                meals.push({
                    id: menu["line-id"] || imageId || Math.random(),
                    label: line.name || mealTime.name || "Lunch",
                    name: menu.name || "Menu",
                    description: menu.description || "",
                    prices: prices,
                    imageId: imageId,
                    type: menu["meal-class-array"]?.[0]?.desc,
                    line: line.name,
                    allergens: menu["allergen-array"]?.map((a: any) => ({
                        code: a.code || 0,
                        desc: a.desc || a.name || "Unknown"
                    })) || [],
                    nutrition: {
                        energy: menu["energy"] ? parseFloat(menu["energy"]) : undefined,
                        protein: menu["protein"] ? parseFloat(menu["protein"]) : undefined,
                        fat: menu["fat"] ? parseFloat(menu["fat"]) : undefined,
                        saturatedFat: menu["saturated-fatty-acids"] ? parseFloat(menu["saturated-fatty-acids"]) : undefined,
                        carbohydrates: menu["carbohydrates"] ? parseFloat(menu["carbohydrates"]) : undefined,
                        sugar: menu["sugar"] ? parseFloat(menu["sugar"]) : undefined,
                        salt: menu["salt"] ? parseFloat(menu["salt"]) : undefined,
                    }
                });
            }
        }
    }

    return meals;
}

export async function getDailyMenu(
    facilityId: number,
    date: string,
    lang: 'de' | 'en' = 'de'
): Promise<WeeklyRota | null> {
    if (!facilityId) return null;

    try {
        // Calculate week range (API returns whole week, we filter to requested day)
        const inputDate = new Date(date);
        const day = inputDate.getDay();
        const diff = inputDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(inputDate);
        monday.setDate(diff);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);

        const validAfter = monday.toISOString().split('T')[0];
        const validBefore = nextMonday.toISOString().split('T')[0];

        const url = `${API_BASE}/weeklyrotas?client-id=${CLIENT_ID}&lang=${lang}&facility=${facilityId}&valid-after=${validAfter}&valid-before=${validBefore}&rs-first=0&rs-size=50`;

        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) {
            console.error(`Fetch menu failed for facility ${facilityId}: ${res.status} ${res.statusText}`);
            return null;
        }

        const text = await res.text();
        if (!text) return null;

        const data: WeeklyRotaResponseRaw = JSON.parse(text);

        if (!data["weekly-rota-array"] || data["weekly-rota-array"].length === 0) return null;

        const rawRota = data["weekly-rota-array"][0];

        // Map input date to API day code (1=Mon, ..., 7=Sun)
        const dateObj = new Date(date);
        const jsDay = dateObj.getDay();
        const apiDayCode = jsDay === 0 ? 7 : jsDay;

        let meals: Meal[] = [];
        let dayOfWeekName = "Day";

        if (rawRota["day-of-week-array"]) {
            const dayData = rawRota["day-of-week-array"].find(d => d["day-of-week-code"] === apiDayCode);
            if (dayData) {
                dayOfWeekName = dayData["day-of-week-desc"] || "Day";
                meals = extractMealsFromDay(dayData);
            }
        }

        return {
            id: rawRota["weekly-rota-id"],
            facilityId: rawRota["facility-id"],
            validFrom: rawRota["valid-from"],
            dayOfWeek: dayOfWeekName,
            meals: meals
        };

    } catch (error) {
        console.error('Error fetching daily menu:', error);
        return null;
    }
}

export async function getWeeklyMenu(
    facilityId: number,
    date: string,
    lang: 'de' | 'en' = 'de'
): Promise<WeeklyPlan | null> {
    if (!facilityId) return null;

    try {
        // Calculate the Monday and Sunday of the requested week
        const inputDate = new Date(date);
        const day = inputDate.getDay();
        const diff = inputDate.getDate() - day + (day === 0 ? -6 : 1);

        const monday = new Date(inputDate);
        monday.setDate(diff);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);

        const validAfter = monday.toISOString().split('T')[0];
        const validBefore = nextMonday.toISOString().split('T')[0];

        console.log(`[getWeeklyMenu] Fetching for facility ${facilityId}, range: ${validAfter} to ${validBefore}`);

        const url = `${API_BASE}/weeklyrotas?client-id=${CLIENT_ID}&lang=${lang}&facility=${facilityId}&valid-after=${validAfter}&valid-before=${validBefore}&rs-first=0&rs-size=50`;

        const res = await fetch(url, { next: { revalidate: 300 } });
        if (!res.ok) {
            console.error(`[getWeeklyMenu] Fetch failed: ${res.status}`);
            return null;
        }

        const text = await res.text();
        if (!text) return null;

        const data: WeeklyRotaResponseRaw = JSON.parse(text);

        if (!data["weekly-rota-array"] || data["weekly-rota-array"].length === 0) {
            console.log(`[getWeeklyMenu] No weekly rotas found.`);
            return null;
        }

        const rawRota = data["weekly-rota-array"][0];
        console.log(`[getWeeklyMenu] Rota found: ${rawRota["weekly-rota-id"]}, days: ${rawRota["day-of-week-array"]?.length}`);

        const days: DayMenu[] = [];

        if (rawRota["day-of-week-array"]) {
            const sortedDays = rawRota["day-of-week-array"].sort((a, b) =>
                a["day-of-week-code"] - b["day-of-week-code"]
            );

            for (const dayData of sortedDays) {
                const dayMeals = extractMealsFromDay(dayData);

                if (dayMeals.length > 0) {
                    days.push({
                        dayOfWeek: dayData["day-of-week-desc"],
                        meals: dayMeals
                    });
                }
            }
        }

        return {
            id: rawRota["weekly-rota-id"],
            facilityId: rawRota["facility-id"],
            validFrom: rawRota["valid-from"],
            days: days
        };

    } catch (error) {
        console.error('Error fetching weekly menu:', error);
        return null;
    }
}

export function getImageUrl(imageId: number | undefined): string | null {
    if (!imageId) return null;
    return `${API_BASE}/images/${imageId}?client-id=ethz-monitor&lang=de`;
}

/**
 * Extract opening hours from a weekly rota for a specific day.
 */
export function extractOpeningHours(weeklyRota: WeeklyRota | null, date: string): import('@/types/eth').OpeningHours[] {
    if (!weeklyRota) return [];

    // We need to fetch raw data to get opening hours, but for now we'll return empty
    // since WeeklyRota doesn't contain the raw opening hour data
    return [];
}

/**
 * Get opening hours for a facility on a specific day.
 */
export async function getOpeningHours(
    facilityId: number,
    date: string,
    lang: 'de' | 'en' = 'de'
): Promise<import('@/types/eth').OpeningHours[]> {
    if (!facilityId) return [];

    try {
        const inputDate = new Date(date);
        const day = inputDate.getDay();
        const diff = inputDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(inputDate);
        monday.setDate(diff);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);

        const validAfter = monday.toISOString().split('T')[0];
        const validBefore = nextMonday.toISOString().split('T')[0];

        const url = `${API_BASE}/weeklyrotas?client-id=${CLIENT_ID}&lang=${lang}&facility=${facilityId}&valid-after=${validAfter}&valid-before=${validBefore}&rs-first=0&rs-size=50`;

        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) return [];

        const text = await res.text();
        if (!text) return [];

        const data: WeeklyRotaResponseRaw = JSON.parse(text);
        if (!data["weekly-rota-array"] || data["weekly-rota-array"].length === 0) return [];

        const rawRota = data["weekly-rota-array"][0];

        // Map input date to API day code
        const dateObj = new Date(date);
        const jsDay = dateObj.getDay();
        const apiDayCode = jsDay === 0 ? 7 : jsDay;

        const openingHours: import('@/types/eth').OpeningHours[] = [];

        if (rawRota["day-of-week-array"]) {
            const dayData = rawRota["day-of-week-array"].find(d => d["day-of-week-code"] === apiDayCode);
            if (dayData && dayData["opening-hour-array"]) {
                for (const oh of dayData["opening-hour-array"]) {
                    const mealTimes = oh["meal-time-array"]?.map(mt => ({
                        name: mt.name,
                        timeFrom: mt["time-from"],
                        timeTo: mt["time-to"]
                    })) || [];

                    openingHours.push({
                        timeFrom: oh["time-from"],
                        timeTo: oh["time-to"],
                        mealTimes: mealTimes
                    });
                }
            }
        }

        return openingHours;
    } catch (error) {
        console.error('Error fetching opening hours:', error);
        return [];
    }
}

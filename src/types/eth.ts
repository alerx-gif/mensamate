// API Raw Types (Kebab-case)
export interface FacilityRaw {
    "facility-id": number;
    "facility-name": string;
    "publication-type-desc": string;
    "publication-type-desc-short": string;
    "facility-url"?: string;
}

export interface FacilityResponseRaw {
    "facility-array"?: FacilityRaw[];
}

export interface WeeklyRotaResponseRaw {
    "weekly-rota-array"?: WeeklyRotaRaw[];
}

export interface WeeklyRotaRaw {
    "weekly-rota-id": number;
    "facility-id": number;
    "valid-from": string;
    "day-of-week-array"?: DayOfWeekRaw[];
}

export interface DayOfWeekRaw {
    "day-of-week-code": number;
    "day-of-week-desc": string; // "Montag"
    "day-of-week-desc-short": string;
    "opening-hour-array"?: OpeningHourRaw[];
}

export interface OpeningHourRaw {
    "time-from": string;
    "time-to": string;
    "meal-time-array"?: MealTimeRaw[];
}

export interface MealTimeRaw {
    "name": string; // e.g. "Lunch"
    "time-from": string;
    "time-to": string;
    "line-array"?: LineRaw[];
}

export interface LineRaw {
    "name": string; // e.g. "fire", "grill", "green daily"
    "meal": MealRaw;
}

export interface MealRaw {
    "name": string;
    "description": string;
    "meal-class-desc"?: string;
    "meal-class-code"?: number;
    "price-array"?: PriceRaw[];
    "image-id"?: number;
    "allergen-array"?: any[];
    "origin-array"?: any[];
    // Nutritional info
    "energy"?: string;
    "protein"?: string;
    "fat"?: string;
    "saturated-fatty-acids"?: string;
    "carbohydrates"?: string;
    "sugar"?: string;
    "salt"?: string;
}

export interface PriceRaw {
    "customer-group-desc": string;
    "customer-group-code": number;
    "price": number;
}


// Internal Types
export interface Price {
    student: number;
    staff: number;
    external: number;
}

export interface Allergen {
    code: number;
    desc: string;
}

export interface Nutrition {
    energy?: number;      // kJ
    protein?: number;     // g
    fat?: number;         // g
    saturatedFat?: number; // g
    carbohydrates?: number; // g
    sugar?: number;       // g
    salt?: number;        // g
}

export interface Meal {
    id: number;
    label: string;
    name: string;
    description: string;
    prices: Price;
    imageId?: number;
    type?: string;
    line?: string;
    allergens?: Allergen[];
    nutrition?: Nutrition;
}

export interface DayMenu {
    dayOfWeek: string;
    meals: Meal[];
}

export interface WeeklyPlan {
    id: number;
    facilityId: number;
    validFrom: string;
    days: DayMenu[];
}

export interface WeeklyRota {
    id: number;
    facilityId: number;
    validFrom: string;
    dayOfWeek: string;
    meals: Meal[];
}

export interface Facility {
    id: number;
    name: string;
    shortName: string;
    nameDe: string;
    nameEn: string;
    type: string;
    location: string;
}

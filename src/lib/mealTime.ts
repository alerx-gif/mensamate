import { Meal } from '@/types/eth';

/**
 * The ETH feed has no explicit meal-time field on a meal; dinner lines are
 * marked by "Abend" in their line name (e.g. "STREET ABEND").
 */
export function isDinnerMeal(meal: Meal): boolean {
    return (
        meal.label?.toLowerCase().includes('abend') ||
        meal.name.toLowerCase().includes('abend') ||
        meal.line?.toLowerCase().includes('abend') ||
        false
    );
}

/** Split a day's meals into lunch and dinner, keeping their original order. */
export function splitByMealTime(meals: Meal[]): { lunch: Meal[]; dinner: Meal[] } {
    const lunch: Meal[] = [];
    const dinner: Meal[] = [];
    for (const meal of meals) {
        (isDinnerMeal(meal) ? dinner : lunch).push(meal);
    }
    return { lunch, dinner };
}

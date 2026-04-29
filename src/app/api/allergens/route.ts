import { NextResponse } from 'next/server';
import { getAllFacilities, getWeeklyMenu } from '@/lib/unified-client';
import { Allergen } from '@/types/eth';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const allFacilities = await getAllFacilities('de');

        // Find Target facilities
        const targetNames = ['Food Market', 'Mensa Polyterrasse'];
        const targetFacilities = allFacilities.filter(f => 
            targetNames.some(name => f.name.includes(name))
        );

        if (targetFacilities.length === 0) {
            return NextResponse.json({ allergens: [] });
        }

        const allergenMap = new Map<string, Allergen>();

        // Fetch menus for target facilities and extract allergens
        await Promise.all(
            targetFacilities.map(async (facility) => {
                const weeklyPlan = await getWeeklyMenu(facility.id, today);
                if (!weeklyPlan || !weeklyPlan.days) return;

                weeklyPlan.days.forEach(day => {
                    day.meals.forEach(meal => {
                        if (meal.allergens) {
                            meal.allergens.forEach(allergen => {
                                // Use the description as the primary key since codes might vary or be 0
                                // Clean up the description (e.g. trim whitespace, handle casing if needed)
                                const key = allergen.desc?.trim().toLowerCase();
                                if (key && !allergenMap.has(key)) {
                                    allergenMap.set(key, {
                                        code: allergen.code,
                                        desc: allergen.desc.trim()
                                    });
                                }
                            });
                        }
                    });
                });
            })
        );

        const uniqueAllergens = Array.from(allergenMap.values())
            .sort((a, b) => a.desc.localeCompare(b.desc));

        return NextResponse.json({ allergens: uniqueAllergens });
    } catch (error) {
        console.error('Error fetching allergens:', error);
        return NextResponse.json({ error: 'Failed to fetch allergens' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getDailyMenu } from '@/lib/unified-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facility');
    const date = searchParams.get('date');

    if (!facilityId || !date) {
        return NextResponse.json({ error: 'Missing facilityId or date' }, { status: 400 });
    }

    try {
        const id = parseInt(facilityId, 10);
        // Add a timestamp to bypass fetch caching if needed, though getDailyMenu handles its own revalidation
        const weeklyRota = await getDailyMenu(id, date, 'de');
        return NextResponse.json(weeklyRota?.meals || []);
    } catch (error) {
        console.error('Failed to fetch menu in API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

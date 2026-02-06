import { NextResponse } from 'next/server';
import { getDailyMenuAndOpeningHours } from '@/lib/eth-client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const date = searchParams.get('date');

    if (!facilityId || !date) {
        return NextResponse.json({ error: 'Missing facilityId or date' }, { status: 400 });
    }

    const result = await getDailyMenuAndOpeningHours(parseInt(facilityId, 10), date);

    return NextResponse.json(result, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
    });
}

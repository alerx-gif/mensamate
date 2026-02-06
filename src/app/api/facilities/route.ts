import { NextResponse } from 'next/server';
import { getFacilities } from '@/lib/eth-client';

export async function GET() {
    const facilities = await getFacilities();

    // Sort facilities alphabetically
    facilities.sort((a, b) => {
        const nameA = a.shortName || a.nameDe || a.name || '';
        const nameB = b.shortName || b.nameDe || b.name || '';
        return nameA.localeCompare(nameB);
    });

    return NextResponse.json(facilities, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
    });
}

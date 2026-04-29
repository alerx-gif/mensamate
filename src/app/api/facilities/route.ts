import { NextResponse } from 'next/server';
import { getAllFacilities } from '@/lib/unified-client';

export async function GET() {
    try {
        const facilities = await getAllFacilities();
        return NextResponse.json(facilities);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
    }
}

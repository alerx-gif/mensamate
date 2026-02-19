import { getOpeningHours } from '@/lib/eth-client';
import { Facility } from '@/types/eth';
import FacilityHeader from './FacilityHeader';

interface AsyncFacilityHeaderProps {
    facility: Facility;
    today: string;
    dateString: string;
}

export default async function AsyncFacilityHeader({
    facility,
    today,
    dateString
}: AsyncFacilityHeaderProps) {
    const openingHours = await getOpeningHours(facility.id, today);

    return (
        <FacilityHeader
            facility={facility}
            openingHours={openingHours}
            dateString={dateString}
        />
    );
}

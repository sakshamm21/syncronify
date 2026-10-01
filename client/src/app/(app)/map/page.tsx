import VenueMap from '@/components/map/VenueMap';
import { PageHeader } from '@/components/ui/surface';

export default function MapPage() {
  return (
    <>
      <PageHeader title="Venue map" description="Where things are happening, and what's on at each place." />
      <VenueMap className="lg:min-h-[640px]" />
    </>
  );
}

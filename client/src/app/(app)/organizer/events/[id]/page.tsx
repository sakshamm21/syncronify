import EventManagement from '@/components/organizer/EventManagement';

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventManagement eventId={id} />;
}

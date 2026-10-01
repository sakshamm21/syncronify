import EventManagement from '@/components/adminEvent/EventDetail';

export default async function ManageEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <EventManagement eventId={eventId} />;
}

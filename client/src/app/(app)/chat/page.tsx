import ChatWorkspace from '@/components/chat/ChatWorkspace';
import { PageHeader } from '@/components/ui/surface';

export default function ChatPage() {
  return (
    <>
      <PageHeader title="Chats" description="Talk with organizers and everyone going to your events." />
      <ChatWorkspace />
    </>
  );
}

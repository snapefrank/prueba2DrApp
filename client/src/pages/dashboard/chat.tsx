import { ChatProvider } from '@/hooks/use-chat-websocket';
import { ChatModule } from '@/components/chat/chat-module';
import { Card } from '@/components/ui/card';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <Card className="h-full shadow-sm">
        <ChatProvider>
          <ChatModule containerClass="h-full" />
        </ChatProvider>
      </Card>
    </div>
  );
}
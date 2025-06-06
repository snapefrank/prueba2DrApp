import { useMemo } from 'react';
import { ChatConversation } from '@/hooks/use-chat-websocket';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversationId: number | null;
  onSelectConversation: (conversation: ChatConversation) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation
}: ConversationListProps) {
  // Ordenar conversaciones por último mensaje
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [conversations]);

  // Formatear fecha relativa
  const getRelativeTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: es 
      });
    } catch (e) {
      return '';
    }
  };

  if (sortedConversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">
          No hay conversaciones disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y">
        {sortedConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`flex items-start gap-3 p-3 cursor-pointer ${
              selectedConversationId === conversation.id
                ? 'bg-accent'
                : 'hover:bg-muted'
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            {/* Avatar de usuario */}
            {conversation.otherUser?.profileImage ? (
              <img
                src={conversation.otherUser.profileImage}
                alt={conversation.otherUser.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                {conversation.otherUser?.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Información de la conversación */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-medium truncate">
                  {conversation.otherUser?.name}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {conversation.lastMessageAt
                    ? getRelativeTime(conversation.lastMessageAt)
                    : getRelativeTime(conversation.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.otherUser?.userType === 'doctor' ? 'Médico' : 'Paciente'}
                </p>
                {conversation.unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
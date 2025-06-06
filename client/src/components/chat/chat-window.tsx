import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChatConversation, Message } from '@/hooks/use-chat-websocket';
import { useAuth } from '@/hooks/use-auth';
import { MessageInput } from './message-input';
import { ChatMessage } from './chat-message';

interface ChatWindowProps {
  conversation: ChatConversation;
  messages: Message[];
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', fileInfo?: { url: string; name: string; size: number }) => void;
  loading?: boolean;
  onBack?: () => void;
  mobileView?: boolean;
}

// Agrupar mensajes por día
function groupMessagesByDate(messages: Message[]): [string, Message[]][] {
  const groups: Record<string, Message[]> = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt);
    const day = format(date, 'yyyy-MM-dd');
    
    if (!groups[day]) {
      groups[day] = [];
    }
    
    groups[day].push(message);
  });
  
  return Object.entries(groups).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
}

export function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  loading = false,
  onBack,
  mobileView = false
}: ChatWindowProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileUploading, setFileUploading] = useState(false);

  // Formatear fecha para encabezado
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return format(date, 'EEEE, d MMMM', { locale: es });
    }
  };
  
  // Formatear hora para mensajes
  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm');
  };
  
  // Scroll al fondo cuando llegan nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Manejar envío de mensajes
  const handleSendMessage = (content: string) => {
    onSendMessage(content);
  };
  
  // Manejar subida de archivo
  const handleFileUpload = (
    fileUrl: string, 
    fileName: string, 
    fileSize: number,
    fileType: string
  ) => {
    setFileUploading(false);
    
    // Determinar el tipo de archivo
    const isImage = fileType.startsWith('image/');
    const messageType = isImage ? 'image' : 'file';
    
    // Crear mensaje con el archivo
    onSendMessage(
      isImage ? fileUrl : `[Archivo: ${fileName}]`,
      messageType,
      {
        url: fileUrl,
        name: fileName,
        size: fileSize
      }
    );
  };
  
  // Agrupar mensajes por fecha
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera */}
      <div className="p-4 border-b flex items-center gap-3">
        {mobileView && onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
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
        
        <div>
          <h3 className="font-medium">{conversation.otherUser?.name}</h3>
          <p className="text-xs text-muted-foreground">
            {conversation.otherUser?.userType === 'doctor' ? 'Médico' : 'Paciente'}
          </p>
        </div>
      </div>
      
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          messageGroups.map(([date, groupMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                  {formatDateHeader(date)}
                </span>
              </div>
              
              {groupMessages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    isOwn={isOwn}
                  />
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Entrada de mensaje */}
      <div className="border-t p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onStartUploading={() => setFileUploading(true)}
          onFileUploaded={handleFileUpload}
          isUploading={fileUploading}
          conversationId={conversation.id}
        />
      </div>
    </div>
  );
}
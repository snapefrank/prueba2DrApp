import { format } from 'date-fns';
import { FileIcon, FileTextIcon, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/hooks/use-chat-websocket';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm');
  };
  
  // Formato para mostrar tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Determinar estado de entrega del mensaje
  const getMessageStatus = () => {
    if (message.isRead) return 'leído';
    if (message.isDelivered) return 'entregado';
    return 'enviado';
  };
  
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={message.fileUrl}
                alt="Imagen"
                className="rounded-md max-w-full max-h-[300px] object-contain bg-background/50"
              />
              <Badge
                variant="secondary"
                className="absolute bottom-2 right-2 bg-background/70 text-foreground"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Imagen
              </Badge>
            </div>
          </div>
        );
        
      case 'file':
        return (
          <div className="flex items-center gap-2 p-2 rounded-md bg-background/60">
            <FileIcon className="h-8 w-8 text-blue-500" />
            <div className="min-w-0 flex-1">
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium block truncate hover:underline"
              >
                {message.fileName || 'Archivo'}
              </a>
              <div className="text-xs text-muted-foreground">
                {message.fileSize ? formatFileSize(message.fileSize) : ''}
              </div>
            </div>
            <FileTextIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        );
        
      default:
        return (
          <div className="whitespace-pre-wrap">{message.content}</div>
        );
    }
  };
  
  return (
    <div
      className={cn(
        "flex mb-3 last:mb-0 group",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {renderMessageContent()}
        <div className="flex justify-between items-center mt-1 text-xs opacity-70">
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && (
            <span className="ml-2">{getMessageStatus()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, KeyboardEvent } from 'react';
import { Paperclip, Send, Loader2, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onStartUploading?: () => void;
  onFileUploaded?: (fileUrl: string, fileName: string, fileSize: number, fileType: string) => void;
  isUploading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  conversationId: number;
}

export function MessageInput({
  onSendMessage,
  onStartUploading,
  onFileUploaded,
  isUploading = false,
  disabled = false,
  placeholder = 'Escribe un mensaje...',
  conversationId
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Hook para subir archivos
  const { uploadFile, uploading, progress } = useFileUpload({
    endpoint: `/api/chat/${conversationId}/upload`,
    onSuccess: (data) => {
      onFileUploaded?.(
        data.fileUrl,
        data.fileName,
        data.fileSize,
        data.fileType
      );
    },
    maxSizeMB: 10 // 10MB
  });
  
  // Manejar envío de mensajes
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isUploading) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Enfocar nuevamente el textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  
  // Manejar tecla Enter para enviar
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Manejar subida de archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setPopoverOpen(false);
    onStartUploading?.();
    
    try {
      await uploadFile(file);
    } catch (error) {
      console.error('Error al subir archivo:', error);
    } finally {
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      e.target.value = '';
    }
  };
  
  // Abrir selector de archivos
  const triggerFileSelect = (type: 'file' | 'image') => {
    if (type === 'file' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === 'image' && imageInputRef.current) {
      imageInputRef.current.click();
    }
    setPopoverOpen(false);
  };
  
  // Auto-crecer textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Resetear altura
    e.target.style.height = 'auto';
    
    // Establecer nueva altura basada en el contenido (con un máximo)
    const maxHeight = 150;
    const newHeight = Math.min(e.target.scrollHeight, maxHeight);
    e.target.style.height = `${newHeight}px`;
  };
  
  return (
    <div className="relative">
      {/* Progreso de carga */}
      {(uploading || isUploading) && (
        <div className="absolute inset-x-0 -top-2 transform -translate-y-full p-2 bg-background rounded-md border shadow-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Subiendo archivo...</span>
          </div>
          <Progress className="mt-2" value={progress} />
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {/* Textarea para el mensaje */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="w-full resize-none bg-muted/40 border rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px] max-h-[150px] overflow-auto"
            rows={1}
          />
        </div>
        
        {/* Botón de archivos */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled || isUploading}
              className="h-10 w-10 rounded-full"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2">
            <div className="grid gap-1">
              <Button
                variant="ghost"
                className="flex justify-start"
                onClick={() => triggerFileSelect('image')}
              >
                <Image className="mr-2 h-4 w-4" />
                <span>Imagen</span>
              </Button>
              <Button
                variant="ghost"
                className="flex justify-start"
                onClick={() => triggerFileSelect('file')}
              >
                <File className="mr-2 h-4 w-4" />
                <span>Archivo</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Botón de enviar */}
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled || isUploading}
          className="h-10 w-10 rounded-full"
        >
          <Send className="h-5 w-5" />
        </Button>
        
        {/* Inputs de archivo ocultos */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
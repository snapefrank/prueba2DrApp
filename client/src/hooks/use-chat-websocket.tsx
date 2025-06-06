import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { WebSocket as WebSocketPolyfill } from 'ws';

// Extender la interfaz global Window
declare global {
  interface Window {
    _chatWebSocket: WebSocket | null;
    _chatWebSocketConnected: boolean;
    _chatWebSocketUserId: number | null;
    WebSocket: typeof WebSocket;
  }
}

// Inicializar propiedades globales si no existen
if (typeof window !== 'undefined') {
  // Solo inicializar en el navegador
  window._chatWebSocket = window._chatWebSocket || null;
  window._chatWebSocketConnected = window._chatWebSocketConnected || false;
  window._chatWebSocketUserId = window._chatWebSocketUserId || null;
}

// Use native WebSocket in browser, polyfill in Node
const WebSocketImpl = typeof window !== 'undefined' ? window.WebSocket : WebSocketPolyfill;

// Typings para Chat
export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isDelivered: boolean;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  senderName?: string;
  senderType?: string;
  senderProfileImage?: string;
}

export interface ChatConversation {
  id: number;
  doctorId: number;
  patientId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  otherUser: {
    id: number;
    name: string;
    userType: string;
    profileImage?: string;
  };
  unreadCount: number;
}

interface ChatContextType {
  connecting: boolean;
  connected: boolean;
  conversations: ChatConversation[];
  messages: Record<number, Message[]>;
  fetchConversations: () => void;
  fetchMessages: (conversationId: number, limit?: number) => void;
  sendMessage: (
    conversationId: number, 
    content: string, 
    type?: 'text' | 'image' | 'file',
    fileInfo?: { url: string; name: string; size: number }
  ) => void;
  markMessageAsRead: (messageId: number) => void;
  createConversation: (userId: number, userType: string) => Promise<number>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  
  // Conectar al WebSocket solo si no existe una conexión previa o ha cambiado de usuario
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Verificar si el usuario ha cambiado
    const userChanged = window._chatWebSocketUserId !== null && window._chatWebSocketUserId !== user.id;
    
    // Si el usuario ha cambiado, cerrar la conexión anterior
    if (userChanged && window._chatWebSocket) {
      console.log(`Usuario cambiado de ${window._chatWebSocketUserId} a ${user.id}, reconectando...`);
      if (window._chatWebSocket.readyState === WebSocketImpl.OPEN) {
        window._chatWebSocket.close();
      }
      window._chatWebSocket = null;
      window._chatWebSocketConnected = false;
    }
    
    // Registrar el ID de usuario actual
    window._chatWebSocketUserId = user.id;
    
    // Singleton para limitar múltiples conexiones WebSocket
    if (window._chatWebSocket && !userChanged) {
      console.log('Reutilizando conexión WebSocket existente');
      setSocket(window._chatWebSocket);
      setConnected(window._chatWebSocketConnected || false);
      setConnecting(false);
      return;
    }
    
    const MAX_RECONNECT_ATTEMPTS = 5;
    
    const connect = () => {
      try {
        setConnecting(true);
        
        // Determinar URL del WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Construir URL para WebSocket considerando entorno de Replit
        let wsUrl = '';
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';
        
        // Detectar si estamos en Replit
        const isReplit = hostname.includes('.replit.app') || 
                        hostname.includes('.replit.dev') || 
                        hostname.includes('.repl.co');
        
        // Detectar si estamos en una URL generada por Replit (e672b065-...)
        const parts = hostname.split('.');
        const isReplitGenerated = parts.length > 0 && parts[0].includes('-');
        
        // Log de depuración
        console.log(`Conectando WebSocket. Hostname: ${hostname}, isReplit: ${isReplit}, isReplitGenerated: ${isReplitGenerated}`);
        
        // Construir URL según el entorno
        if (isReplit) {
          // Asegurarnos de conectar siempre al host principal en Replit, sin subdominios
          // ya que los WebSockets necesitan una conexión directa
          if (isReplitGenerated) {
            // Si es una URL generada por Replit, mantener la misma
            wsUrl = `${protocol}//${hostname}${port}/ws`;
          } else {
            // Si es un subdominio personalizado en Replit, extraer el dominio base
            // Ejemplo: de "doctor.replit.app" a "replit.app"
            const baseDomain = parts.slice(1).join('.');
            wsUrl = `${protocol}//${hostname}${port}/ws`;
          }
          
          console.log(`URL de WebSocket en Replit: ${wsUrl}`);
        } else {
          // En entorno de desarrollo o producción normal
          wsUrl = `${protocol}//${window.location.host}/ws`;
          console.log(`URL de WebSocket estándar: ${wsUrl}`);
        }
        
        // Ya se verificó al inicio del efecto, esta comprobación redundante se elimina
        
        const ws = new WebSocketImpl(wsUrl);
        window._chatWebSocket = ws; // Guardar la instancia a nivel global
        console.log('WebSocket creado con URL:', wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket conectado');
          // Autenticar inmediatamente después de conectar
          ws.send(JSON.stringify({
            type: 'authenticate',
            payload: {
              userId: user.id,
              userType: user.userType
            }
          }));
        };
        
        ws.onclose = (event: CloseEvent) => {
          console.log('WebSocket desconectado, código:', event.code);
          setConnected(false);
          setSocket(null);
          window._chatWebSocketConnected = false;
          
          // Si es un cierre limpio, limpiar la instancia global
          if (event.code === 1000 || event.code === 1001) {
            window._chatWebSocket = null;
          }
          // Reconectar si no fue un cierre limpio y no hemos excedido intentos máximos
          else if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const newAttempt = reconnectAttempts + 1;
            setReconnectAttempts(newAttempt);
            console.log(`Intentando reconectar (${newAttempt}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(connect, 1000 * Math.min(newAttempt, 5)); // Backoff exponencial máx 5 segundos
          }
        };
        
        ws.onerror = (error: Event) => {
          console.error('Error de WebSocket:', error);
        };
        
        ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'welcome':
                // Mensaje inicial, no necesita acción específica
                break;
                
              case 'auth_success':
                setConnected(true);
                window._chatWebSocketConnected = true; // Guardar el estado de conexión a nivel global
                setConnecting(false);
                setReconnectAttempts(0);
                break;
                
              case 'error':
                console.error('Error del servidor WebSocket:', data.message);
                toast({
                  title: 'Error de chat',
                  description: data.message,
                  variant: 'destructive',
                });
                break;
                
              case 'conversations':
                setConversations(data.conversations || []);
                break;
                
              case 'messages':
                setMessages(prev => ({
                  ...prev,
                  [data.conversationId]: data.messages || []
                }));
                break;
                
              case 'new_message':
                handleNewMessage(data.message);
                break;
                
              case 'message_sent':
                handleNewMessage(data.message);
                break;
                
              case 'message_read':
                const messageId = data.messageId;
                
                setMessages(prev => {
                  // Buscar la conversación que contiene este mensaje
                  const conversationId = Object.keys(prev).find(convId => 
                    prev[Number(convId)].some(msg => msg.id === messageId)
                  );
                  
                  if (conversationId) {
                    const convId = Number(conversationId);
                    return {
                      ...prev,
                      [convId]: prev[convId].map(msg => 
                        msg.id === messageId ? { ...msg, isRead: true } : msg
                      )
                    };
                  }
                  
                  return prev;
                });
                break;
                
              case 'conversation_created':
                setConversations(prev => {
                  const exists = prev.some(c => c.id === data.conversation.id);
                  if (exists) return prev;
                  return [...prev, data.conversation];
                });
                break;
                
              default:
                console.log('Mensaje no manejado:', data);
            }
          } catch (error) {
            console.error('Error al procesar mensaje de WebSocket:', error);
          }
        };
        
        setSocket(ws);
      } catch (error) {
        console.error('Error al conectar WebSocket:', error);
        setConnecting(false);
      }
    };
    
    connect();
    
    // Limpiar (component unmount)
  return () => {
      // No cerramos la conexión global al desmontar el componente
      // Ahora usamos el patrón singleton para mantenerla
    };
  }, [user, reconnectAttempts, toast]);
  
  // Manejar mensajes nuevos
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const conversationMessages = prev[message.conversationId] || [];
      const exists = conversationMessages.some(msg => msg.id === message.id);
      
      if (exists) {
        // Actualizar mensaje existente
        return {
          ...prev,
          [message.conversationId]: conversationMessages.map(msg => 
            msg.id === message.id ? { ...msg, ...message } : msg
          )
        };
      } else {
        // Agregar nuevo mensaje
        return {
          ...prev,
          [message.conversationId]: [...conversationMessages, message]
        };
      }
    });
    
    // Actualizar contador de no leídos en la conversación
    if (message.senderId !== user?.id && !message.isRead) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === message.conversationId 
            ? { ...conv, unreadCount: conv.unreadCount + 1 } 
            : conv
        )
      );
    }
  }, [user?.id]);
  
  // Obtener conversaciones
  const fetchConversations = useCallback(() => {
    if (!socket || socket.readyState !== WebSocketImpl.OPEN || !connected) return;
    
    socket.send(JSON.stringify({
      type: 'get_conversations'
    }));
  }, [socket, connected]);
  
  // Obtener mensajes de una conversación
  const fetchMessages = useCallback((conversationId: number, limit: number = 50) => {
    if (!socket || socket.readyState !== WebSocketImpl.OPEN || !connected) return;
    
    socket.send(JSON.stringify({
      type: 'get_messages',
      conversationId,
      limit
    }));
    
    // Al cargar mensajes, actualizar el contador de no leídos en la conversación
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 } 
          : conv
      )
    );
  }, [socket, connected]);
  
  // Enviar mensaje
  const sendMessage = useCallback((
    conversationId: number, 
    content: string, 
    type: 'text' | 'image' | 'file' = 'text',
    fileInfo?: { url: string; name: string; size: number }
  ) => {
    if (!socket || socket.readyState !== WebSocketImpl.OPEN || !connected) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Revisa tu conexión.',
        variant: 'destructive',
      });
      return;
    }
    
    socket.send(JSON.stringify({
      type: 'message',
      conversationId,
      content,
      messageType: type,
      ...(fileInfo ? {
        fileUrl: fileInfo.url,
        fileName: fileInfo.name,
        fileSize: fileInfo.size
      } : {})
    }));
  }, [socket, connected, toast]);
  
  // Marcar mensaje como leído
  const markMessageAsRead = useCallback((messageId: number) => {
    if (!socket || socket.readyState !== WebSocketImpl.OPEN || !connected) return;
    
    socket.send(JSON.stringify({
      type: 'read_message',
      messageId
    }));
  }, [socket, connected]);
  
  // Crear nueva conversación
  const createConversation = useCallback((userId: number, userType: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!socket || socket.readyState !== WebSocketImpl.OPEN || !connected) {
        toast({
          title: 'Error',
          description: 'No se pudo crear la conversación. Revisa tu conexión.',
          variant: 'destructive',
        });
        reject(new Error('No conectado'));
        return;
      }
      
      // Determinar IDs para la conversación
      const doctorId = userType === 'doctor' ? userId : user?.id;
      const patientId = userType === 'patient' ? userId : user?.id;
      
      // Almacenar una referencia al handler para resolver la promesa
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'conversation_created') {
            socket.removeEventListener('message', messageHandler);
            resolve(data.conversation.id);
          } else if (data.type === 'error') {
            socket.removeEventListener('message', messageHandler);
            reject(new Error(data.message));
          }
        } catch (error) {
          // Ignorar errores de parsing
        }
      };
      
      // Añadir handler temporal
      socket.addEventListener('message', messageHandler);
      
      // Enviar solicitud para crear conversación
      socket.send(JSON.stringify({
        type: 'create_conversation',
        doctorId,
        patientId
      }));
      
      // Timeout para rechazar después de 5 segundos
      setTimeout(() => {
        socket.removeEventListener('message', messageHandler);
        reject(new Error('Tiempo de espera agotado'));
      }, 5000);
    });
  }, [socket, connected, user?.id, toast]);
  
  return (
    <ChatContext.Provider value={{
      connecting,
      connected,
      conversations,
      messages,
      fetchConversations,
      fetchMessages,
      sendMessage,
      markMessageAsRead,
      createConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatWebSocket() {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChatWebSocket debe usarse dentro de un ChatProvider');
  }
  
  return context;
}
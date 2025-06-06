import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquarePlus, Search, User2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useChatWebSocket, type ChatConversation } from '@/hooks/use-chat-websocket';
import { ChatWindow } from './chat-window';
import { ConversationList } from './conversation-list';
import { EmptyState } from './empty-state';
import { UserSearch } from './patient-search';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';

interface ChatModuleProps {
  containerClass?: string;
}

export function ChatModule({ containerClass = '' }: ChatModuleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    connecting,
    connected,
    conversations,
    messages,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    createConversation
  } = useChatWebSocket();
  
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showingNewChat, setShowingNewChat] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(() => {
    return localStorage.getItem('chatDisclaimerAccepted') === 'true';
  });
  const [showDisclaimer, setShowDisclaimer] = useState(!disclaimerAccepted);
  
  // Cargar conversaciones al iniciar
  useEffect(() => {
    if (connected) {
      fetchConversations();
    }
  }, [connected, fetchConversations]);
  
  // Filtrar conversaciones
  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Seleccionar una conversación
  const handleSelectConversation = (conversation: ChatConversation) => {
    setIsLoadingMessages(true);
    setSelectedConversation(conversation);
    setShowingNewChat(false);
    setShowMobileChat(true);
    
    // Obtener mensajes
    fetchMessages(conversation.id);
    
    // Marcar mensajes como leídos
    const conversationMessages = messages[conversation.id] || [];
    conversationMessages.forEach(msg => {
      if (msg.senderId !== user?.id && !msg.isRead) {
        markMessageAsRead(msg.id);
      }
    });
    
    setIsLoadingMessages(false);
  };
  
  // Enviar mensaje
  const handleSendMessage = (
    content: string, 
    type: 'text' | 'image' | 'file' = 'text',
    fileInfo?: { url: string; name: string; size: number }
  ) => {
    if (!selectedConversation) return;
    
    sendMessage(selectedConversation.id, content, type, fileInfo);
  };
  
  // Buscar usuarios para nuevo chat
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Buscar el tipo opuesto al usuario actual
      const userTypeToSearch = user?.userType === 'doctor' ? 'patient' : 'doctor';
      
      const response = await apiRequest(
        'GET', 
        `/api/users/search?query=${encodeURIComponent(searchQuery)}&userType=${userTypeToSearch}`
      );
      const data = await response.json();
      
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los resultados de búsqueda',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Comprobar si se puede crear chat con un usuario
  const checkCanChatWithUser = async (userId: number) => {
    try {
      const response = await apiRequest('GET', `/api/chat/can-chat/${userId}`);
      const data = await response.json();
      
      if (!data.canChat) {
        toast({
          title: 'No es posible crear un chat',
          description: data.reason || 'No puedes iniciar un chat con este usuario',
          variant: 'destructive',
        });
        return false;
      }
      
      // Si ya existe un chat, redirigir a ese chat
      if (data.hasExistingChat && data.chatId) {
        const existingConv = conversations.find(c => c.id === data.chatId);
        if (existingConv) {
          handleSelectConversation(existingConv);
          return false; // No crear nuevo chat
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al verificar posibilidad de chat:', error);
      toast({
        title: 'Error',
        description: 'No se pudo verificar si es posible crear un chat con este usuario',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Iniciar nuevo chat
  const startNewChat = async (targetUser: any) => {
    // Verificar si se puede crear un chat con este usuario
    const canChat = await checkCanChatWithUser(targetUser.id);
    if (!canChat) return;
    
    try {
      // Determinar quién es el doctor y quién es el paciente
      let doctorId, patientId;
      
      if (user?.userType === 'doctor') {
        doctorId = user.id;
        patientId = targetUser.id;
      } else {
        doctorId = targetUser.id;
        patientId = user?.id;
      }
      
      // Crear la conversación
      const conversationId = await createConversation(targetUser.id, targetUser.userType);
      
      // Refrescar la lista de conversaciones
      fetchConversations();
      
      // Buscar la conversación creada y seleccionarla
      const newConversation = {
        id: conversationId,
        doctorId,
        patientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        otherUser: {
          id: targetUser.id,
          name: targetUser.name,
          userType: targetUser.userType,
          profileImage: targetUser.profileImage
        },
        unreadCount: 0
      };
      
      setSelectedConversation(newConversation);
      setShowingNewChat(false);
      setShowMobileChat(true);
      
      toast({
        title: 'Chat creado',
        description: `Se ha iniciado un chat con ${targetUser.name}`,
      });
    } catch (error: any) {
      console.error('Error al iniciar nuevo chat:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo iniciar un nuevo chat',
        variant: 'destructive',
      });
    }
  };
  
  // Mostrar la pantalla de nuevo chat
  const showNewChat = () => {
    setShowingNewChat(true);
    setSelectedConversation(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowMobileChat(true);
  };
  
  // Volver a la lista de conversaciones en móvil
  const handleBackToList = () => {
    setShowMobileChat(false);
  };
  
  // Aceptar aviso de privacidad
  const acceptDisclaimer = () => {
    localStorage.setItem('chatDisclaimerAccepted', 'true');
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };
  
  if (!connected) {
    return (
      <div className={`flex items-center justify-center h-full ${containerClass}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <p className="text-muted-foreground">Conectando al servicio de mensajería...</p>
        </div>
      </div>
    );
  }
  
  // Diseño móvil responsivo
  return (
    <div className={`${containerClass} overflow-hidden`}>
      {/* Aviso de privacidad */}
      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Aviso de Privacidad del Chat Médico
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  Este chat está diseñado para comunicación entre médicos y pacientes
                  que han tenido al menos una consulta previa. Toda la información
                  compartida a través de este medio es confidencial y está sujeta a:
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>La Ley General de Salud (LGS)</li>
                  <li>La Ley Federal de Protección de Datos Personales</li>
                  <li>Las normativas de COFEPRIS aplicables a la telesalud</li>
                  <li>Los principios de confidencialidad médico-paciente</li>
                </ul>
                <div className="font-medium pt-2">
                  Recuerde que este es un canal para seguimiento médico y no sustituye
                  una consulta presencial. En caso de emergencia, contacte al 911 o
                  acuda al centro de urgencias más cercano.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={acceptDisclaimer}>
              Entiendo y acepto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Panel principal */}
      <div className="h-full grid lg:grid-cols-[320px_1fr] grid-cols-1">
        {/* Lista de conversaciones (oculto en móvil cuando se ve un chat) */}
        <div className={`border-r ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
          <div className="p-4 border-b flex items-center gap-2">
            <h2 className="font-semibold text-lg">Mensajes</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={showNewChat}
              className="ml-auto"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-3">
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          
          <ScrollArea className="h-[calc(100%-120px)]">
            {filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No hay conversaciones</p>
                <Button 
                  variant="link" 
                  onClick={showNewChat}
                  className="mt-2"
                >
                  Iniciar nuevo chat
                </Button>
              </div>
            ) : (
              <div className="space-y-0.5 px-1">
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    {conversation.otherUser.profileImage ? (
                      <img
                        src={conversation.otherUser.profileImage}
                        alt={conversation.otherUser.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                        {conversation.otherUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{conversation.otherUser.name}</h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {conversation.otherUser.userType === 'doctor' ? 'Médico' : 'Paciente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Ventana de chat o nueva conversación (aparece en móvil cuando se selecciona) */}
        <div className={`${!showMobileChat ? 'hidden lg:block' : 'block'}`}>
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages[selectedConversation.id] || []}
              onSendMessage={handleSendMessage}
              loading={isLoadingMessages}
              onBack={handleBackToList}
              mobileView={true}
            />
          ) : showingNewChat ? (
            // Interfaz de búsqueda de usuarios usando el componente UserSearch
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h3 className="font-medium">Nuevo chat</h3>
              </div>
              
              <div className="p-4">
                <UserSearch 
                  onSelectUser={(userId, userType) => startNewChat({ id: userId, userType })}
                  placeholder={`Buscar ${user?.userType === 'doctor' ? 'pacientes' : 'médicos'}...`}
                  buttonLabel="Iniciar chat"
                  className="w-full"
                />
                
                <div className="text-center text-muted-foreground py-6 mt-4">
                  <p className="text-sm">
                    {user?.userType === 'doctor' 
                      ? 'Solo puedes chatear con pacientes que hayas atendido' 
                      : 'Solo puedes chatear con médicos que te hayan atendido'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Pantalla inicial sin conversación seleccionada
            <EmptyState
              title="Chat Médico Seguro" 
              description={`Comunícate de manera segura con tus ${user?.userType === 'doctor' ? 'pacientes' : 'médicos'}. Selecciona una conversación existente o inicia una nueva.`}
              action={{
                label: "Iniciar nuevo chat",
                onClick: showNewChat
              }}
              icon={<MessageSquarePlus className="h-12 w-12 text-muted-foreground/50" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}
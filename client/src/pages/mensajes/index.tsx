import React, { useState } from 'react';
import DoctorLayout from '@/layouts/DoctorLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Send, Search, PhoneCall, Video, MoreVertical, Paperclip, Image } from 'lucide-react';

export default function MensajesPage() {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState("");
  
  // Datos de ejemplo
  const chats = [
    { 
      id: 1, 
      name: "Dr. María Gutiérrez",
      avatar: null,
      specialty: "Cardiología",
      lastMessage: "Aquí tiene los resultados del paciente",
      date: "10:30",
      unread: 2,
      online: true
    },
    { 
      id: 2, 
      name: "Dr. Roberto Sánchez",
      avatar: null,
      specialty: "Neurología",
      lastMessage: "Gracias por la consulta",
      date: "Ayer",
      unread: 0,
      online: false
    },
    { 
      id: 3, 
      name: "Enfermera Torres",
      avatar: null,
      specialty: "Enfermería",
      lastMessage: "El paciente está listo para la consulta",
      date: "Mar 22",
      unread: 0,
      online: true
    },
    { 
      id: 4, 
      name: "Secretaria Médica",
      avatar: null,
      specialty: "Administrativo",
      lastMessage: "Confirmada la cita para el jueves",
      date: "Mar 20",
      unread: 0,
      online: false
    }
  ];
  
  const messages = [
    { id: 1, sender: 2, text: "Buenos días doctor, le envío los resultados del paciente González", time: "10:15" },
    { id: 2, sender: 1, text: "Excelente, gracias por compartirlos tan pronto", time: "10:20" },
    { id: 3, sender: 2, text: "Por supuesto. El paciente está esperando su opinión. ¿Podría darme una evaluación preliminar?", time: "10:22" },
    { id: 4, sender: 1, text: "Claro, revisando los resultados veo que sus valores de glucosa están ligeramente elevados. Recomendaría ajustar su medicación actual.", time: "10:25" },
    { id: 5, sender: 2, text: "Aquí tiene los resultados del paciente", time: "10:30" },
  ];
  
  const handleSendMessage = () => {
    if (message.trim()) {
      // Aquí iría la lógica para enviar el mensaje
      setMessage("");
    }
  };
  
  return (
    <DoctorLayout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <Button size="sm" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Nuevo chat
          </Button>
        </div>
        
        <div className="bg-card border rounded-lg overflow-hidden flex h-[calc(100vh-200px)]">
          {/* Panel izquierdo - Lista de chats */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar conversaciones..."
                  className="pl-8"
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="flex-1 flex flex-col">
              <div className="px-3 pt-2">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="staff">Staff</TabsTrigger>
                  <TabsTrigger value="patients">Pacientes</TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1">
                <TabsContent value="all" className="m-0">
                  {chats.map(chat => (
                    <div
                      key={chat.id}
                      className={`p-3 flex items-center border-b hover:bg-muted/50 cursor-pointer ${activeChat === chat.id ? 'bg-muted' : ''}`}
                      onClick={() => setActiveChat(chat.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          {chat.avatar ? (
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                          ) : (
                            <AvatarFallback>{chat.name.charAt(0)}{chat.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        {chat.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-sm">{chat.name}</h3>
                          <span className="text-xs text-muted-foreground">{chat.date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                          {chat.unread > 0 && (
                            <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs px-1.5 py-0 bg-gray-100">
                            {chat.specialty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="staff" className="m-0 p-4">
                  <div className="text-center text-muted-foreground text-sm">
                    Filtro de staff no implementado
                  </div>
                </TabsContent>
                
                <TabsContent value="patients" className="m-0 p-4">
                  <div className="text-center text-muted-foreground text-sm">
                    Filtro de pacientes no implementado
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
          
          {/* Panel derecho - Conversación */}
          {activeChat ? (
            <div className="flex-1 flex flex-col">
              {/* Encabezado de chat */}
              <div className="p-3 border-b flex justify-between items-center bg-card">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {chats.find(c => c.id === activeChat)?.name.charAt(0)}
                      {chats.find(c => c.id === activeChat)?.name.split(' ')[1]?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h3 className="font-medium">{chats.find(c => c.id === activeChat)?.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {chats.find(c => c.id === activeChat)?.online ? 'En línea' : 'Desconectado'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <PhoneCall className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              
              {/* Mensajes */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 1 ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-lg ${
                          msg.sender === 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 1 ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Área de entrada de mensaje */}
              <div className="p-3 border-t flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Image className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon" disabled={!message.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">Selecciona una conversación</h3>
                <p className="text-muted-foreground">O comienza una nueva</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
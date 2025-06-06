import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Mail, 
  Printer, 
  RefreshCw, 
  Clipboard, 
  Clock, 
  Building, 
  Microscope,
  CalendarDays,
  Pencil
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

export default function DetalleOrdenLaboratorio() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const comisionId = parseInt(id);
  
  const {
    data: commission,
    isLoading: comissionLoading,
    error: comissionError,
    refetch,
  } = useQuery({
    queryKey: ["/api/lab-commissions", comisionId],
  });
  
  const {
    data: results,
    isLoading: resultsLoading,
    error: resultsError,
  } = useQuery({
    queryKey: ["/api/lab-results/commission", comisionId],
  });

  // Manejar navegación hacia atrás
  const handleBack = () => {
    navigate("/dashboard/doctor/laboratorio");
  };

  // Simular reenvío de correo al laboratorio
  const handleResendEmail = () => {
    toast({
      title: "Correo reenviado",
      description: "Se ha enviado un recordatorio al laboratorio",
    });
  };

  // Simular impresión de la orden
  const handlePrintOrder = () => {
    toast({
      title: "Imprimiendo...",
      description: "La orden se está enviando a la impresora",
    });
    // En producción, aquí iría la lógica real de impresión
  };

  // Formatear estado para mostrar en interfaz
  const formatStatus = (status) => {
    switch(status) {
      case "pending":
        return { 
          label: "Pendiente", 
          variant: "outline", 
          className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50" 
        };
      case "completed":
        return { 
          label: "Completada", 
          variant: "outline", 
          className: "bg-green-50 text-green-700 hover:bg-green-50" 
        };
      case "cancelled":
        return { 
          label: "Cancelada", 
          variant: "outline", 
          className: "bg-red-50 text-red-700 hover:bg-red-50" 
        };
      default:
        return { 
          label: "Desconocido", 
          variant: "outline", 
          className: "" 
        };
    }
  };

  // Formatear urgencia para mostrar en interfaz
  const formatUrgency = (urgency) => {
    switch(urgency) {
      case "normal":
        return { 
          label: "Normal", 
          variant: "outline", 
          className: "bg-blue-50 text-blue-700 hover:bg-blue-50" 
        };
      case "urgent":
        return { 
          label: "Urgente", 
          variant: "outline", 
          className: "bg-orange-50 text-orange-700 hover:bg-orange-50" 
        };
      case "immediate":
        return { 
          label: "Inmediata", 
          variant: "outline", 
          className: "bg-red-50 text-red-700 hover:bg-red-50" 
        };
      default:
        return { 
          label: "Normal", 
          variant: "outline", 
          className: "bg-blue-50 text-blue-700 hover:bg-blue-50" 
        };
    }
  };

  // Si hay error, mostrar mensaje
  if (comissionError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h2 className="text-2xl font-bold mb-4">Error al cargar la información</h2>
          <p className="text-muted-foreground mb-6">No se pudo obtener los detalles de la orden de laboratorio.</p>
          <Button onClick={handleBack}>Volver a Laboratorio</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Si el ID no es válido, mostrar mensaje
  if (isNaN(comisionId)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h2 className="text-2xl font-bold mb-4">Orden no válida</h2>
          <p className="text-muted-foreground mb-6">El ID de la orden no es válido.</p>
          <Button onClick={handleBack}>Volver a Laboratorio</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = commission ? formatStatus(commission.status) : { label: "", variant: "outline", className: "" };
  const urgencyInfo = commission ? formatUrgency(commission.urgency) : { label: "", variant: "outline", className: "" };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Cabecera con botón para volver */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Detalles de Orden
              </h2>
              {!comissionLoading && commission && (
                <p className="text-muted-foreground">
                  Orden #{comisionId} - {commission.serviceName || "Estudio general"}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrintOrder}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleResendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Reenviar
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna de información básica */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clipboard className="h-5 w-5" />
                  <span>Información de la Orden</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comissionLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </div>
                ) : commission ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Estado:</span>
                      <Badge variant={statusInfo.variant} className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Urgencia:</span>
                      <Badge variant={urgencyInfo.variant} className={urgencyInfo.className}>
                        {urgencyInfo.label}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-500 mr-1">Fecha de Creación:</span>
                      <span className="text-sm">{new Date(commission.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-500 mr-1">Hora:</span>
                      <span className="text-sm">{new Date(commission.createdAt).toLocaleTimeString()}</span>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Servicio:</h4>
                      <p>{commission.serviceName || "Estudio general"}</p>
                    </div>
                    
                    {commission.testType && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Tipo de Prueba:</h4>
                        <p>{commission.testType}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Monto:</h4>
                      <p>${commission.amount}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No se encontró información de la orden</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Laboratorio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comissionLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </div>
                ) : commission && commission.laboratory ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 text-primary-800 p-2 rounded-md">
                        <Microscope className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{commission.laboratory.name}</h4>
                        <p className="text-sm text-gray-500">{commission.laboratory.address || "Dirección no disponible"}</p>
                      </div>
                    </div>
                    
                    {commission.laboratory.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Teléfono:</h4>
                        <p>{commission.laboratory.phone}</p>
                      </div>
                    )}
                    
                    {commission.laboratory.email && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Email:</h4>
                        <p>{commission.laboratory.email}</p>
                      </div>
                    )}
                    
                    {commission.laboratory.discount && (
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Descuento: {commission.laboratory.discount}%
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No se encontró información del laboratorio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Columna de detalles y resultados */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Microscope className="h-5 w-5" />
                  <span>Detalles del Estudio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comissionLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : commission ? (
                  <div className="space-y-4">
                    {commission.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Descripción:</h4>
                        <p className="whitespace-pre-line">{commission.description}</p>
                      </div>
                    )}
                    
                    {commission.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Notas Adicionales:</h4>
                        <p className="whitespace-pre-line">{commission.notes}</p>
                      </div>
                    )}
                    
                    {!commission.description && !commission.notes && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No hay detalles adicionales para esta orden</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No se encontró información de la orden</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Resultados</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={!commission || commission.status !== "pending"}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Añadir Resultado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Añadir Resultado de Laboratorio</DialogTitle>
                      <DialogDescription>
                        Esta funcionalidad permite a laboratorios subir sus resultados directamente.
                        Para esta demostración, está deshabilitada.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground">
                        Los resultados son subidos por el laboratorio a través de su panel de control
                        o enviados por correo electrónico.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : results && results.length > 0 ? (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div key={result.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">Resultado #{result.id}</h4>
                            <p className="text-sm text-gray-500">
                              Fecha: {new Date(result.resultDate).toLocaleDateString()} - Técnico: {result.technician}
                            </p>
                          </div>
                          <Badge
                            className={
                              result.resultStatus === "normal" 
                                ? "bg-green-50 text-green-700" 
                                : result.resultStatus === "abnormal"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                            }
                          >
                            {result.resultStatus === "normal" 
                              ? "Normal" 
                              : result.resultStatus === "abnormal"
                              ? "Anormal"
                              : "Crítico"
                            }
                          </Badge>
                        </div>
                        
                        {result.comments && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-gray-500">Comentarios:</h5>
                            <p className="text-sm whitespace-pre-line">{result.comments}</p>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <a 
                            href={result.resultFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Ver documento de resultados</span>
                          </a>
                        </div>
                        
                        {result.doctorComments && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-md">
                            <h5 className="text-sm font-medium text-gray-500">Tu interpretación:</h5>
                            <p className="text-sm whitespace-pre-line">{result.doctorComments}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Añadido el {new Date(result.reviewDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : commission && commission.status === "pending" ? (
                  <div className="text-center py-10 border border-dashed rounded-md">
                    <Microscope className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Resultados Pendientes
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      El laboratorio aún no ha subido los resultados para esta orden.
                      Recibirás una notificación cuando estén disponibles.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={handleResendEmail}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Recordatorio
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay resultados disponibles</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <p className="text-xs text-gray-500">
                  Los resultados se guardan en el expediente del paciente automáticamente
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
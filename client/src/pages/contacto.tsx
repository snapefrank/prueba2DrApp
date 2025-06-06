import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PhoneCall,
  MapPin,
  Mail,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido",
  }),
  phone: z.string().min(10, {
    message: "El teléfono debe tener al menos 10 dígitos",
  }),
  subject: z.string().min(3, {
    message: "El asunto debe tener al menos 3 caracteres",
  }),
  message: z.string().min(10, {
    message: "El mensaje debe tener al menos 10 caracteres",
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactoPage() {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });
  
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      // En un entorno real, esta sería una llamada real a la API
      // const response = await apiRequest("POST", "/api/contact", data);
      // return response.json();
      
      // Simulamos un retraso para mostrar el estado de carga
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1500);
      });
    },
    onSuccess: () => {
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Nos pondremos en contacto contigo pronto.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar mensaje",
        description: error.message || "Ha ocurrido un error. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: ContactFormValues) {
    contactMutation.mutate(data);
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aquí para responder tus preguntas y ayudarte con cualquier inquietud que tengas sobre Medicfy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                  <CardDescription>
                    Utiliza cualquiera de estos métodos para ponerte en contacto con nosotros.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start">
                    <PhoneCall className="h-6 w-6 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Teléfono</h3>
                      <p className="mt-1 text-gray-600">+52 (55) 1234-5678</p>
                      <p className="text-gray-600">+52 (55) 8765-4321</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Correo electrónico</h3>
                      <p className="mt-1 text-gray-600">contacto@medicfy.com</p>
                      <p className="text-gray-600">soporte@medicfy.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Ubicación</h3>
                      <p className="mt-1 text-gray-600">
                        Av. Paseo de la Reforma 222<br />
                        Col. Juárez, Cuauhtémoc<br />
                        06600, Ciudad de México, CDMX
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Horario de atención</h3>
                      <p className="mt-1 text-gray-600">
                        Lunes a Viernes: 9:00 AM - 7:00 PM<br />
                        Sábados: 9:00 AM - 2:00 PM<br />
                        Domingos: Cerrado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Envíanos un mensaje</CardTitle>
                  <CardDescription>
                    Completa el formulario y nos pondremos en contacto contigo a la brevedad.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo electrónico</FormLabel>
                              <FormControl>
                                <Input placeholder="correo@ejemplo.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input placeholder="(55) 1234-5678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asunto</FormLabel>
                              <FormControl>
                                <Input placeholder="¿Sobre qué nos contactas?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensaje</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Escribe tu mensaje aquí..."
                                className="resize-none min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={contactMutation.isPending}
                      >
                        {contactMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : contactMutation.isSuccess ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Enviado
                          </>
                        ) : (
                          "Enviar mensaje"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-16">
            <iframe
              title="Ubicación de MediConnect"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.661076498793!2d-99.16966548509393!3d19.42789098689082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35337fb3a9%3A0xe71998428bf8b722!2sAv.%20Paseo%20de%20la%20Reforma%20222%2C%20Ju%C3%A1rez%2C%20Cuauht%C3%A9moc%2C%2006600%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses-419!2smx!4v1643842379037!5m2!1ses-419!2smx"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: "0.5rem" }}
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
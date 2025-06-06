import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@shared/schema";
import { redirectToUserSubdomain } from "@/lib/subdomain";

const formSchema = z.object({
  username: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LaboratoryLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { loginMutation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const user = await loginMutation.mutateAsync(values);
      
      if (user.userType === UserType.LABORATORY) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Redirigiendo al dashboard de laboratorio...",
        });
        
        // Pequeño retraso para asegurar que se complete la operación anterior
        setTimeout(() => {
          try {
            // Redirigir al subdominio de laboratorio
            if (import.meta.env.DEV) {
              // En desarrollo, usar parámetro de URL
              navigate("/?subdomain=laboratory");
              // Recargar después de un breve retraso para asegurar que la URL se actualice
              setTimeout(() => window.location.reload(), 100);
            } else {
              // En producción, usar subdominios reales
              window.location.href = `${window.location.protocol}//laboratory.${window.location.host}/dashboard/laboratory`;
            }
          } catch (redirectError) {
            console.error("Error al redirigir:", redirectError);
            // Fallback seguro
            window.location.href = "/?subdomain=laboratory";
          }
        }, 500);
      } else {
        toast({
          title: "Acceso denegado",
          description: "Esta página es exclusivamente para usuarios de laboratorio.",
          variant: "destructive",
        });
        form.reset();
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      toast({
        title: "Error de inicio de sesión",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary-600">
            Portal de Laboratorio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa tu usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingresa tu contraseña"
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
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Volver a la página principal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
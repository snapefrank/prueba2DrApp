import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";
import ContactForm from "@/components/ContactForm";

export default function PreciosPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* <Navbar /> */}

            <main className="flex-grow">
                <section className="bg-gradient-to-b from-primary-50 to-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                                Precios transparentes
                            </h1>
                            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                                Sin mensualidades ni costos ocultos. En
                                Medicfy, creemos en un modelo justo para
                                todos los participantes.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                            {/* Pacientes */}
                            <Card className="border-primary-100">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-bold text-center">
                                        Para pacientes
                                    </CardTitle>
                                    <CardDescription className="text-center text-lg">
                                        Acceso gratuito a la plataforma
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center pb-2">
                                    <div className="text-5xl font-bold mb-6">
                                        <span className="text-primary-500">
                                            $0
                                        </span>
                                        <span className="text-base font-normal text-gray-500 ml-1">
                                            / mes
                                        </span>
                                    </div>
                                    <p className="text-gray-500 mb-8">
                                        Solo pagas por las consultas médicas que
                                        programes
                                    </p>
                                    <ul className="space-y-3 text-left mb-8">
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Agenda citas con especialistas
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Recibe recetas digitales
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Acceso a tu historial médico
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Descuentos en laboratorios
                                                afiliados
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Resultados de laboratorio en un
                                                solo lugar
                                            </span>
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Link href="/auth?register=true&type=patient">
                                        <Button className="w-full">
                                            Registrarse gratis
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>

                            {/* Médicos */}
                            <Card className="border-primary-200 shadow-lg md:scale-105">
                                <CardHeader className="pb-2">
                                    <div className="w-full flex justify-center mb-2">
                                        <span className="px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-800 rounded-full">
                                            Más popular
                                        </span>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-center">
                                        Para médicos
                                    </CardTitle>
                                    <CardDescription className="text-center text-lg">
                                        Sin mensualidad fija
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center pb-2">
                                    <div className="text-5xl font-bold mb-6">
                                        <span className="text-primary-500">
                                            10%
                                        </span>
                                        <span className="text-base font-normal text-gray-500 ml-1">
                                            / consulta
                                        </span>
                                    </div>
                                    <p className="text-gray-500 mb-8">
                                        Ejemplo: Para una consulta de $600,
                                        recibes $540
                                    </p>
                                    <ul className="space-y-3 text-left mb-8">
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Agenda y administra tus citas
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Expediente clínico digital
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Generación de recetas
                                                electrónicas
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Órdenes de laboratorio digitales
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Acceso a resultados de
                                                laboratorio
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Promoción para nuevos pacientes
                                            </span>
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Link href="/auth?register=true&type=doctor">
                                        <Button
                                            className="w-full"
                                            variant="default"
                                        >
                                            Registrarse como médico
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>

                            {/* Laboratorios */}
                            <Card className="border-primary-100">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-bold text-center">
                                        Para laboratorios
                                    </CardTitle>
                                    <CardDescription className="text-center text-lg">
                                        Personalizado
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center pb-2">
                                    <div className="text-5xl font-bold mb-6">
                                        <span className="text-primary-500">
                                            Contactar
                                        </span>
                                    </div>
                                    <p className="text-gray-500 mb-8">
                                        Tarifas personalizadas según volumen de
                                        servicio
                                    </p>
                                    <ul className="space-y-3 text-left mb-8">
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Recepción de órdenes médicas
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Carga de resultados en
                                                plataforma
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Panel de control administrativo
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>
                                                Mayor visibilidad con doctores
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                                            <span>Reportes y estadísticas</span>
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <ContactForm
                                        trigger={
                                            <Button
                                                className="w-full"
                                                variant="outline"
                                            >
                                                Contactar ventas
                                            </Button>
                                        }
                                        title="Contacto para Laboratorios"
                                        description="Complete el formulario y nuestro equipo de ventas se pondrá en contacto con usted para discutir una propuesta personalizada."
                                    />
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="mt-16 bg-gray-50 p-8 rounded-lg">
                            <h2 className="text-2xl font-bold text-center mb-6">
                                Planes futuros
                            </h2>
                            <p className="text-center text-gray-600 mb-8">
                                Estamos trabajando en planes premium con
                                características adicionales para médicos y
                                pacientes:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Plan PRO para Médicos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Consultas por videollamada
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Herramientas avanzadas de
                                                    análisis
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Posicionamiento destacado
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Reducción de comisión por
                                                    consulta
                                                </span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Plan ELITE para Pacientes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Consultas ilimitadas
                                                    mensuales
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Mayores descuentos en
                                                    laboratorios
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Prioridad en agenda de
                                                    especialistas
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                                                <span>
                                                    Consultas familiares
                                                </span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* <Footer /> */}
        </div>
    );
}

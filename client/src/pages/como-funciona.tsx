import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import Footer from "@/components/landing/Footer";
import {
    Calendar,
    FileText,
    UserCheck,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Stethoscope,
} from "lucide-react";

export default function ComoFuncionaPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <section className="bg-primary-500 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
                            ¿Cómo funciona Medicfy?
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-lg text-primary-50 sm:text-xl md:mt-5 md:max-w-3xl">
                            Conectamos pacientes con médicos certificados a
                            través de una plataforma segura y fácil de usar.
                        </p>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                                Un proceso simple en 3 pasos
                            </h2>
                            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                                Medicfy hace que recibir atención médica sea
                                simple y accesible para todos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary-500 text-white mb-4">
                                    <UserCheck className="h-8 w-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    1. Regístrate
                                </h3>
                                <p className="text-base text-gray-500">
                                    Crea tu cuenta en menos de 2 minutos y
                                    accede a todos nuestros servicios.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary-500 text-white mb-4">
                                    <Stethoscope className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    2. Encuentra especialistas
                                </h3>
                                <p className="text-base text-gray-500">
                                    Busca médicos por especialidad, ubicación,
                                    calificaciones o disponibilidad.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary-500 text-white mb-4">
                                    <Calendar className="h-8 w-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    3. Agenda tu cita
                                </h3>
                                <p className="text-base text-gray-500">
                                    Selecciona el horario que mejor te convenga
                                    y confirma tu consulta en segundos.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                    Beneficios para pacientes
                                </h2>
                                <p className="mt-4 text-lg text-gray-500">
                                    Accede a atención médica de calidad, sin
                                    filas y a precios accesibles.
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Expediente médico digital
                                            </h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Accede a tu historial clínico
                                                desde cualquier dispositivo.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Recordatorios automáticos
                                            </h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Recibe notificaciones de tus
                                                próximas citas y medicamentos.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Pagos seguros
                                            </h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Paga tus consultas de forma
                                                fácil y segura a través de la
                                                plataforma.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 lg:mt-0">
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80"
                                        alt="Paciente revisando su aplicación médica"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                            <div className="mt-10 order-first lg:order-last lg:mt-0">
                                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                    Beneficios para médicos
                                </h2>
                                <p className="mt-4 text-lg text-gray-500">
                                    Lleva tu práctica médica al siguiente nivel
                                    con nuestras herramientas digitales.
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Gestión de agenda
                                            </h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Administra tus horarios y citas
                                                de manera eficiente.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Expediente clínico digital
                                            </h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Genera y gestiona expedientes
                                                siguiendo normativas médicas.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Recetas electrónicas
                                            </h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Emite recetas electrónicas con
                                                validez legal y seguimiento.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="order-last lg:order-first">
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80"
                                        alt="Médico utilizando tablet"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Preguntas frecuentes
                            </h2>
                            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                                Resolvemos tus dudas sobre cómo utilizar nuestra
                                plataforma.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-8 lg:grid-cols-2">
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    ¿Cómo puedo registrarme como paciente?
                                </h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Haz clic en "Regístrate gratis" en la página
                                    principal, completa el formulario con tus
                                    datos personales y crea una contraseña
                                    segura. ¡Listo! Ya puedes empezar a utilizar
                                    Medicfy.
                                </p>
                            </div>

                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    ¿Cómo me registro como médico?
                                </h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Haz clic en "Regístrate como médico",
                                    completa tus datos profesionales y sube tus
                                    documentos para verificación (cédula
                                    profesional, identificación y documentos
                                    académicos). Revisaremos tu información y
                                    aprobaremos tu cuenta en 24-48 horas.
                                </p>
                            </div>

                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    ¿Cuánto cuesta el servicio?
                                </h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Ofrecemos diferentes planes de suscripción
                                    según tus necesidades. Puedes consultar
                                    todos los detalles en nuestra sección de{" "}
                                    <Link
                                        href="/precios"
                                        className="text-primary-600 hover:text-primary-500"
                                    >
                                        Precios
                                    </Link>
                                    .
                                </p>
                            </div>

                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    ¿Cómo funciona el expediente médico digital?
                                </h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Tu expediente médico digital almacena de
                                    forma segura tu historial clínico,
                                    diagnósticos, recetas, resultados de
                                    laboratorio y recomendaciones médicas.
                                    Puedes acceder a él desde cualquier
                                    dispositivo y compartirlo con los médicos
                                    que elijas.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-primary-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold sm:text-4xl">
                            ¿Listo para empezar?
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-primary-100">
                            Únete a miles de pacientes y médicos que ya están
                            utilizando Medicfy.
                        </p>
                        <div className="mt-8 flex justify-center gap-4 flex-wrap">
                            <Button size="lg" variant="secondary" asChild>
                                <Link href="/auth?register=true">
                                    Regístrate como paciente
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent border-white hover:bg-white/10"
                                asChild
                            >
                                <Link href="/auth?register=true&type=doctor">
                                    Regístrate como médico
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* <Footer /> */}
        </div>
    );
}

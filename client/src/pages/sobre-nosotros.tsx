import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Target, Shield, Award, TrendingUp } from "lucide-react";
import techDirectorImage from "@/assets/director-tecnologia.jpeg";
import opsDirectorImage from "@/assets/director-operaciones.jpeg";

export default function SobreNosotrosPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* <Navbar /> */}

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-12 bg-gradient-to-b from-primary-500 to-primary-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                                Sobre Medicfy
                            </h1>
                            <p className="mt-6 text-xl max-w-3xl mx-auto">
                                Conectando pacientes con profesionales de la
                                salud para una atención médica más accesible,
                                transparente y eficiente.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                            <div>
                                <div className="flex items-center mb-6">
                                    <Heart className="h-8 w-8 text-primary-600 mr-3" />
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Nuestra Misión
                                    </h2>
                                </div>
                                <p className="text-lg text-gray-600">
                                    Nuestra misión es conectar salud, confianza
                                    y tecnología, creando un ecosistema donde
                                    pacientes y profesionales de la salud pueden
                                    interactuar de manera eficiente y
                                    transparente. Buscamos democratizar el
                                    acceso a servicios médicos de calidad,
                                    facilitando la gestión de citas, expedientes
                                    y comunicación entre todos los actores del
                                    sistema de salud.
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary-500 text-white">
                                                <Users className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Accesibilidad
                                            </h3>
                                            <p className="mt-2 text-base text-gray-600">
                                                Hacer que la atención médica de
                                                calidad sea accesible para
                                                todos, sin importar su
                                                ubicación.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary-500 text-white">
                                                <Shield className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Confianza
                                            </h3>
                                            <p className="mt-2 text-base text-gray-600">
                                                Crear un entorno seguro donde la
                                                información médica se maneja con
                                                la máxima confidencialidad y
                                                ética.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center mb-6">
                                    <Target className="h-8 w-8 text-primary-600 mr-3" />
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Nuestra Visión
                                    </h2>
                                </div>
                                <p className="text-lg text-gray-600">
                                    Aspiramos a convertirnos en una plataforma
                                    de salud integral confiable que revolucione
                                    la forma en que se accede a servicios
                                    médicos. Nuestra visión es un mundo donde la
                                    salud no se limita a momentos de enfermedad,
                                    sino que se integra en la vida cotidiana,
                                    permitiendo prevención, seguimiento y
                                    atención inmediata cuando sea necesario.
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary-500 text-white">
                                                <Award className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Excelencia
                                            </h3>
                                            <p className="mt-2 text-base text-gray-600">
                                                Mantener los más altos
                                                estándares de calidad en todos
                                                nuestros servicios y procesos.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary-500 text-white">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Innovación
                                            </h3>
                                            <p className="mt-2 text-base text-gray-600">
                                                Buscar constantemente nuevas
                                                formas de mejorar la experiencia
                                                de salud a través de la
                                                tecnología.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What is MediConnect Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">
                                ¿Qué es Medicfy?
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                                Medicfy es una plataforma médica basada en
                                suscripción que conecta pacientes con doctores
                                certificados.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-primary-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Expediente Médico Digital
                                    </h3>
                                    <p className="mt-3 text-base text-gray-600">
                                        Mantén todo tu historial médico en un
                                        solo lugar, accesible cuando lo
                                        necesites y con la máxima seguridad.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-primary-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Programación de Citas
                                    </h3>
                                    <p className="mt-3 text-base text-gray-600">
                                        Sistema fácil de usar para agendar,
                                        reprogramar o cancelar citas con tus
                                        médicos favoritos.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-primary-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Red de Especialistas
                                    </h3>
                                    <p className="mt-3 text-base text-gray-600">
                                        Accede a una amplia red de médicos
                                        certificados en diversas especialidades
                                        médicas.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-primary-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Seguridad de Datos
                                    </h3>
                                    <p className="mt-3 text-base text-gray-600">
                                        Tu información médica está protegida con
                                        los más altos estándares de seguridad y
                                        privacidad.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-primary-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Descuentos en Laboratorios
                                    </h3>
                                    <p className="mt-3 text-base text-gray-600">
                                        Accede a descuentos exclusivos en
                                        pruebas de laboratorio y estudios de
                                        imagen.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-primary-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Recetas Digitales
                                    </h3>
                                    <p className="mt-3 text-base text-gray-600">
                                        Recibe recetas médicas digitales
                                        directamente en tu dispositivo, fáciles
                                        de compartir con farmacias.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">
                                Nuestro Equipo
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                                Un equipo multidisciplinario de profesionales
                                comprometidos con transformar la atención
                                médica.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center">
                                <img
                                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80"
                                    alt="Director Médico"
                                    className="mx-auto h-40 w-40 rounded-full object-cover"
                                />
                                <h3 className="mt-6 text-lg font-medium text-gray-900">
                                    Dr. Alejandro Ramírez
                                </h3>
                                <p className="text-primary-600">
                                    Director Médico
                                </p>
                                <p className="mt-2 text-base text-gray-600 max-w-xs mx-auto">
                                    Médico especialista con 15 años de
                                    experiencia en gestión de servicios de
                                    salud.
                                </p>
                            </div>

                            <div className="text-center">
                                <img
                                    src={techDirectorImage}
                                    alt="Director de Tecnología"
                                    className="mx-auto h-40 w-40 rounded-full object-cover"
                                />
                                <h3 className="mt-6 text-lg font-medium text-gray-900">
                                    Ing. Roberth Díaz
                                </h3>
                                <p className="text-primary-600">
                                    Director de Tecnología
                                </p>
                                <p className="mt-2 text-base text-gray-600 max-w-xs mx-auto">
                                    Ingeniero en sistemas con especialidad en
                                    desarrollo de software
                                </p>
                            </div>

                            <div className="text-center">
                                <img
                                    src={opsDirectorImage}
                                    alt="Director de Operaciones"
                                    className="mx-auto h-40 w-40 rounded-full object-cover"
                                />
                                <h3 className="mt-6 text-lg font-medium text-gray-900">
                                    Dr. Jorge Tinoco
                                </h3>
                                <p className="text-primary-600">
                                    Director de Operaciones
                                </p>
                                <p className="mt-2 text-base text-gray-600 max-w-xs mx-auto">
                                    Médico general con experiencia en gestión de
                                    servicios de salud
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* <Footer /> */}
        </div>
    );
}

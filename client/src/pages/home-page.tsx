import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";
import { Calendar, FileText, UserCheck, CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getDefaultSubdomainForUserType } from "@/lib/subdomain";

export default function HomePage() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="pt-20 pb-12 bg-gradient-to-b from-primary-500 to-primary-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                    <div className="lg:flex lg:items-center lg:justify-between">
                        <div className="lg:w-1/2">
                            <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
                                La salud al alcance de tu familia
                            </h1>
                            <p className="mt-3 max-w-md text-lg text-primary-50 sm:text-xl md:mt-5 md:max-w-3xl">
                                Acceso fácil, rápido y organizado a servicios de
                                salud sin pertenecer a una aseguradora. Con
                                MediConnect, obtén atención médica cuando la
                                necesites, sin filas ni complicaciones.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                {!user ? (
                                    <Link href="/auth?register=true">
                                        <Button
                                            variant="secondary"
                                            className="text-primary-700 shadow-md w-full sm:w-auto"
                                        >
                                            Regístrate gratis
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/dashboard">
                                        <Button
                                            variant="secondary"
                                            className="text-primary-700 shadow-md w-full sm:w-auto"
                                        >
                                            Ir a Mi Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/precios">
                                    <Button
                                        variant={user ? "secondary" : "outline"}
                                        className={`${
                                            user
                                                ? "text-primary-700"
                                                : "border-white hover:bg-blue-400"
                                        } shadow-md w-full sm:w-auto`}
                                    >
                                        Ver planes
                                    </Button>
                                </Link>
                                <Link href="/como-funciona">
                                    <Button className="shadow-md w-full sm:w-auto">
                                        ¿Cómo funciona?
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
                            <img
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80"
                                alt="Doctor con paciente"
                                className="rounded-lg shadow-lg object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                            Beneficios
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Todo lo que necesitas en un solo lugar
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Nuestra plataforma médica basada en suscripción te
                            ofrece acceso a servicios completos e integrados.
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="pt-6">
                                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                                                <Calendar className="h-6 w-6 text-red-400" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                                            Agenda citas en segundos
                                        </h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            Programa consultas con especialistas
                                            según tu disponibilidad y
                                            necesidades específicas.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                                                <FileText className="h-6 w-6 text-yellow" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                                            Expediente médico digital
                                        </h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            Accede a tu historial clínico desde
                                            cualquier dispositivo y compártelo
                                            con tus médicos.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                                                <UserCheck className="h-6 w-6 text-green-500" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                                            Doctores certificados
                                        </h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            Contamos con los mejores
                                            especialistas verificados para
                                            brindarte atención de calidad.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-10">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                            ¿Cómo funciona?
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Simple, rápido y eficiente
                        </p>
                    </div>

                    <div className="relative">
                        <div
                            className="absolute inset-0 flex items-center"
                            aria-hidden="true"
                        >
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-3 text-lg font-medium text-gray-900">
                                Para pacientes
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                        <div className="flex flex-col rounded-lg shadow-sm overflow-hidden bg-white">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1576089172869-4f5f6f315620?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    alt="Registro y suscripción"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                            1
                                        </div>
                                        <h3 className="ml-3 text-xl font-semibold text-gray-900">
                                            Regístrate y suscríbete
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-base text-gray-500">
                                        Crea tu cuenta y elige el plan que mejor
                                        se adapte a tus necesidades de atención
                                        médica.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col rounded-lg shadow-sm overflow-hidden bg-white">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    alt="Búsqueda de especialista"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                            2
                                        </div>
                                        <h3 className="ml-3 text-xl font-semibold text-gray-900">
                                            Busca especialista
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-base text-gray-500">
                                        Explora nuestra red de médicos por
                                        especialidad, calificaciones o
                                        disponibilidad.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col rounded-lg shadow-sm overflow-hidden bg-white">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    alt="Agenda y asiste"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                            3
                                        </div>
                                        <h3 className="ml-3 text-xl font-semibold text-gray-900">
                                            Agenda y asiste
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-base text-gray-500">
                                        Programa tu cita en horarios
                                        convenientes y recibe atención médica de
                                        calidad.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-12">
                        <div
                            className="absolute inset-0 flex items-center"
                            aria-hidden="true"
                        >
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-3 text-lg font-medium text-gray-900">
                                Para médicos
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                        <div className="flex flex-col rounded-lg shadow-sm overflow-hidden bg-white">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    alt="Únete a la red"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                            1
                                        </div>
                                        <h3 className="ml-3 text-xl font-semibold text-gray-900">
                                            Únete a la red
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-base text-gray-500">
                                        <Link
                                            href="/auth?register=true&type=doctor"
                                            className="text-primary hover:underline"
                                        >
                                            Regístrate como médico
                                        </Link>{" "}
                                        y comparte tus credenciales para ser
                                        verificado.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col rounded-lg shadow-sm overflow-hidden bg-white">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    alt="Configura tu horario"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                            2
                                        </div>
                                        <h3 className="ml-3 text-xl font-semibold text-gray-900">
                                            Configura tu horario
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-base text-gray-500">
                                        Establece tus días y horas de
                                        disponibilidad para recibir pacientes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col rounded-lg shadow-sm overflow-hidden bg-white">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    alt="Gestiona pacientes"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                            3
                                        </div>
                                        <h3 className="ml-3 text-xl font-semibold text-gray-900">
                                            Gestiona pacientes
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-base text-gray-500">
                                        Accede a expedientes digitales y brinda
                                        atención personalizada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:flex-col sm:align-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:text-center">
                            Planes de suscripción anual
                        </h2>
                        <p className="mt-5 text-xl text-gray-500 sm:text-center">
                            Elige el plan que mejor se adapte a tus necesidades
                            y comienza a disfrutar de atención médica de
                            calidad.
                        </p>
                    </div>
                    <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
                        {/* Basic Plan */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Básico
                                </h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold text-gray-900">
                                        $1,999
                                    </span>
                                    <span className="ml-1 text-xl font-medium text-gray-500">
                                        /año
                                    </span>
                                </div>
                                <p className="mt-5 text-gray-500">
                                    Ideal para individuos que necesitan
                                    servicios médicos ocasionales.
                                </p>
                            </div>
                            <div className="px-6 pt-6 pb-8">
                                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                                    Incluye
                                </h4>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Acceso a citas con médicos generales
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Expediente médico digital
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Descuentos en laboratorios
                                        </span>
                                    </li>
                                    <li className="flex space-x-3"></li>
                                </ul>
                                <div className="mt-8 sm:mt-19">
                                    <Link href="/auth?register=true">
                                        <Button
                                            variant="default"
                                            className="w-full"
                                        >
                                            Elegir plan
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-white border border-primary-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6 bg-primary-50">
                                <div className="absolute -mt-6 ml-4">
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-primary-800">
                                        Popular
                                    </span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Premium
                                </h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold text-gray-900">
                                        $3,499
                                    </span>
                                    <span className="ml-1 text-xl font-medium text-gray-500">
                                        /año
                                    </span>
                                </div>
                                <p className="mt-5 text-gray-500">
                                    Para familias o individuos que requieren
                                    atención médica regular.
                                </p>
                            </div>
                            <div className="px-6 pt-6 pb-8">
                                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                                    Incluye
                                </h4>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Todo lo del plan Básico
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Acceso a especialistas
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Consultas de emergencia 24/7
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            50% descuento en estudios
                                        </span>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link href="/auth?register=true">
                                        <Button
                                            variant="default"
                                            className="w-full"
                                        >
                                            Elegir plan
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Business Plan */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Empresarial
                                </h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold text-gray-900">
                                        $4,999
                                    </span>
                                    <span className="ml-1 text-xl font-medium text-gray-500">
                                        /año
                                    </span>
                                </div>
                                <p className="mt-5 text-gray-500">
                                    Para empresas que desean ofrecer beneficios
                                    de salud a sus empleados.
                                </p>
                            </div>
                            <div className="px-6 pt-6 pb-8">
                                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                                    Incluye
                                </h4>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Todo lo del plan Premium
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Panel de administración
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Reportes de uso y estadísticas
                                        </span>
                                    </li>
                                    <li className="flex space-x-3">
                                        <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="text-base text-gray-500">
                                            Atención prioritaria
                                        </span>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link href="/contacto">
                                        <Button
                                            variant="default"
                                            className="w-full"
                                        >
                                            Contactar ventas
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Especialidades Destacadas Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                            Especialidades
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Atención médica especializada
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Contamos con especialistas certificados en
                            diferentes áreas de la medicina para brindarte la
                            mejor atención.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto mb-8">
                        <div className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-800 mb-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-md font-medium text-gray-900">
                                Cardiología
                            </h3>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-800 mb-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.65"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-md font-medium text-gray-900">
                                Neurología
                            </h3>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-800 mb-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12.75l6 6 9-13.5"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-md font-medium text-gray-900">
                                Pediatría
                            </h3>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-800 mb-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-md font-medium text-gray-900">
                                Oftalmología
                            </h3>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/especialidades">
                            <Button variant="outline" className="mx-auto mt-4">
                                Ver todas las especialidades
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                            Testimonios
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Lo que dicen nuestros usuarios
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-12 w-12 rounded-full"
                                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt="Usuario"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-bold">
                                                Laura Martínez
                                            </h4>
                                            <div className="mt-1 flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-4 w-4 text-yellow-400 fill-current"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <blockquote className="mt-4 text-gray-600">
                                        "MediConnect me ha cambiado la vida.
                                        Puedo programar citas sin complicaciones
                                        y siempre encuentro al especialista que
                                        necesito."
                                    </blockquote>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-12 w-12 rounded-full"
                                                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt="Usuario"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-bold">
                                                Carlos Sánchez
                                            </h4>
                                            <div className="mt-1 flex items-center">
                                                {[...Array(4)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-4 w-4 text-yellow-400 fill-current"
                                                    />
                                                ))}
                                                <Star className="h-4 w-4 text-yellow-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <blockquote className="mt-4 text-gray-600">
                                        "Como médico, puedo organizar mejor mi
                                        agenda y atender más pacientes. El
                                        expediente digital me permite dar un
                                        seguimiento óptimo."
                                    </blockquote>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-12 w-12 rounded-full"
                                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt="Usuario"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-bold">
                                                Miguel Rodríguez
                                            </h4>
                                            <div className="mt-1 flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-4 w-4 text-yellow-400 fill-current"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <blockquote className="mt-4 text-gray-600">
                                        "Contratamos el plan empresarial para
                                        nuestros empleados y ha sido una
                                        excelente inversión. La atención es de
                                        primera calidad."
                                    </blockquote>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* <Footer /> */}
        </div>
    );
}

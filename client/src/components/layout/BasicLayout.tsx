import { Link } from "wouter";
import { ReactNode } from "react";

interface BasicLayoutProps {
    children: ReactNode;
}

export default function BasicLayout({ children }: BasicLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="py-4 border-b bg-background">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/">
                        <a className="text-2xl font-bold text-primary">
                            MediConnectasdfasd
                        </a>
                    </Link>
                    <nav>
                        <ul className="flex space-x-6">
                            <li>
                                <Link href="/">
                                    <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                        Inicio
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/especialidades">
                                    <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                        Especialidades
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/como-funciona">
                                    <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                        Cómo Funciona
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/catalogo-laboratorio">
                                    <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                        Catálogo de Laboratorio
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/precios">
                                    <a className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                        Precios
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth">
                                    <a className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                        Iniciar Sesión
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <main className="flex-1 bg-background">{children}</main>
            <footer className="py-6 border-t bg-background">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                MediConnect
                            </h3>
                            <p className="text-sm text-gray-500">
                                Plataforma médica para conectar pacientes con
                                profesionales de la salud.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Enlaces
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/especialidades">
                                        <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            Especialidades
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/como-funciona">
                                        <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            Cómo Funciona
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/precios">
                                        <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            Precios
                                        </a>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/legal/terminos">
                                        <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            Términos y Condiciones
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/legal/privacidad">
                                        <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            Política de Privacidad
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/legal/politicas">
                                        <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                                            Política de Cookies
                                        </a>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Contacto
                            </h3>
                            <p className="text-sm text-gray-500">
                                contacto@mediconnect.com
                                <br />
                                Tel: (55) 1234-5678
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t">
                        <p className="text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} MediConnect. Todos los
                            derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

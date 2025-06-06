import React from "react";
import { Switch, Route } from "wouter";

// Páginas públicas
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import QuienesSomosPage from "@/pages/quienes-somos";
import EspecialidadesPage from "@/pages/especialidades";
import EspecialidadDetallePage from "@/pages/especialidad-detalle";
import ContactoPage from "@/pages/contacto";
import ComoFuncionaPage from "@/pages/como-funciona";
import CatalogoLaboratorioPage from "@/pages/catalogo-laboratorio";
import LaboratoryPortal from "@/pages/laboratory-portal";
import PreciosPage from "@/pages/precios";

// Dashboard
import DashboardRoutes from "@/components/layout/DashboardRoutes";

// Layouts y utilidades
import WWWLayout from "@/layouts/WWWLayout";
import { getCurrentSubdomain, SUBDOMAINS } from "@/lib/subdomain";
import { useAuth } from "@/hooks/use-auth";
import SobreNosotrosPage from "./pages/sobre-nosotros";

const App: React.FC = () => {
    const { user } = useAuth();
    const currentSubdomain = getCurrentSubdomain();

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const subdomainParam = params.get("subdomain");

        if (subdomainParam && import.meta.env.PROD) {
            const path = window.location.pathname;
            const subdomain = subdomainParam;
            const currentOrigin = window.location.origin;
            const domainParts = currentOrigin.split("://");
            const protocol = domainParts[0];
            const domain = domainParts[1];
            const targetUrl = `${protocol}://${subdomain}.${domain}${path}`;
            window.location.href = targetUrl;
        }
    }, []);

    return (
        <Switch>
            {/* Rutas públicas con WWWLayout */}
            <Route
                path="/"
                component={() => (
                    <WWWLayout>
                        <HomePage />
                    </WWWLayout>
                )}
            />
            <Route
                path="/auth"
                component={() => (
                    <WWWLayout>
                        <AuthPage />
                    </WWWLayout>
                )}
            />
            <Route
                path="/auth-page"
                component={() => (
                    <WWWLayout>
                        <AuthPage />
                    </WWWLayout>
                )}
            />
            <Route
                path="/quienes-somos"
                component={() => (
                    <WWWLayout>
                        <QuienesSomosPage />
                    </WWWLayout>
                )}
            />
            <Route
                path="/especialidades"
                component={() => (
                    <WWWLayout>
                        <EspecialidadesPage />
                    </WWWLayout>
                )}
            />
            <Route path="/especialidad/:id">
                {params => (
                    <WWWLayout>
                        <EspecialidadDetallePage />
                    </WWWLayout>
                )}
            </Route>
            <Route
                path="/precios"
                component={() => (
                    <WWWLayout>
                        <PreciosPage />
                    </WWWLayout>
                )}
            />

            <Route
                path="/contacto"
                component={() => (
                    <WWWLayout>
                        <ContactoPage />
                    </WWWLayout>
                )}
            />
            <Route
                path="/como-funciona"
                component={() => (
                    <WWWLayout>
                        <ComoFuncionaPage />
                    </WWWLayout>
                )}
            />
            <Route
                path="/catalogo-laboratorio"
                component={() => (
                    <WWWLayout>
                        <CatalogoLaboratorioPage />
                    </WWWLayout>
                )}
            />

            <Route
                path="/sobre-nosotros"
                component={() => (
                    <WWWLayout>
                        <SobreNosotrosPage />
                    </WWWLayout>
                )}
            />
            <Route
                path="/laboratory-portal"
                component={() => (
                    <WWWLayout>
                        <LaboratoryPortal />
                    </WWWLayout>
                )}
            />

            {/* Rutas del dashboard sin WWWLayout */}
            <DashboardRoutes />

            {/* Página 404 pública */}
            <Route
                component={() => (
                    <WWWLayout>
                        <NotFound />
                    </WWWLayout>
                )}
            />
        </Switch>
    );
};

export default App;

import React, { ReactNode } from "react";
import { Switch, Route } from "wouter";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Componente envoltorio para simular un comportamiento similar a Outlet de React Router
// Recibe rutas hijas como children y las renderiza dentro del contexto layout adecuado
interface RouteOutletProps {
    children: ReactNode;
}

export const RouteOutlet: React.FC<RouteOutletProps> = ({ children }) => {
    return (
        <div className="w-full">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                }
            >
                {/* <Switch> */}
                {children}
                {/* </Switch> */}
            </Suspense>
        </div>
    );
};

// Componente para cargar páginas de forma dinámica con suspense
interface LazyPageProps {
    importPath: () => Promise<any>;
}

export const LazyPage: React.FC<LazyPageProps> = ({ importPath }) => {
    const Component = React.lazy(importPath);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <Component />
        </Suspense>
    );
};

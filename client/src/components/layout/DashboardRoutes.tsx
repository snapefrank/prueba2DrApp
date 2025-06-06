import React from "react";
import { Route } from "wouter";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import BienvenidaDashboard from "@/pages/dashboard/BienvenidaDashboard";
import NotFound from "@/pages/not-found";
import { LazyPage } from "@/components/layout/RouteOutlet";

/**
 * Componente que renderiza todas las rutas del dashboard con protección por roles
 */
const DashboardRoutes: React.FC = () => {
    return (
        <>
            {/* Ruta principal del dashboard */}
            <Route path="/dashboard">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute
                            allowedRoles={["doctor", "admin", "patient"]}
                        >
                            <DashboardLayout>
                                <BienvenidaDashboard />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para pacientes (gestión por doctores) */}
            <Route path="/dashboard/pacientes">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/doctor/pacientes"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            <Route path="/dashboard/consulta">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/doctor/consulta"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            <Route path="/dashboard/diagnostico-ai">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        // Se carga componente temporal
                                        import(
                                            "@/pages/dashboard/doctor/appointment-form"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            <Route path="/dashboard/mensajes">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/doctor/mensajes"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            <Route path="/dashboard/configuracion">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/configuracion"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Ruta para nuevo paciente */}
            <Route path="/dashboard/pacientes/nuevo">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <LazyPage
                                importPath={() =>
                                    import(
                                        "@/pages/dashboard/doctor/patient-form"
                                    )
                                }
                            />
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para dashboard de pacientes */}
            <Route path="/dashboard/patient">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["patient"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/patient/index"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Citas del paciente */}
            <Route path="/dashboard/patient/appointments">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["patient"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/patient/appointments"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Documentos del paciente */}
            <Route path="/dashboard/patient/documents">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["patient"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/patient/documents"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Historial médico del paciente */}
            <Route path="/dashboard/patient/medical-history">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["patient"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/patient/medical-history"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Perfil de doctor específico visto por paciente */}
            <Route path="/dashboard/patient/doctor/:id">
                {params => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["patient"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/patient/doctor/[id]"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para agenda */}
            <Route path="/dashboard/agenda">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/doctor/schedule"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Ruta para nueva cita */}
            <Route path="/dashboard/agenda/nueva">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/doctor/appointment-form"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para recetas */}
            <Route path="/dashboard/recetas">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import("@/pages/recetas/index")
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para laboratorio */}
            <Route path="/dashboard/laboratorio">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import("@/pages/laboratorio/index")
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para expedientes */}
            <Route path="/dashboard/expedientes">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/doctor/expedientes/index"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para perfil */}
            <Route path="/dashboard/perfil">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import("@/pages/dashboard/perfil")
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Rutas para suscripciones */}
            <Route path="/dashboard/suscripciones">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/suscripciones"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Ruta para tareas */}
            <Route path="/dashboard/tareas">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <LazyPage
                                    importPath={() =>
                                        import(
                                            "@/pages/dashboard/doctor/tareas"
                                        )
                                    }
                                />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route>

            {/* Ruta 404 para cualquier otra ruta bajo /dashboard */}
            {/* <Route path="/dashboard/:rest*">
                {() => (
                    <RouteGuard>
                        <RoleProtectedRoute allowedRoles={["doctor", "admin"]}>
                            <DashboardLayout>
                                <NotFound />
                            </DashboardLayout>
                        </RoleProtectedRoute>
                    </RouteGuard>
                )}
            </Route> */}
        </>
    );
};

export default DashboardRoutes;

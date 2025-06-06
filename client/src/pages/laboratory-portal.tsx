import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WWWLayout from "@/layouts/WWWLayout";

/**
 * Página de acceso al portal de laboratorio
 */
export default function LaboratoryPortal() {
  return (
    <WWWLayout>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">Portal de Laboratorio</h1>
            <p className="mt-2 text-lg text-gray-600">
              Gestión completa de estudios clínicos y resultados
            </p>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Iniciar sesión como laboratorio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-center text-gray-600">
                  Accede al panel de control para administrar solicitudes de estudios,
                  gestionar resultados y más.
                </p>
                
                <div className="flex flex-col space-y-3">
                  <Link href="/auth?type=laboratory">
                    <Button className="w-full">Iniciar sesión</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">Volver a la página principal</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Características del portal</h2>
            
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Gestión de catálogo de estudios clínicos</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Administración de solicitudes de estudios</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Programación y seguimiento de estudios</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Carga y distribución de resultados</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Gestión de historial de pacientes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </WWWLayout>
  );
}
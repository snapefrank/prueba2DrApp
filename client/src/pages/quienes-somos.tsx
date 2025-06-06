import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QuienesSomosPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Quiénes Somos</h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Nuestra Misión</h2>
            <p className="text-lg mb-6">
              En MediConnect, nos dedicamos a transformar la experiencia de atención médica en México, 
              conectando pacientes con profesionales de la salud de manera sencilla y eficiente. 
              Nuestra plataforma facilita el acceso a servicios médicos de calidad para todos.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Nuestra Visión</h2>
            <p className="text-lg mb-6">
              Aspiramos a ser la plataforma líder en servicios de salud digital en México y América Latina,
              mejorando la calidad de vida de millones de personas a través de tecnología innovadora
              y servicios centrados en el paciente.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Nuestro Equipo</h2>
            <p className="text-lg mb-6">
              Somos un equipo multidisciplinario de profesionales apasionados por la salud y la tecnología,
              comprometidos con la mejora continua de los servicios médicos a través de soluciones digitales
              innovadoras y accesibles.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Profesionales de Salud</h3>
                <p>
                  Médicos especialistas, enfermeros, y otros profesionales de la salud que aseguran
                  que nuestros servicios cumplan con los más altos estándares médicos.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Equipo Tecnológico</h3>
                <p>
                  Ingenieros, desarrolladores y diseñadores comprometidos con crear
                  una plataforma intuitiva, segura y eficiente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Nuestros Valores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Excelencia</h3>
                <p>Nos esforzamos por ofrecer servicios de la más alta calidad en todo momento.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Accesibilidad</h3>
                <p>Trabajamos para hacer que la atención médica sea accesible para todos.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Innovación</h3>
                <p>Buscamos constantemente nuevas formas de mejorar nuestros servicios.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Confidencialidad</h3>
                <p>Protegemos la privacidad y seguridad de la información de nuestros usuarios.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Integridad</h3>
                <p>Actuamos con honestidad y transparencia en todas nuestras operaciones.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Empatía</h3>
                <p>Nos preocupamos por entender y atender las necesidades de nuestros usuarios.</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/contacto">Contáctanos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuscripcionesPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Suscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-bold">Gestión de Suscripciones</h1>
          <p className="mt-4">Esta página permitirá a los usuarios ver y administrar sus planes de suscripción.</p>
        </CardContent>
      </Card>
    </div>
  );
}

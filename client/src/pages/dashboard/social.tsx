import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsList } from "@/components/social/contacts-list";
import { DoctorRecommendations } from "@/components/social/doctor-recommendations";
import { DoctorReviews } from "@/components/social/doctor-reviews";
import { ContactImport } from "@/components/social/contact-import";
import { Users, Star, Heart, Upload } from "lucide-react";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("contacts");

  return (
    <>
      <Helmet>
        <title>Red Social | MediConnect</title>
      </Helmet>
      <DashboardLayout>
        <DashboardHeader
          heading="Red Social Médica"
          description="Conecta con amigos, recomienda médicos y comparte experiencias"
        />
        <div className="space-y-4">
          <Tabs
            defaultValue="contacts"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-4 h-auto gap-4 bg-transparent p-0">
              <TabsTrigger
                value="contacts"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center justify-center gap-1 rounded-lg border bg-background p-3 hover:bg-muted"
              >
                <Users className="h-5 w-5" />
                <div className="text-sm font-medium">Contactos</div>
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center justify-center gap-1 rounded-lg border bg-background p-3 hover:bg-muted"
              >
                <Heart className="h-5 w-5" />
                <div className="text-sm font-medium">Recomendaciones</div>
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center justify-center gap-1 rounded-lg border bg-background p-3 hover:bg-muted"
              >
                <Star className="h-5 w-5" />
                <div className="text-sm font-medium">Reseñas</div>
              </TabsTrigger>
              <TabsTrigger
                value="import"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center justify-center gap-1 rounded-lg border bg-background p-3 hover:bg-muted"
              >
                <Upload className="h-5 w-5" />
                <div className="text-sm font-medium">Importar</div>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="contacts" className="space-y-4">
              <ContactsList />
            </TabsContent>
            <TabsContent value="recommendations" className="space-y-4">
              <DoctorRecommendations />
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4">
              <DoctorReviews />
            </TabsContent>
            <TabsContent value="import" className="space-y-4">
              <ContactImport />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
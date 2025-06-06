import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Política de Privacidad</h1>
          
          <div className="prose prose-primary max-w-none">
            <p className="text-lg">
              Última actualización: 9 de abril de 2025
            </p>
            
            <h2>1. Introducción</h2>
            <p>
              En MediConnect, valoramos y respetamos su privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos su información personal cuando utiliza nuestra plataforma médica. Por favor, lea detenidamente esta política para entender nuestro compromiso con la protección de sus datos.
            </p>
            
            <h2>2. Información que Recopilamos</h2>
            <p>
              Podemos recopilar los siguientes tipos de información:
            </p>
            <ul>
              <li>
                <strong>Información de Identificación Personal:</strong> Nombre, dirección, número de teléfono, correo electrónico, fecha de nacimiento, número de identificación, etc.
              </li>
              <li>
                <strong>Información Médica:</strong> Historial médico, diagnósticos, tratamientos, medicamentos, alergias, etc.
              </li>
              <li>
                <strong>Información de Pago:</strong> Datos de tarjetas de crédito, información bancaria, etc. (procesados por nuestros proveedores de servicios de pago).
              </li>
              <li>
                <strong>Información de Uso:</strong> Datos sobre cómo utiliza nuestra plataforma, preferencias, etc.
              </li>
              <li>
                <strong>Información Técnica:</strong> Dirección IP, tipo de navegador, dispositivo, sistema operativo, etc.
              </li>
            </ul>
            
            <h2>3. Cómo Recopilamos su Información</h2>
            <p>
              Recopilamos información a través de:
            </p>
            <ul>
              <li>Formularios de registro y perfiles de usuario</li>
              <li>Interacciones con profesionales de la salud a través de nuestra plataforma</li>
              <li>Citas y consultas médicas</li>
              <li>Uso de nuestros servicios y funcionalidades</li>
              <li>Cookies y tecnologías similares</li>
              <li>Comunicaciones con nuestro equipo de soporte</li>
            </ul>
            
            <h2>4. Cómo Utilizamos su Información</h2>
            <p>
              Utilizamos su información para:
            </p>
            <ul>
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Facilitar la comunicación entre pacientes y profesionales de la salud</li>
              <li>Gestionar citas médicas y recordatorios</li>
              <li>Mantener expedientes médicos digitales</li>
              <li>Procesar pagos y gestionar suscripciones</li>
              <li>Enviar notificaciones importantes sobre nuestros servicios</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Prevenir fraudes y proteger nuestros derechos y propiedades</li>
            </ul>
            
            <h2>5. Compartir su Información</h2>
            <p>
              Podemos compartir su información con:
            </p>
            <ul>
              <li>
                <strong>Profesionales de la Salud:</strong> Los médicos y especialistas con los que programa citas tendrán acceso a su información médica relevante para proporcionar atención médica.
              </li>
              <li>
                <strong>Proveedores de Servicios:</strong> Terceros que nos ayudan a operar nuestra plataforma, procesar pagos, analizar datos, etc.
              </li>
              <li>
                <strong>Socios Comerciales:</strong> Laboratorios y otros proveedores de servicios médicos con los que colaboramos para ofrecer descuentos y servicios adicionales.
              </li>
              <li>
                <strong>Autoridades y Entidades Reguladoras:</strong> Cuando sea requerido por ley, orden judicial o para proteger nuestros derechos legales.
              </li>
            </ul>
            
            <h2>6. Seguridad de la Información</h2>
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información personal contra acceso no autorizado, divulgación, alteración o destrucción. Estas medidas incluyen:
            </p>
            <ul>
              <li>Encriptación de datos sensibles</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo y auditorías de seguridad regulares</li>
              <li>Formación de personal en prácticas de privacidad y seguridad</li>
            </ul>
            
            <h2>7. Sus Derechos sobre sus Datos</h2>
            <p>
              Dependiendo de su ubicación, puede tener los siguientes derechos:
            </p>
            <ul>
              <li>Acceder a su información personal</li>
              <li>Corregir información inexacta</li>
              <li>Eliminar su información en ciertas circunstancias</li>
              <li>Restringir u oponerse al procesamiento de su información</li>
              <li>Solicitar la portabilidad de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
            <p>
              Para ejercer estos derechos, contáctenos a través de las opciones proporcionadas en la sección "Contacto".
            </p>
            
            <h2>8. Retención de Datos</h2>
            <p>
              Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta Política de Privacidad, a menos que la ley exija un período de retención más largo (como en el caso de registros médicos).
            </p>
            
            <h2>9. Menores</h2>
            <p>
              Nuestros servicios no están dirigidos a menores de 18 años sin el consentimiento y supervisión de un padre o tutor legal. No recopilamos intencionalmente información de menores sin el consentimiento verificable de un padre o tutor legal.
            </p>
            
            <h2>10. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas de información. Le notificaremos sobre cualquier cambio material publicando la nueva Política de Privacidad en nuestra plataforma y, cuando sea apropiado, enviándole una notificación.
            </p>
            
            <h2>11. Cookies y Tecnologías Similares</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el tráfico y personalizar el contenido. Puede gestionar sus preferencias de cookies a través de la configuración de su navegador.
            </p>
            
            <h2>12. Contacto</h2>
            <p>
              Si tiene alguna pregunta, inquietud o solicitud relacionada con esta Política de Privacidad o el tratamiento de sus datos personales, por favor contáctenos:
            </p>
            <ul>
              <li>Email: privacidad@mediconnect.com</li>
              <li>Dirección: [Dirección de la empresa]</li>
              <li>Teléfono: [Número de teléfono]</li>
            </ul>
            <p>
              Responderemos a su solicitud tan pronto como sea posible, dentro de los plazos establecidos por la ley aplicable.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PoliticasPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Política de Cookies</h1>
          
          <div className="prose prose-primary max-w-none">
            <p className="text-lg">
              Última actualización: 9 de abril de 2025
            </p>
            
            <h2>1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (computadora, teléfono móvil o tablet) cuando visita nuestra plataforma MediConnect. Estas cookies nos permiten reconocer su dispositivo y recordar ciertas informaciones sobre su visita, como sus preferencias de idioma y configuraciones.
            </p>
            
            <h2>2. Tipos de cookies que utilizamos</h2>
            <p>
              En MediConnect utilizamos los siguientes tipos de cookies:
            </p>
            <ul>
              <li>
                <strong>Cookies esenciales:</strong> Estas cookies son necesarias para el funcionamiento de nuestra plataforma. Le permiten navegar por el sitio y utilizar funciones esenciales como áreas seguras, carritos de compras y facturación electrónica.
              </li>
              <li>
                <strong>Cookies de rendimiento:</strong> Estas cookies recopilan información sobre cómo utiliza nuestra plataforma, como qué páginas visita con más frecuencia y si recibe mensajes de error. No recopilan información que lo identifique; toda la información es anónima y se utiliza únicamente para mejorar el funcionamiento de nuestro sitio.
              </li>
              <li>
                <strong>Cookies de funcionalidad:</strong> Estas cookies permiten que nuestra plataforma recuerde las elecciones que hace (como su nombre de usuario, idioma o la región en la que se encuentra) y proporcione funciones mejoradas y más personales.
              </li>
              <li>
                <strong>Cookies de publicidad:</strong> Estas cookies se utilizan para mostrar anuncios que pueden ser relevantes para usted según sus hábitos de navegación. También limitan el número de veces que ve un anuncio y nos ayudan a medir la efectividad de nuestras campañas publicitarias.
              </li>
              <li>
                <strong>Cookies de terceros:</strong> Nuestra plataforma puede contener cookies de terceros, como servicios analíticos, redes sociales y socios publicitarios. Estas cookies pueden rastrear su navegación en diferentes sitios web.
              </li>
            </ul>
            
            <h2>3. Cómo utilizamos las cookies</h2>
            <p>
              Utilizamos cookies para:
            </p>
            <ul>
              <li>Asegurar que nuestra plataforma funcione correctamente</li>
              <li>Guardar sus preferencias de navegación</li>
              <li>Mejorar el rendimiento de nuestra plataforma</li>
              <li>Analizar cómo se utiliza nuestra plataforma</li>
              <li>Personalizar su experiencia</li>
              <li>Proporcionar funciones sociales</li>
              <li>Mostrar anuncios relevantes (si aplicable)</li>
            </ul>
            
            <h2>4. Sus opciones respecto a las cookies</h2>
            <p>
              Puede controlar y gestionar las cookies de varias maneras:
            </p>
            <ul>
              <li>
                <strong>Configuración del navegador:</strong> Puede configurar su navegador para que rechace todas las cookies o para que le avise cuando se envíe una cookie. Sin embargo, si bloquea todas las cookies, es posible que algunas partes de nuestra plataforma no funcionen correctamente.
              </li>
              <li>
                <strong>Centro de preferencias de cookies:</strong> Utilizamos un centro de preferencias de cookies en nuestra plataforma que le permite seleccionar qué categorías de cookies desea aceptar o rechazar.
              </li>
              <li>
                <strong>Herramientas específicas de terceros:</strong> Algunos terceros proporcionan herramientas específicas para rechazar sus cookies. Por ejemplo, las cookies de Google Analytics pueden bloquearse con el Complemento de inhabilitación para navegadores de Google Analytics.
              </li>
            </ul>
            
            <h2>5. Cookies específicas que utilizamos</h2>
            <p>
              A continuación se muestra una lista de las principales cookies que utilizamos:
            </p>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propósito</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caducidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">sessionId</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">MediConnect</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Mantiene su sesión activa</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sesión</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">preferences</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">MediConnect</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Recuerda sus preferencias de plataforma</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 año</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">_ga</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Analítica de uso</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 años</td>
                </tr>
              </tbody>
            </table>
            
            <h2>6. Cambios en nuestra Política de Cookies</h2>
            <p>
              Podemos actualizar nuestra Política de Cookies de vez en cuando para reflejar cambios en las cookies que utilizamos o por otros motivos operativos, legales o regulatorios. Por favor, visite esta página regularmente para estar informado sobre el uso de cookies y tecnologías relacionadas.
            </p>
            
            <h2>7. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre nuestra Política de Cookies, por favor contáctenos en:
            </p>
            <ul>
              <li>Email: privacidad@mediconnect.com</li>
              <li>A través de nuestro formulario de contacto en la plataforma</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
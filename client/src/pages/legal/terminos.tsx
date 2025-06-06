import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Términos y Condiciones</h1>
          
          <div className="prose prose-primary max-w-none">
            <p className="text-lg">
              Última actualización: 9 de abril de 2025
            </p>
            
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar la plataforma MediConnect, usted acepta estar sujeto a estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.
            </p>
            
            <h2>2. Descripción del Servicio</h2>
            <p>
              MediConnect es una plataforma médica basada en suscripción que facilita la conexión entre pacientes y profesionales de la salud. Ofrecemos servicios de gestión de citas, expediente médico digital, recetas electrónicas y acceso a descuentos en servicios de laboratorio.
            </p>
            
            <h2>3. Cuentas de Usuario</h2>
            <p>
              3.1. Para utilizar ciertos servicios de MediConnect, debe crear una cuenta. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña y de restringir el acceso a su computadora.
            </p>
            <p>
              3.2. Acepta asumir la responsabilidad de todas las actividades que ocurran bajo su cuenta o contraseña. MediConnect se reserva el derecho de rechazar el servicio, terminar cuentas, eliminar o editar contenido a su sola discreción.
            </p>
            
            <h2>4. Tipos de Usuarios</h2>
            <p>
              4.1. <strong>Pacientes:</strong> Usuarios que buscan atención médica a través de la plataforma.
            </p>
            <p>
              4.2. <strong>Profesionales de la Salud:</strong> Médicos, especialistas y otros proveedores de servicios de salud que ofrecen sus servicios a través de la plataforma.
            </p>
            <p>
              4.3. <strong>Administradores:</strong> Personal de MediConnect encargado de la gestión de la plataforma.
            </p>
            
            <h2>5. Planes de Suscripción y Pagos</h2>
            <p>
              5.1. MediConnect ofrece varios planes de suscripción con diferentes niveles de servicio.
            </p>
            <p>
              5.2. Los pagos por suscripciones son procesados por nuestro proveedor de pagos Stripe. Al proporcionar información de pago, usted declara y garantiza que está autorizado a utilizar el método de pago especificado.
            </p>
            <p>
              5.3. Las suscripciones se renuevan automáticamente al final de cada período hasta que se cancelen. Puede cancelar su suscripción en cualquier momento desde su cuenta.
            </p>
            
            <h2>6. Privacidad y Datos Médicos</h2>
            <p>
              6.1. La privacidad de su información médica es de suma importancia. Todos los datos médicos se tratan de acuerdo con las regulaciones aplicables de protección de datos y confidencialidad médica.
            </p>
            <p>
              6.2. Al utilizar nuestra plataforma, usted autoriza la recopilación, uso y procesamiento de su información personal y médica de acuerdo con nuestra Política de Privacidad.
            </p>
            
            <h2>7. Responsabilidades del Usuario</h2>
            <p>
              7.1. <strong>Pacientes:</strong> Proporcionar información precisa y completa sobre su estado de salud. Asistir a las citas programadas o cancelarlas con suficiente antelación.
            </p>
            <p>
              7.2. <strong>Profesionales de la Salud:</strong> Proporcionar información precisa sobre sus credenciales y especialidades. Mantener la confidencialidad de la información del paciente. Cumplir con todas las leyes y regulaciones médicas aplicables.
            </p>
            
            <h2>8. Limitación de Responsabilidad</h2>
            <p>
              8.1. MediConnect no es responsable de la calidad de la atención médica proporcionada por los profesionales independientes que utilizan nuestra plataforma.
            </p>
            <p>
              8.2. Nuestra plataforma no reemplaza la atención médica de emergencia. En caso de emergencia médica, contacte inmediatamente a los servicios de emergencia.
            </p>
            
            <h2>9. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, características y funcionalidad en la plataforma MediConnect, incluyendo pero no limitado a texto, gráficos, logos, íconos, imágenes, clips de audio, descargas digitales y software, son propiedad de MediConnect y están protegidos por leyes de propiedad intelectual.
            </p>
            
            <h2>10. Cambios en los Términos</h2>
            <p>
              MediConnect se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma. Su uso continuado de la plataforma después de la publicación de los cambios constituirá su aceptación de los términos modificados.
            </p>
            
            <h2>11. Ley Aplicable</h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de México, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
            </p>
            
            <h2>12. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre estos Términos, por favor contáctenos a través de la sección de contacto en nuestra plataforma o enviando un correo electrónico a legal@mediconnect.com.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
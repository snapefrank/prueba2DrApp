import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <span className="text-xl font-bold text-primary">MediConnect</span>
            </Link>
            <p className="mt-4 text-gray-600 text-sm">
              Transformando la experiencia médica en México con tecnología, 
              conectando a pacientes con los mejores profesionales de la salud de manera sencilla y segura.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          
          {/* Navegación */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Información
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/especialidades" className="text-base text-gray-500 hover:text-gray-900">
                  Especialidades
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-base text-gray-500 hover:text-gray-900">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/precios" className="text-base text-gray-500 hover:text-gray-900">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-base text-gray-500 hover:text-gray-900">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/catalogo-laboratorio" className="text-base text-gray-500 hover:text-gray-900">
                  Catálogo de laboratorio
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/legal/terminos" className="text-base text-gray-500 hover:text-gray-900">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="text-base text-gray-500 hover:text-gray-900">
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-base text-gray-500 hover:text-gray-900">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex">
                <Mail className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-500">contacto@mediconnect.mx</span>
              </li>
              <li className="flex">
                <Phone className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-500">+52 (55) 1234 5678</span>
              </li>
              <li className="flex">
                <MapPin className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-500">Ciudad de México, México</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-400">
            &copy; {currentYear} MediConnect. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
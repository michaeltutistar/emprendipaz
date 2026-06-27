import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <img src="/emprendipaz.png" alt="EmprendiPaz" className="h-12" />
            </div>
            <p className="text-gray-300 mb-4">
              Este proyecto lo desarrolla la Gobernacion de nariño, con principios
              de transparencia, equidad y acompañamiento a los jóvenes emprendedores del departamento.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Inicio</a></li>
              <li><a href="/#caracteristicas" className="text-gray-300 hover:text-white transition-colors">Fases</a></li>
              <li><a href="/#beneficios" className="text-gray-300 hover:text-white transition-colors">Cobertura</a></li>
              <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Iniciar Sesión</Link></li>
              {/* Link de Subsanación deshabilitado por solicitud del usuario */}
              {/* <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Subsanación
                </Link>
              </li> */}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2 text-gray-300">
              <p>📧 consorcioprimeronarino@gmail.com </p>
              <p>📍 Pasto, Nariño, Colombia</p>
              <p>🌐 www.narino.gov.co</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2026 Gobernación de Nariño. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


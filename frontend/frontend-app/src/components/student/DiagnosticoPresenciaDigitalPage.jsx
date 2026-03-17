import React from 'react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import Footer from '../Footer';
import { 
  ArrowLeft,
  Lock,
  Play,
  CheckCircle,
  Settings,
  Flag,
  ArrowRight
} from 'lucide-react';

const DiagnosticoPresenciaDigitalPage = () => {
  const navigate = useNavigate();

  // NOTA: Esta página es solo de navegación, NO debe registrar progreso
  // El progreso se registra en las subpáginas (Inicio, Desarrollo, Cierre)

  const pasos = [
    {
      id: 1,
      titulo: "Inicio",
      descripcion: "Introducción al diagnóstico de presencia digital",
      bloqueado: true,
      color: "from-orange-400 to-orange-500",
      colorAccent: "from-red-400 to-red-500",
      icono: Play
    },
    {
      id: 2,
      titulo: "Desarrollo",
      descripcion: "Herramientas y metodologías de análisis",
      bloqueado: false,
      color: "from-orange-500 to-orange-600",
      colorAccent: "from-yellow-400 to-yellow-500",
      icono: Settings
    },
    {
      id: 3,
      titulo: "Cierre",
      descripcion: "Evaluación y conclusiones del diagnóstico",
      bloqueado: true,
      color: "from-orange-600 to-orange-700",
      colorAccent: "from-amber-400 to-amber-500",
      icono: Flag
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100">
      
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student/marketing-digital')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-blue-900">EmprendiPaz</h1>
              <p className="text-sm text-blue-700">Para jóvenes que transforman territorios</p>
            </div>
          </div>
        </div>
      </div>

      
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 mb-12 shadow-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              Unidad 1: Diagnóstico de Presencia Digital
            </h1>
            <p className="text-orange-100 text-center mt-4 text-lg">
              Evalúa tu presencia actual en el mundo digital
            </p>
          </div>

          
          <div className="space-y-6 mb-16">
            {pasos.map((paso) => {
              const IconoComponente = paso.icono;
              return (
                <div
                  key={paso.id}
                  className={[
                    'relative bg-gradient-to-r',
                    paso.color,
                    'rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-102',
                    paso.bloqueado ? 'opacity-80' : 'cursor-pointer hover:scale-105',
                    paso.id === 2 ? 'opacity-80' : ''
                  ].join(' ')}
                  onClick={() => {
                    if (paso.id === 1) {
                      navigate('/student/diagnostico-presencia-digital/inicio');
                    }
                    if (paso.id === 2) {
                      navigate('/student/diagnostico-presencia-digital/desarrollo');
                    }
                    if (paso.id === 3) {
                      navigate('/student/diagnostico-presencia-digital/cierre');
                    }
                  }}
                >
                  
                  <div className={['absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', paso.colorAccent, 'rounded-t-2xl'].join(' ')}></div>
                  
                  <div className="flex items-center space-x-6">
                    
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-white/25 rounded-full flex items-center justify-center shadow-lg">
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {paso.titulo}
                      </h3>
                      <p className="text-white/90 text-lg">
                        {paso.descripcion}
                      </p>
                    </div>

                    
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 bg-gradient-to-r ${paso.colorAccent} rounded-full flex items-center justify-center shadow-lg`}>
                        <IconoComponente className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  
                  <div className="mt-6">
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div 
                        className={['bg-gradient-to-r', paso.colorAccent, 'h-3 rounded-full transition-all duration-700'].join(' ')}
                        style={{ width: paso.bloqueado ? '0%' : '100%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-white/80 text-sm">
                      <span>Progreso</span>
                      <span>{paso.bloqueado ? '0%' : '100%'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* El contenido de Desarrollo vive en la página /student/diagnostico-presencia-digital/desarrollo */}

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-12 border border-white/20">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              ¿Qué aprenderás en está unidad?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4 group">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 text-lg font-medium">Evaluación de tu presencia actual en redes sociales</p>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 text-lg font-medium">Análisis de tu sitio web y SEO</p>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 text-lg font-medium">Identificación de oportunidades de mejora</p>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 text-lg font-medium">Herramientas de análisis digital</p>
              </div>
            </div>
          </div>

          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/student/marketing-digital')}
              className="group bg-gray-500 hover:bg-gray-600 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center space-x-3">
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" />
                <span>VOLVER A LA PÁGINA PRINCIPAL</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default DiagnosticoPresenciaDigitalPage;

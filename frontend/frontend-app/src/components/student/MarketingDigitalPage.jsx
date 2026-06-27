import React from 'react';

import { Button } from '../ui/button';

import { useNavigate } from 'react-router-dom';

import StudentHeader from './StudentHeader';

import Footer from '../Footer';

import {

  Zap,

  Search,

  Share2,

  Feather,

  Mail,

  BarChart3,

  ArrowLeft,

  Play,

  Sparkles

} from 'lucide-react';



const MarketingDigitalPage = () => {

  const navigate = useNavigate();



  // Mantener la estructura original de modules

  const modules = [

    {

      id: 1,

      title: "Programación del módulo",

      description: "Planificación y estructura del contenido"

    },

    {

      id: 2,

      title: "Presentación",

      description: "Introducción al marketing digital"

    },

    {

      id: 3,

      title: "Unidad 1: Diagnóstico de presencia digital",

      description: "Evaluación de tu presencia online actual"

    },

    {

      id: 4,

      title: "Unidad 2: Metas de marketing digital",

      description: "Definición de objetivos y estrategias"

    },

    {

      id: 5,

      title: "Unidad 3: Estrategias de marketing digital",

      description: "Implementación de tácticas digitales"

    },

    {

      id: 6,

      title: "Evaluación",

      description: "Medición de resultados y aprendizaje"

    },

    {

      id: 7,

      title: "Tu plan de negocios",

      description: "Desarrollo de tu estrategia empresarial"

    }

  ];



  return (

    <>

      <style>{`

        @keyframás shimmer {

          0% { background-position: -200% 0; }

          100% { background-position: 200% 0; }

        }

        .plan-negocios-card {

          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 15%, #d97706 30%, #f59e0b 45%, #d97706 60%, #f59e0b 75%, #fbbf24 90%, #f59e0b 100%) !important;

          background-size: 200% 100% !important;

          position: relative;

        }

        .plan-negocios-card::before {

          content: '';

          position: absolute;

          top: 0;

          left: 0;

          right: 0;

          bottom: 0;

          background: linear-gradient(135deg, 

            transparent 0%, 

            rgba(255, 255, 255, 0.4) 25%, 

            transparent 50%, 

            rgba(255, 255, 255, 0.4) 75%, 

            transparent 100%);

          background-size: 200% 100%;

          opacity: 0;

          pointer-events: none;

          border-radius: inherit;

          transition: opacity 0.3s ease;

        }

        .plan-negocios-card:hover::before {

          opacity: 1;

          animation: shimmer 2s ease-in-out infinite;

        }

        .plan-negocios-card::after {

          content: '';

          position: absolute;

          top: -2px;

          left: -2px;

          right: -2px;

          bottom: -2px;

          background: linear-gradient(135deg, 

            rgba(255, 255, 255, 0.8) 0%, 

            rgba(251, 191, 36, 0.6) 25%, 

            rgba(255, 255, 255, 0.8) 50%, 

            rgba(251, 191, 36, 0.6) 75%, 

            rgba(255, 255, 255, 0.8) 100%);

          background-size: 200% 100%;

          border-radius: inherit;

          z-index: -1;

          filter: blur(8px);

          opacity: 0;

          transition: opacity 0.3s ease, filter 0.3s ease;

        }

        .plan-negocios-card:hover::after {

          opacity: 1;

          filter: blur(12px);

          animation: shimmer 2.5s ease-in-out infinite;

        }

      `}</style>

      <div className="min-h-screen bg-white">

        {/* Header inspirado en el diseño */}

        <div className="bg-white shadow-sm border-b">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center py-4">

              <div className="flex items-center space-x-4">

                <button

                  onClick={() => navigate('/student/dashboard')}

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



        {/* Hero Section inspirado en el diseño */}

        <section className="relative bg-gradient-to-r from-green-500 via-green-400 to-blue-600 py-20 overflow-hidden">

          {/* Efectos diagonales de fondo */}

          <div className="absolute inset-0">

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>

            <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>

            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>

          </div>



          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">

              MARKETING DIGITAL

            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">

              Transformamás tu presencia digital con estrategias innovadoras diseñadas para jóvenes emprendedores que quieren impactar sus territorios.

            </p>

            <button

              onClick={() => navigate('/student/programacion-modulo')}

              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"

            >

              <Play className="w-5 h-5 mr-2" />

              COMIENZA AHORA

            </button>

          </div>

        </section>



        {/* Services Section - Mantener la lógica original pero con nuevo diseño */}

        <section className="py-20 bg-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">

              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">

                Nuestros Servicios

              </h2>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto">

                Soluciones digitales completas para el crecimiento de tu negocio

              </p>

            </div>



            {/* Grid de modulos con nuevo diseño visual pero lógica original */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {modules.map((module, index) => {

                const isPlanNegocios = module.id === 7;

                return (

                  <div

                    key={module.id}

                    onClick={() => {

                      if (module.id === 1) {

                        navigate('/student/programacion-modulo');

                      } else if (module.id === 2) {

                        navigate('/student/presentacion');

                      } else if (module.id === 3) {

                        navigate('/student/diagnostico-presencia-digital');

                      } else if (module.id === 4) {

                        navigate('/student/metas-marketing-digital');

                      } else if (module.id === 5) {

                        navigate('/student/estrategias-marketing-digital/desarrollo');

                      } else if (module.id === 6) {

                        navigate('/student/evaluacion');

                      } else if (module.id === 7) {

                        navigate('/student/marketing-digital/plan-negocio');

                      }

                    }}

                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden relative ${isPlanNegocios

                        ? 'md:col-span-2 md:col-start-1 lg:col-span-1 lg:col-start-2'

                        : ''

                      } ${isPlanNegocios ? 'plan-negocios-card' : ''}`}

                    style={isPlanNegocios ? {

                      boxShadow: '0 20px 60px rgba(217, 119, 6, 0.4), 0 0 40px rgba(251, 191, 36, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.2), 0 0 0 2px rgba(251, 191, 36, 0.8)'

                    } : {}}

                  >

                    {/* Efecto de brillo animado para la tarjeta especial */}

                    {isPlanNegocios && (

                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">

                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      </div>

                    )}



                    <div className={`p-8 relative z-10 ${isPlanNegocios ? 'text-white' : ''}`}>

                      {/* Icon con colores inspirados en el diseño */}

                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${module.id === 1 ? 'from-green-500 to-green-600' :

                          module.id === 2 ? 'from-yellow-400 to-yellow-600' :

                            module.id === 3 ? 'from-orange-500 to-orange-600' :

                              module.id === 4 ? 'from-blue-500 to-blue-600' :

                                module.id === 5 ? 'from-teal-500 to-teal-600' :

                                  isPlanNegocios ? 'from-yellow-200 via-amber-300 to-yellow-200' :

                                    'from-green-500 to-green-600'

                        } flex items-center justify-center ${isPlanNegocios ? 'text-amber-800 shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 'text-white'} mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 ${isPlanNegocios ? 'group-hover:shadow-[0_0_30px_rgba(251,191,36,1)]' : ''}`}>

                        {module.id === 1 ? <Zap className="w-8 h-8" /> :

                          module.id === 2 ? <Play className="w-8 h-8" /> :

                            module.id === 3 ? <Search className="w-8 h-8" /> :

                              module.id === 4 ? <Zap className="w-8 h-8" /> :

                                module.id === 5 ? <Share2 className="w-8 h-8" /> :

                                  isPlanNegocios ? <Sparkles className="w-8 h-8" /> :

                                    <BarChart3 className="w-8 h-8" />}

                      </div>



                      {/* Content */}

                      <h3 className={`text-xl font-bold text-center mb-4 transition-colors duration-300 ${isPlanNegocios

                          ? 'text-white drop-shadow-lg'

                          : 'text-blue-900 group-hover:text-green-600'

                        }`}>

                        {module.title}

                      </h3>

                      <p className={`text-center mb-6 leading-relaxed ${isPlanNegocios ? 'text-white/90' : 'text-gray-600'

                        }`}>

                        {module.description}

                      </p>



                      {/* Button */}

                      <div className="text-center">

                        <button className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 ${isPlanNegocios

                            ? 'bg-gradient-to-r from-white/20 to-white/30 text-white border-2 border-white/50 backdrop-blur-sm hover:from-white/30 hover:to-white/40 hover:border-white/70 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]'

                            : 'bg-gradient-to-r from-green-400 to-green-600 text-white'

                          }`}>

                          EXPLORAR

                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />

                          </svg>

                        </button>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        </section>



        {/* Footer */}

        <Footer />

      </div>

    </>

  );

};



export default MarketingDigitalPage;


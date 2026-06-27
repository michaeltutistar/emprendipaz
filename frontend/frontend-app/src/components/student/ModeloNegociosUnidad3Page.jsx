import React, { useState, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, Play, CheckCircle, ChevronDown, LogOut } from 'lucide-react';

import Footer from '../Footer';



const ModeloNegociosUnidad3Page = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const [activeStep, setActiveStep] = useState(1);

  const [completedSteps, setCompletedSteps] = useState(new Set([1]));



  useEffect(() => {

    const path = location.pathname;

    if (path.includes('/inicio')) {

      setActiveStep(1);

    } else if (path.includes('/desarrollo')) {

      setActiveStep(2);

    } else if (path.includes('/taller')) {

      setActiveStep(3);

    } else if (path.includes('/cierre')) {

      setActiveStep(4);

    }

  }, [location.pathname]);



  const steps = [

    {

      id: 1,

      nombre: 'Presentación',

      ruta: '/student/modelo-negocios/unidad3/inicio',

      descripcion: 'Video y contexto de la unidad sobre Recursos, Ingresos, Costos y Validación del Modelo'

    },

    {

      id: 2,

      nombre: 'Fundamentación',

      ruta: '/student/modelo-negocios/unidad3/desarrollo',

      descripcion: 'Fundamentos sobre recursos clave, análisis de costos, punto de equilibrio y validación'

    },

    {

      id: 3,

      nombre: 'Taller',

      ruta: '/student/modelo-negocios/unidad3/taller',

      descripcion: 'Aplica los conceptos de costos, ingresos y validación a tu emprendimiento'

    },

    {

      id: 4,

      nombre: 'Evaluación',

      ruta: '/student/modelo-negocios/unidad3/cierre',

      descripcion: 'Cuestionario sobre la unidad'

    }

  ];



  const handleStepClick = (step) => {

    setActiveStep(step.id);

    navigate(step.ruta);

  };



  return (

    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">

      {/* Header */}

      <header className="bg-black text-white py-6 px-4 sm:px-8 sticky top-0 z-50">

        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <div className="flex-1"></div>

          <div className="text-center">

            <h1 className="text-2xl sm:text-[28px] md:text-[32px] italic font-bold">Emprendipaz</h1>

            <p className="text-sm md:text-base mt-1">Fase 2 - Formación</p>

          </div>

          <div className="flex-1 flex justify-end">

            <button

              onClick={() => navigate('/student/perfil')}

              className="flex items-center gap-2 hover:opacity-80 transition-opacity"

            >

              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center border-2 border-white">

                <span className="text-white font-semibold text-sm">U</span>

              </div>

            </button>

          </div>

        </div>

      </header>



      {/* Title Section - Banner */}

      <div className="bg-neutral-900 text-white py-6 px-4 sm:px-8 sticky top-[76px] z-40 shadow-md">

        <div className="max-w-5xl mx-auto text-center min-h-[80px] flex flex-col justify-center">

          <p className="text-xs tracking-wide mb-1 opacity-80">MÓDULO: Modelo de Negocios</p>

          <h1 className="text-2xl sm:text-[32px] md:text-[36px] font-bold italic">Unidad 3: Recursos, Ingresos, Costos y Validación del Modelo</h1>

        </div>

      </div>



      {/* Breadcrumás */}

      <div className="bg-neutral-200 py-3 px-4 sm:px-8 border-b border-neutral-300 sticky top-[152px] z-40">

        <div className="max-w-7xl mx-auto flex items-center gap-2 text-neutral-600">

          <button

            onClick={() => navigate('/student/dashboard')}

            className="hover:text-neutral-900 transition-colors"

          >

            <Home className="w-4 h-4" />

          </button>

          <ChevronRight className="w-4 h-4" />

          <button

            onClick={() => navigate('/student/modulos')}

            className="hover:text-neutral-900 transition-colors"

          >

            Módulos

          </button>

          <ChevronRight className="w-4 h-4" />

          <button

            onClick={() => navigate('/student/modelo-negocios')}

            className="hover:text-neutral-900 transition-colors"

          >

            Modelo de Negocios

          </button>

          <ChevronRight className="w-4 h-4" />

          <span className="text-neutral-900">Unidad 3</span>

        </div>

      </div>



      {/* Progress Steps */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">

        <div className="flex items-center justify-between relative">

          <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-300 z-0 transform -translate-y-1/2"></div>

          <div

            className="absolute top-1/2 left-0 h-1 bg-neutral-900 z-0 transition-all duration-500 transform -translate-y-1/2"

            style={{ width: `${(completedSteps.size / 4) * 100}%` }}

          ></div>



          {steps.map((step, index) => {

            const isCompleted = completedSteps.has(step.id);

            const isActive = activeStep === step.id;

            const isDisabled = false;



            return (

              <button

                key={step.id}

                onClick={() => handleStepClick(step)}

                disabled={isDisabled}

                className={`flex flex-col items-center relative z-10 group ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'

                  }`}

              >

                <div className={`rounded-full w-10 h-10 flex items-center justify-center mb-2 border-4 border-white transition-all ${isActive

                    ? 'bg-neutral-900 text-white scale-110'

                    : isCompleted

                      ? 'bg-neutral-900 text-white'

                      : 'bg-neutral-300 text-neutral-600'

                  }`}>

                  {isCompleted && !isActive ? (

                    <CheckCircle className="w-6 h-6" />

                  ) : (

                    <span>{step.id}</span>

                  )}

                </div>

                <p className="text-[10px] text-neutral-500 mb-0.5">Paso {step.id}</p>

                <p className={`text-sm transition-colors ${isActive

                    ? 'text-neutral-900 font-bold text-[15px]'

                    : isCompleted

                      ? 'text-neutral-900'

                      : 'text-neutral-600'

                  }`}>

                  {step.nombre}

                </p>

              </button>

            );

          })}

        </div>

      </div>



      {/* Content Area */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-6">

            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">

              Paso {activeStep}: {steps.find(s => s.id === activeStep)?.nombre}

            </h2>

            <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded">

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>📌 Instrucciones:</strong> {steps.find(s => s.id === activeStep)?.descripcion}

              </p>

            </div>

          </div>



          {activeStep === 1 && (

            <div>

              <p className="text-neutral-600 mb-4 text-sm md:text-base">

                Empezaremos aprendiendo sobre recursos clave, análisis de costos, punto de equilibrio y validación del modelo.

              </p>

              <p className="text-neutral-600 mb-8 text-sm md:text-base">

                Verás el video introductorio y revisarás los fundamentos teóricos antes de continuar con el taller.

              </p>



              <div className="mb-8">

                <h3 className="text-neutral-800 mb-4 font-semibold">Video de Presentación</h3>

                <div className="bg-neutral-200 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">

                  <div className="absolute inset-0 flex items-center justify-center">

                    <button

                      onClick={() => navigate('/student/modelo-negocios/unidad3/inicio')}

                      className="bg-black/70 hover:bg-black/90 transition-colors rounded-full p-6 md:p-8 shadow-xl transform hover:scale-110"

                    >

                      <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white" />

                    </button>

                  </div>

                </div>

              </div>



              <div className="flex justify-end">

                <Button

                  onClick={() => navigate('/student/modelo-negocios/unidad3/inicio')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2"

                >

                  Ir a Presentación

                  <ChevronRight className="w-5 h-5" />

                </Button>

              </div>

            </div>

          )}



          {activeStep === 2 && (

            <div>

              <p className="text-neutral-600 mb-4 text-sm md:text-base">

                En esta sección revisarás los fundamentos sobre recursos clave, análisis de costos, punto de equilibrio y validación del modelo.

              </p>

              <div className="flex justify-center my-8">

                <Button

                  onClick={() => navigate('/student/modelo-negocios/unidad3/desarrollo')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4"

                >

                  Ir a Fundamentación

                </Button>

              </div>

            </div>

          )}



          {activeStep === 3 && (

            <div>

              <p className="text-neutral-600 mb-4 text-sm md:text-base">

                Llevarás la teoría a la práctica aplicando los conceptos de costos, ingresos y validación a tu emprendimiento.

              </p>

              <div className="flex justify-center my-8">

                <Button

                  onClick={() => navigate('/student/modelo-negocios/unidad3/taller')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4"

                >

                  Ir a Taller

                </Button>

              </div>

            </div>

          )}



          {activeStep === 4 && (

            <div>

              <p className="text-neutral-600 mb-4 text-sm md:text-base">

                Responde el cuestionario de cierre sobre recursos, ingresos, costos y validación antes de finalizar la unidad.

              </p>

              <div className="flex justify-center my-8">

                <Button

                  onClick={() => navigate('/student/modelo-negocios/unidad3/cierre')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4"

                >

                  Ir a Evaluación

                </Button>

              </div>

            </div>

          )}

        </div>

      </div>



      {/* Botón Atrás */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/modelo-negocios')}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </div>



      <Footer />

    </div>

  );

};



export default ModeloNegociosUnidad3Page;






















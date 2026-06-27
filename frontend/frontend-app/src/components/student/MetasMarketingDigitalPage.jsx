import React, { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, Target, BookOpen, Compass } from 'lucide-react';

import Footer from '../Footer';



const steps = [

  {

    id: 1,

    nombre: 'Presentación',

    ruta: '/student/metas-marketing-digital/inicio',

    descripcion: 'Video y contexto sobre el direcciónamiento estratégico'

  },

  {

    id: 2,

    nombre: 'Fundamentación',

    ruta: '/student/metas-marketing-digital/desarrollo',

    descripcion: 'Lectura guiada, tabla másión/visión y casos aplicados'

  },

  {

    id: 3,

    nombre: 'Taller',

    ruta: '/student/metas-marketing-digital/taller',

    descripcion: 'Redacta másión, visión y dos estrategias para tu negocio'

  },

  {

    id: 4,

    nombre: 'Evaluación',

    ruta: '/student/metas-marketing-digital/cierre',

    descripcion: 'Cuestionario de 5 preguntas sobre direcciónamiento estratégico'

  }

];



const MetasMarketingDigitalPage = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const [activeStep, setActiveStep] = useState(1);

  const [completedSteps] = useState(new Set([1]));



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



  const handleStepClick = (step) => {

    if (completedSteps.has(step.id) || step.id === activeStep || step.id === activeStep + 1) {

      setActiveStep(step.id);

      navigate(step.ruta);

    }

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



      {/* Banner */}

      <div className="bg-neutral-900 text-white py-6 px-4 sm:px-8 sticky top-[76px] z-40 shadow-md">

        <div className="max-w-5xl mx-auto text-center min-h-[80px] flex flex-col justify-center">

          <p className="text-xs tracking-wide mb-1 opacity-80">MÓDULO: Marketing y Comercialización</p>

          <h1 className="text-2xl sm:text-[32px] md:text-[36px] font-bold italic">Unidad 2 · Bases del direcciónamiento estratégico</h1>

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

            onClick={() => navigate('/student/presentacion-modulo')} 

            className="hover:text-neutral-900 transition-colors"

          >

            Marketing y Comercialización

          </button>

          <ChevronRight className="w-4 h-4" />

          <span className="text-neutral-900">Unidad 2</span>

        </div>

      </div>



      {/* Content */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">

          {/* Intro */}

          <div className="mb-8 space-y-4">

            <p className="text-xs uppercase tracking-widest text-neutral-500">Dirección estratégica</p>

            <h2 className="text-3xl md:text-[36px] font-bold text-neutral-900">

              Convierte el diagnóstico en una ruta con propósito

            </h2>

            <p className="text-neutral-600">

              La Unidad 2 te guía para transformar la información del DOFA en declaraciones que alinean a tu equipo y

              estrategias que conectan con tus clientes. Aprenderás a diferenciar másión, visión y estrategias,

              y verás cómo se aplican en empresas reales.

            </p>

            <div className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-4 border-green-700 p-4 rounded">

              <p className="text-neutral-700 text-sm md:text-base">

                <strong className="text-green-800">📌 Recuerda:</strong> completa cada paso y marca tus avances en orden para desbloquear la siguiente unidad.

              </p>

            </div>

          </div>



          {/* Progress Steps */}

          <div className="mb-10">

            <div className="flex items-center justify-between relative">

              <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-300 z-0 transform -translate-y-1/2"></div>

              <div 

                className="absolute top-1/2 left-0 h-1 bg-neutral-900 z-0 transition-all duration-500 transform -translate-y-1/2" 

                style={{ width: `${(activeStep / 4) * 100}%` }}

              ></div>



              {steps.map((step) => {

                const isActive = activeStep === step.id;

                const isCompleted = completedSteps.has(step.id);

                const isDisabled = !isCompleted && step.id > activeStep;



                return (

                  <button

                    key={step.id}

                    onClick={() => handleStepClick(step)}

                    disabled={isDisabled}

                    className={`flex flex-col items-center relative z-10 group ${

                      isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'

                    }`}

                  >

                    <div className={`rounded-full w-10 h-10 flex items-center justify-center mb-2 border-4 border-white transition-all ${

                      isActive

                        ? 'bg-neutral-900 text-white scale-110'

                        : isCompleted

                          ? 'bg-neutral-900 text-white'

                          : 'bg-neutral-300 text-neutral-600'

                    }`}>

                      <span>{step.id}</span>

                    </div>

                    <p className="text-[10px] text-neutral-500 mb-0.5">Paso {step.id}</p>

                    <p className={`text-sm transition-colors ${

                      isActive 

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



          {/* Dynamic content */}

          <div className="rounded-2xl border border-neutral-200 p-6 md:p-8 bg-neutral-50">

            {activeStep === 1 && (

              <div className="space-y-6">

                <div className="flex items-center gap-3">

                  <Target className="w-5 h-5 text-neutral-700" />

                  <h3 className="text-xl font-bold text-neutral-900">Paso 1 · Presentación</h3>

                </div>

                <p className="text-neutral-700">

                  Revisa el video y el resumen de apertura para entender cómo un plan estratégico alinea propósito, decisiones

                  y estrategias. Obtendrás ejemplos de másión y visión que inspiran acción.

                </p>

                <Button

                  onClick={() => navigate('/student/metas-marketing-digital/inicio')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2"

                >

                  Ir a Presentación

                  <ChevronRight className="w-5 h-5" />

                </Button>

              </div>

            )}



            {activeStep === 2 && (

              <div className="space-y-6">

                <div className="flex items-center gap-3">

                  <BookOpen className="w-5 h-5 text-neutral-700" />

                  <h3 className="text-xl font-bold text-neutral-900">Paso 2 · Fundamentación</h3>

                </div>

                <p className="text-neutral-700">

                  Profundiza en las definiciones, analiza la tabla comparativa de másión, visión y estrategias y estudia dos casos:

                  una empresa de salud y un emprendimiento gastronómico que alinearon su rumbo.

                </p>

                <Button

                  onClick={() => navigate('/student/metas-marketing-digital/desarrollo')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4"

                >

                  Ir a Fundamentación

                </Button>

              </div>

            )}



            {activeStep === 3 && (

              <div className="space-y-6">

                <div className="flex items-center gap-3">

                  <Compass className="w-5 h-5 text-neutral-700" />

                  <h3 className="text-xl font-bold text-neutral-900">Paso 3 · Taller</h3>

                </div>

                <p className="text-neutral-700">

                  Lleva el contenido a tu contexto redactando tu másión, tu visión y dos estrategias específicas.

                  Recibirás un resumen descargable para continuar con la implementación.

                </p>

                <Button

                  onClick={() => navigate('/student/metas-marketing-digital/taller')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4"

                >

                  Ir al Taller

                </Button>

              </div>

            )}



            {activeStep === 4 && (

              <div className="space-y-6">

                <div className="flex items-center gap-3">

                  <Target className="w-5 h-5 text-neutral-700" />

                  <h3 className="text-xl font-bold text-neutral-900">Paso 4 · Evaluación</h3>

                </div>

                <p className="text-neutral-700">

                  Valida tus conocimientos con cinco preguntas clave antes de continuar con las estrategias de comercialización.

                </p>

                <Button

                  onClick={() => navigate('/student/metas-marketing-digital/cierre')}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4"

                >

                  Ir a Evaluación

                </Button>

              </div>

            )}

          </div>

        </div>

      </div>



      <Footer />

    </div>

  );

};



export default MetasMarketingDigitalPage;






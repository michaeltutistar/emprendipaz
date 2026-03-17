import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const FinanzasUnidad3DesarrolloPage = () => {

  const navigate = useNavigate();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    let ticking = false;

    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          setIsScrolled(window.scrollY > 70);

          ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

useEffect(() => {

    const handleWindowScroll = () => {

      const windowHeight = window.innerHeight;

      const documentHeight = document.documentElement.scrollHeight;

      const scrollTop = window.scrollY;

      const footerEl = document.querySelector('footer');

      const footerTop = footerEl

        ? footerEl.getBoundingClientRect().top + window.scrollY

        : documentHeight - 10;

if (scrollTop + windowHeight >= footerTop) {

        setHasScrolledToBottom(true);

      }

    };

    window.addEventListener('scroll', handleWindowScroll);

    return () => window.removeEventListener('scroll', handleWindowScroll);

  }, []);

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Finanzas y Gestión Empresarial',

          paso_nombre: 'Unidad 3: Fundamentación',

          curso_nombre: 'Finanzas y Gestión Empresarial'

        })

      });

      navigate('/student/finanzas/unidad3/taller');

    } catch (error) {

      console.error("Error al registrar progreso o navegar:", error);

      navigate('/student/finanzas/unidad3/taller');

    }

  };

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* HEADER ANIMADO */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-4 sm:px-8 overflow-hidden min-h-[60px]"

          animate={{

            minHeight: isScrolled ? '60px' : '60px',

            paddingTop: '0.5rem',

            paddingBottom: '0.5rem',

          }}

          transition={{ duration: 0.3 }}

        >

          <motion.div

            className="absolute inset-0"

            style={{

              background: 'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

            }}

            animate={{

              background: [

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 30% 70%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 70% 30%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

              ],

            }}

            transition={{

              duration: 15,

              ease: 'easeInOut',

              repeat: Infinity,

            }}

          />

<div

            className="absolute inset-0 flex items-center justify-center"

            style={{ mixBlendMode: 'overlay', opacity: 0.4 }}

          >

            <img

              src="https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png"

              alt=""

              className="w-[160%] h-auto object-cover"

            />

          </div>

{/* Hojas animadas */}

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[8%] w-12 h-12"

            animate={{ x: [0, 140], y: [80, -36], opacity: [0, 0.9, 0.9, 0] }}

            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[28%] w-10 h-10"

            animate={{ x: [0, 133], y: [80, -30], opacity: [0, 0.7, 0.7, 0] }}

            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', delay: 1, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[10%] w-11 h-11"

            animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.85, 0.85, 0] }}

            transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 0.5, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[5%] w-13 h-13"

            animate={{ x: [0, 146], y: [80, -42], opacity: [0, 0.6, 0.6, 0] }}

            transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1.5, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute left-[15%] w-8 h-8"

            animate={{ x: [0, 127], y: [80, -27], opacity: [0, 0.75, 0.75, 0] }}

            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute right-[40%] w-7 h-7"

            animate={{ x: [0, 120], y: [80, -24], opacity: [0, 0.8, 0.8, 0] }}

            transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', delay: 0.8, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[12%] w-11 h-11"

            animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.65, 0.65, 0] }}

            transition={{ duration: 4.2, repeat: Infinity, ease: 'linear', delay: 0.3, times: [0, 0.1, 0.85, 1] }}

          />

<div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              <div>

                <motion.div

                  className="flex items-center justify-start"

                  initial={{ opacity: 0, x: -20 }}

                  animate={{ opacity: 1, x: 0 }}

                  transition={{ duration: 0.8, ease: 'easeOut' }}

                >

                  <img

                    src="/formacion.png" alt="Formación Logo" onClick={() => navigate(`/student/dashboard`)} className="h-10 w-auto object-contain drop-shadow-2xl cursor-pointer hover:opacity-80"

                    style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}

                  />

                </motion.div>

              </div>

              <motion.div

                className="absolute left-1/2 transform -translate-x-1/2"

                initial={{ opacity: 0, y: -10 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.3 }}

              >

                <div className="text-center">

                  <h1

                    className="text-white whitespace-nowrap"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontSize: '1.25rem',

                      fontWeight: 700,

                      letterSpacing: '-0.01em',

                      textShadow: '0 2px 10px rgba(0,0,0,0.3)',

                    }}

                  >

                    Finanzas y Gestión Empresarial

                  </h1>

                  <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                    Unidad 3 · Fundamentación

                  </p>

                </div>

              </motion.div>

<div className="flex justify-end">

                <button

                  onClick={() => navigate('/student/perfil')}

                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"

                >

                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">

                    <span className="text-white font-semibold text-sm">U</span>

                  </div>

                </button>

              </div>

            </div>

          </div>

        </motion.header>

      </div>

{/* BREADCRUMB STICKY CUANDO HAY SCROLL */}

      <motion.div

        className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

        initial={{ opacity: 0, y: -10 }}

        animate={{ opacity: 1, y: 0 }}

      >

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">

          <div className="flex items-center gap-2 text-sm">

            <button

              onClick={() => navigate('/student/dashboard')}

              className="text-gray-600 hover:text-[#006837] transition-colors flex items-center gap-1"

            >

              <Home className="w-3.5 h-3.5" />

              Inicio

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/modulos')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Modulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/finanzas')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Finanzas y Gestión Empresarial

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Gestión Empresarial

            </span>

          </div>

        </div>

      </motion.div>

{/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] pt-8 pb-16 px-8">

        {/* Blobs */}

        <div className="absolute inset-0 overflow-hidden">

          <motion.div

            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"

            style={{ background: 'radial-gradient(circle, #FFEB3B 0%, transparent 70%)' }}

            animate={{ scale: [1, 1.2, 1] }}

            transition={{ duration: 15, repeat: Infinity }}

          />

        </div>

<div className="max-w-7xl mx-auto relative z-10">

          {/* Breadcrumbs visibles solo sin scroll */}

          {!isScrolled && (

            <motion.div

              initial={{ opacity: 0, y: -10 }}

              animate={{ opacity: 1, y: 0 }}

              className="flex items-center gap-2 text-white/80 mb-6 text-sm"

            >

              <button

                onClick={() => navigate('/student/dashboard')}

                className="hover:text-white transition-colors flex items-center gap-1"

              >

                <Home className="w-4 h-4" />

                Inicio

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/modulos')}

                className="hover:text-white transition-colors"

              >

                Modulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/finanzas')}

                className="hover:text-white transition-colors"

              >

                Finanzas y Gestión Empresarial

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 3 · Fundamentación</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

            className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6"

          >

            <h1

              className="text-white flex-shrink-0"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Gestión Empresarial · Fundamentación

            </h1>

          </motion.div>

        </div>

{/* Ola inferior */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path

              d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z"

              fill="white"

            />

          </svg>

        </div>

      </section>

{/* Progress Steps - STICKY */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            {/* Progress Line */}

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#AA27B9] to-[#d946ef] z-0"

              initial={{ width: 0 }}

              animate={{ width: '50%' }}

              transition={{ duration: 1 }}

            ></motion.div>

{/* Step 1 - Completado */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                1

              </div>

              <p className="text-[10px] text-gray-500">Presentación</p>

            </div>

{/* Step 2 - Active */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: "spring", stiffness: 200 }}

                className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                2

              </motion.div>

              <p className="text-[10px] text-[#AA27B9] font-bold">Fundamentación</p>

            </div>

{/* Step 3 */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-400 mb-0.5">Paso</p>

              <div className="bg-gray-200 text-gray-500 rounded-full w-6 h-6 flex items-center justify-center mb-0.5 text-xs font-bold">

                3

              </div>

              <p className="text-[10px] text-gray-500">Taller</p>

            </div>

{/* Step 4 */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-400 mb-0.5">Paso</p>

              <div className="bg-gray-200 text-gray-500 rounded-full w-6 h-6 flex items-center justify-center mb-0.5 text-xs font-bold">

                4

              </div>

              <p className="text-[10px] text-gray-500">Evaluación</p>

            </div>

          </div>

        </div>

      </div>

{/* Main Content */}

      <div className="max-w-7xl mx-auto px-8 py-6">

        {/* Título del Paso e Instrucciones - AL LADO */}

        <div className="flex items-start gap-4 mb-6">

          <h2

            className="text-[#006837] shrink-0"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: '2.25rem',

              fontWeight: 800,

            }}

          >

            Paso 2: Fundamentación

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Debes leer todo el contenido hasta el final para activar el siguiente paso.

            </p>

          </div>

        </div>

{/* Main Content Area */}

        <div className="px-8 py-4 space-y-10 text-neutral-700">

          <section className="space-y-6">

            <h2 className="text-2xl font-bold text-neutral-900">ESTRATEGIAS DE GESTIÓN ADMINISTRATIVA</h2>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6 space-y-6">

              <div>

                <h3 className="text-xl font-bold text-neutral-900 mb-4">Fundamentos sobre gestión administrativa</h3>

<h4 className="text-lg font-semibold text-neutral-900 mb-3">¿Qué es la gestión administrativa?</h4>

                <p className="text-sm md:text-base mb-4 leading-relaxed">

                  La gestión administrativa es el conjunto de prácticas, procesos y decisiones que permiten a una organización alcanzar sus objetivos de manera eficiente, rentable y sostenible. Se trata de coordinar los recursos disponibles; humanos, financieros, tecnológicos y materiales, para lograr resultados que fortalezcan la competitividad y la permanencia en el mercado.

                </p>

<p className="text-sm md:text-base mb-4 leading-relaxed">

                  La gestión administrativa se fundamenta en cuatro estrategias esenciales:

                </p>

<div className="space-y-4 mb-6">

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-blue-900 mb-2">Planificación:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      consiste en definir metas, estrategias y acciones concretas para el futuro. Una buena planificación permite anticipar escenarios, reducir riesgos y orientar los esfuerzos hacia objetivos claros.

                    </p>

                  </div>

<div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-green-900 mb-2">Organización:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      implica estructurar los recursos y asignar responsabilidades de manera ordenada. La organización asegura que cada área y persona sepa qué hacer, cómo hacerlo y con qué recursos cuenta.

                    </p>

                  </div>

<div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-purple-900 mb-2">Dirección:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      se refiere a guiar y motivar al equipo de trabajo. Incluye liderazgo, comunicación efectiva y toma de decisiones que impulsen la productividad y el compromiso.

                    </p>

                  </div>

<div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-yellow-900 mb-2">Control:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      es el proceso de evaluar resultados, identificar desviaciones y aplicar medidas correctivas. El control garantiza que las metas se cumplan y que los recursos se utilicen de manera adecuada.

                    </p>

                  </div>

                </div>

<p className="text-sm md:text-base mb-4 leading-relaxed">

                  Además, la gestión administrativa moderna incorpora otros elementos clave:

                </p>

<div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-lg p-6">

                  <ul className="space-y-3">

                    <li className="flex items-start">

                      <span className="text-green-600 font-bold mr-3">•</span>

                      <div>

                        <span className="font-semibold text-neutral-900">Innovación:</span>

                        <span className="text-sm md:text-base text-neutral-700"> generar nuevas ideas, productos o procesos que aumenten la competitividad y diferencien a la empresa.</span>

                      </div>

                    </li>

                    <li className="flex items-start">

                      <span className="text-green-600 font-bold mr-3">•</span>

                      <div>

                        <span className="font-semibold text-neutral-900">Responsabilidad social:</span>

                        <span className="text-sm md:text-base text-neutral-700"> actuar con compromiso hacia la comunidad y los grupos de interés, promoviendo prácticas éticas.</span>

                      </div>

                    </li>

                    <li className="flex items-start">

                      <span className="text-green-600 font-bold mr-3">•</span>

                      <div>

                        <span className="font-semibold text-neutral-900">Sostenibilidad ambiental:</span>

                        <span className="text-sm md:text-base text-neutral-700"> implementar acciones que reduzcan el impacto ecológico y aseguren el cuidado del entorno.</span>

                      </div>

                    </li>

                    <li className="flex items-start">

                      <span className="text-green-600 font-bold mr-3">•</span>

                      <div>

                        <span className="font-semibold text-neutral-900">Adaptación tecnológica:</span>

                        <span className="text-sm md:text-base text-neutral-700"> integrar herramientas digitales y tecnológicas para optimizar procesos y responder a cambios del mercado.</span>

                      </div>

                    </li>

                  </ul>

                </div>

<p className="text-sm md:text-base mt-6 leading-relaxed">

                  En síntesis, la gestión administrativa es el motor que convierte las ideas en acciones, y las acciones en resultados medibles, asegurando que la organización avance de manera ordenada hacia sus objetivos estratégicos.

                </p>

              </div>

            </div>

          </section>

<section className="space-y-6">

            <h2 className="text-2xl font-bold text-neutral-900">Estudio de caso: Panadería "El Buen Sabor"</h2>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6 space-y-6">

              <p className="text-sm md:text-base leading-relaxed italic text-neutral-600">

                A continuación, vamos a estudiar un caso donde se ejemplifica cómo se aplica la gestión administrativa.

              </p>

<div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">

                <h3 className="text-lg font-bold text-blue-900 mb-3">Contexto del caso:</h3>

                <p className="text-sm md:text-base mb-4 leading-relaxed">

                  La panadería "El Buen Sabor" es un negocio familiar que ha crecido rápidamente gracias a la calidad de sus productos y la fidelidad de sus clientes. Sin embargo, el crecimiento trajo consigo varios problemas:

                </p>

                <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-4">

                  <li>Exceso de inventario en algunos insumos.</li>

                  <li>Retrasos en entregas.</li>

                  <li>Poca claridad en los roles del personal.</li>

                </ul>

              </div>

<div>

                <p className="text-sm md:text-base mb-4 leading-relaxed">

                  Para enfrentar estos retos, la dueña decidió aplicar principios de gestión administrativa obteniendo los siguientes resultados:

                </p>

<div className="space-y-4">

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-blue-900 mb-2">Planificación:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      estableció metas de producción semanales y diseñó un cronograma de compras de insumos ajustado a la demanda.

                    </p>

                  </div>

<div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-green-900 mb-2">Organización:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      implementó un sistema de registro de inventarios y definió claramente las funciones de cada empleado (producción, ventas, logística).

                    </p>

                  </div>

<div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-purple-900 mb-2">Dirección:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      motivó al equipo con reuniones breves cada mañana, donde se revisaban objetivos y se reconocía el esfuerzo del día anterior.

                    </p>

                  </div>

<div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-600 p-4 rounded">

                    <p className="text-sm md:text-base font-semibold text-yellow-900 mb-2">Control:</p>

                    <p className="text-sm md:text-base text-neutral-700">

                      instauró un control de calidad en cada lote de producción y un seguimiento semanal de ventas versus metas.

                    </p>

                  </div>

                </div>

              </div>

<div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 p-6 rounded">

                <h4 className="text-lg font-semibold text-green-900 mb-3">Resultados obtenidos:</h4>

                <p className="text-sm md:text-base mb-4 leading-relaxed">

                  Gracias a estas acciones, la panadería logró reducir desperdicios, mejorar los tiempos de entrega y aumentar la satisfacción de los clientes. Además, el equipo de trabajo se sintió más comprometido y organizado, lo que permitió abrir un nuevo punto de venta en la ciudad.

                </p>

                <p className="text-sm md:text-base leading-relaxed font-semibold text-green-900">

                  Este caso demuestra cómo la gestión administrativa, aplicada incluso en pequeños negocios, puede transformar la operación diaria y generar crecimiento sostenible.

                </p>

              </div>

            </div>

          </section>

        </div>

{/* Bottom Navigation */}

        <div className="flex justify-end mt-8">

          <div className="relative group">

            <Button

              onClick={handleCompleteStep}

              disabled={!hasScrolledToBottom}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

{/* Tooltip para botón deshabilitado */}

            {!hasScrolledToBottom && (

              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">

                Debes leer todo el contenido hasta el final para activar el siguiente paso

                <div className="absolute top-full right-4 transform -mt-1">

                  <div className="border-4 border-transparent border-t-neutral-900"></div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/finanzas/unidad3')}

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

export default FinanzasUnidad3DesarrolloPage;


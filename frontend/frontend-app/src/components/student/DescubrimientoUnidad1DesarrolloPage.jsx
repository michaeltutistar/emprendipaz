import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const DescubrimientoUnidad1DesarrolloPage = () => {

  const navigate = useNavigate();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

const contentRef = useRef(null);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

  useEffect(() => {

    const cargarFotoPerfil = async () => {

      try {

        const token = getAuthToken();

        if (!token) return;

const response = await fetch(`${API_BASE_URL}/student/perfil`, {

          credentials: 'include',

          headers: {

            ...(token ? { 'Authorization': `Bearer ${token}` } : {})

          }

        });

if (response.ok) {

          const data = await response.json();

          if (data.success) {

            setFotoPerfilUrl(data.data.foto_perfil_url || '');

            setUserName(data.data.nombre || '');

          }

        }

      } catch (error) {

        console.error('Error al cargar foto de perfil:', error);

      }

    };

cargarFotoPerfil();

  }, []);

useEffect(() => {

    const handleWindowScroll = () => {

      setIsScrolled(window.scrollY > 100);

const windowHeight = window.innerHeight;

      const documentHeight = document.documentElement.scrollHeight;

      const scrollTop = window.scrollY;

      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;

      setScrollProgress(progress);

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

const { pasoCompletado, registrarProgreso } = useProgressTracking('Descubrimiento de Oportunidades', 'Unidad 1: Fundamentación');

const handleCompleteStep = async () => {

    if (!hasScrolledToBottom) return;

    // Registrar progreso en el backend

    await registrarProgreso();

    navigate('/student/descubrimiento-oportunidades/unidad1/taller');

  };

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* Header con scroll dinámico */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-8 overflow-hidden min-h-[60px]"

          animate={{

            minHeight: isScrolled ? '60px' : '60px',

            paddingTop: isScrolled ? '0.5rem' : '0.5rem',

            paddingBottom: isScrolled ? '0.5rem' : '0.5rem',

          }}

          transition={{ duration: 0.3 }}

        >

          {/* CAPA FONDO 1: Degradado animado */}

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

              ease: "easeInOut",

              repeat: Infinity,

            }}

          />

{/* CAPA FONDO 2: Patrón de hojas verdes */}

          <div 

            className="absolute inset-0 flex items-center justify-center"

            style={{

              mixBlendMode: 'overlay',

              opacity: 0.4,

            }}

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

            animate={{

              x: [0, 140],

              y: [80, -36],

              opacity: [0, 0.9, 0.9, 0],

            }}

            transition={{

              duration: 3.5,

              repeat: Infinity,

              ease: "linear",

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img 

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[28%] w-10 h-10"

            animate={{

              x: [0, 133],

              y: [80, -30],

              opacity: [0, 0.7, 0.7, 0],

            }}

            transition={{

              duration: 4.5,

              repeat: Infinity,

              ease: "linear",

              delay: 1,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img 

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[10%] w-11 h-11"

            animate={{

              x: [0, 137],

              y: [80, -33],

              opacity: [0, 0.85, 0.85, 0],

            }}

            transition={{

              duration: 4,

              repeat: Infinity,

              ease: "linear",

              delay: 0.5,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img 

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[5%] w-13 h-13"

            animate={{

              x: [0, 146],

              y: [80, -42],

              opacity: [0, 0.6, 0.6, 0],

            }}

            transition={{

              duration: 5,

              repeat: Infinity,

              ease: "linear",

              delay: 1.5,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img 

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute left-[15%] w-8 h-8"

            animate={{

              x: [0, 127],

              y: [80, -27],

              opacity: [0, 0.75, 0.75, 0],

            }}

            transition={{

              duration: 3,

              repeat: Infinity,

              ease: "linear",

              delay: 2,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img 

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute right-[40%] w-7 h-7"

            animate={{

              x: [0, 120],

              y: [80, -24],

              opacity: [0, 0.8, 0.8, 0],

            }}

            transition={{

              duration: 3.8,

              repeat: Infinity,

              ease: "linear",

              delay: 0.8,

              times: [0, 0.1, 0.85, 1],

            }}

          />

{/* CAPA FRONTAL: Contenido */}

          <div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              {/* Logo */}

              <div>

                <motion.div 

                  className="flex items-center justify-start"

                  initial={{ opacity: 0, x: -20 }}

                  animate={{ opacity: 1, x: 0 }}

                  transition={{ duration: 0.8, ease: "easeOut" }}

                >

                  <img 

                    src="/formacion.png" alt="Formación Logo" onClick={() => navigate(`/student/dashboard`)} className="h-10 w-auto object-contain drop-shadow-2xl cursor-pointer hover:opacity-80"

                    style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}

                  />

                </motion.div>

              </div>

{/* Título del Modulo - Centro (solo visible cuando hay scroll) */}

                    {isScrolled && (

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

                      Descubrimiento de Oportunidades

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 1

                    </p>

                  </div>

                </motion.div>

              )}

{/* Menú de usuario - Derecha */}

              <div className="flex justify-end">

                <div className="relative z-[10000]">

                  <button

                    onClick={() => setUserMenuOpen(!userMenuOpen)}

                    className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-[10000]"

                  >

                    {fotoPerfilUrl ? (

                      <img

                        src={fotoPerfilUrl}

                        alt="Foto de perfil"

                        className="w-10 h-10 rounded-full object-cover border-2 border-white/40"

                        onError={(e) => {

                          e.currentTarget.style.display = 'none';

                        }}

                      />

                    ) : (

                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">

                        <span className="text-white font-semibold text-sm">

                          {userName.charAt(0).toUpperCase() || 'U'}

                        </span>

                      </div>

                    )}

                    <ChevronDown className="w-4 h-4 text-white" />

                  </button>

{userMenuOpen && (

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[10001] border">

                      <div className="px-4 py-2 text-sm text-gray-500 border-b">

                        {userName || 'Usuario'}

                      </div>

                      <button

                        onClick={async () => {

                          try {

                            const response = await fetch(`${API_BASE_URL}/logout`, {

                              method: 'POST',

                              credentials: 'include'

                            });

                            if (response.ok) {

                              navigate('/login');

                            } else {

                              console.error('Error al cerrar sesión');

                            }

                          } catch (error) {

                            console.error('Error al cerrar sesión:', error);

                          }

                          setUserMenuOpen(false);

                        }}

                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"

                      >

                        <LogOut className="h-4 w-4 mr-2" />

                        Cerrar Sesión

                      </button>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </motion.header>

      </div>

{/* Breadcrumb sticky siempre visible */}

      <motion.div

          className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

          initial={{ opacity: 0, y: -10 }}

          animate={{ opacity: 1, y: 0 }}

        >

          <div className="max-w-7xl mx-auto px-8 py-3">

            <div className="flex items-center gap-2 text-sm">

              <button onClick={() => navigate('/student/dashboard')} className="text-gray-600 hover:text-[#006837] transition-colors flex items-center gap-1">

                <Home className="w-3.5 h-3.5" />

                Inicio

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/modulos')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Modulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/descubrimiento-oportunidades')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Descubrimiento de Oportunidades

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Diagnóstico Estratégico

              </span>

            </div>

          </div>

        </motion.div>

{/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] py-8 px-8">

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

          {/* Title */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Descubrimiento de Oportunidades

            </p>

            <h1 

              className="text-white mb-4"

              style={{ 

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Diagnóstico Estratégico

            </h1>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z" fill="white"/>

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

              animate={{ width: '33.33%' }}

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

        <div>

          <div ref={contentRef} className="px-8 py-4">

            {/* Lectura Section */}

            <section id="lectura" className="mb-16">

                <div className="mb-8">

                  <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Lectura</div>

                  <h2 

                    className="text-[#006837] mb-6 leading-tight"

                    style={{ 

                      fontFamily: 'var(--font-heading)',

                      fontSize: '2rem',

                      fontWeight: 700,

                    }}

                  >

                    Diagnóstico estratégico y análisis PESTEL

                  </h2>

                  <div className="w-16 h-1 bg-[#006837]"></div>

                </div>

<div className="prose prose-lg max-w-none space-y-6">

                  <p className="text-gray-700 leading-relaxed text-base">

                    El diagnóstico estratégico se constituye como una herramienta de gestión eficaz para impulsar crecimiento, propiciar su adaptación a los cambios del entorno y fortalecer sus ventajas competitivas. Su implementación permite definir las acciones a realizar para alcanzar su futuro deseado.

                  </p>

                  <p className="text-gray-700 leading-relaxed text-base">

                    Se presenta inicialmente el concepto de servicio, sus características y los elementos que conforman la mezcla de marketing de servicios. En su segunda parte introduce el concepto de diagnóstico estratégico y los elementos que lo conforman, análisis interno, análisis externo y la matriz DAFO.

                  </p>

{/* Diagrama: Elementos del Diagnóstico Estratégico */}

                  <div className="my-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8 border-2 border-blue-300 shadow-lg">

                    <h4 className="text-xl font-bold text-gray-900 mb-8 text-center">Elementos del Diagnóstico Estratégico</h4>

<div className="relative">

                      {/* Nodo Central */}

                      <div className="flex justify-center mb-10">

                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-8 py-5 shadow-xl border-2 border-blue-700">

                          <p className="text-white font-bold text-center text-lg">Elementos del Diagnóstico Estratégico</p>

                        </div>

                      </div>

{/* Líneas de conexión principales - horizontal desde el nodo central */}

                      <div className="relative mb-8">

                        <div className="absolute left-1/2 top-0 w-full h-0.5 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 transform -translate-x-1/2 -translate-y-1/2"></div>

{/* Tres ramás principales */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mt-8">

                          {/* Análisis Externo */}

                          <div className="flex flex-col items-center">

                            <div className="w-0.5 h-8 bg-green-400 mb-2"></div>

                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl px-5 py-4 shadow-lg w-full text-center mb-6 border-2 border-green-700">

                              <p className="font-bold text-base">Análisis Externo</p>

                            </div>

                            <div className="space-y-3 w-full">

                              <div className="bg-white border-2 border-green-400 rounded-lg px-4 py-3 shadow-md hover:shadow-lg transition-shadow">

                                <p className="text-gray-800 text-sm text-center font-medium">Tendencias del macroentorno</p>

                              </div>

                              <div className="bg-white border-2 border-green-400 rounded-lg px-4 py-3 shadow-md hover:shadow-lg transition-shadow">

                                <p className="text-gray-800 text-sm text-center font-medium">Tendencias del microentorno</p>

                              </div>

                            </div>

                          </div>

{/* Análisis Interno */}

                          <div className="flex flex-col items-center">

                            <div className="w-0.5 h-8 bg-purple-400 mb-2"></div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl px-5 py-4 shadow-lg w-full text-center mb-6 border-2 border-purple-700">

                              <p className="font-bold text-base">Análisis Interno</p>

                            </div>

                          </div>

{/* Matriz DAFO */}

                          <div className="flex flex-col items-center">

                            <div className="w-0.5 h-8 bg-orange-400 mb-2"></div>

                            <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl px-5 py-4 shadow-lg w-full text-center mb-6 border-2 border-orange-700">

                              <p className="font-bold text-base">Matriz DAFO</p>

                            </div>

                            <div className="space-y-2 w-full">

                              <div className="bg-white border-2 border-orange-400 rounded-lg px-3 py-2.5 shadow-md hover:shadow-lg transition-shadow">

                                <p className="text-gray-800 text-xs text-center font-medium">Estrategia Ofensiva</p>

                              </div>

                              <div className="bg-white border-2 border-orange-400 rounded-lg px-3 py-2.5 shadow-md hover:shadow-lg transition-shadow">

                                <p className="text-gray-800 text-xs text-center font-medium">Estrategia Defensiva</p>

                              </div>

                              <div className="bg-white border-2 border-orange-400 rounded-lg px-3 py-2.5 shadow-md hover:shadow-lg transition-shadow">

                                <p className="text-gray-800 text-xs text-center font-medium">Estrategia de Reorientación</p>

                              </div>

                              <div className="bg-white border-2 border-orange-400 rounded-lg px-3 py-2.5 shadow-md hover:shadow-lg transition-shadow">

                                <p className="text-gray-800 text-xs text-center font-medium">Estrategia de Supervivencia o Liquidación</p>

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

<div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded mb-4">

                    <p className="text-gray-800 font-semibold mb-2">Palabras Clave:</p>

                    <p className="text-gray-700 text-base">

                      Servicios, Diagnóstico Estratégico, Macroentorno, Microentorno, Matriz DAFO, Estrategias.

                    </p>

                  </div>

                  <p className="text-gray-700 leading-relaxed text-base mb-6">

                    Dicho lo anterior podríamás decir que el diagnóstico estratégico organizacional es una herramienta administrativa que permite direcciónar a las organizaciones según los planes que se tracen, luego de un previo diagnóstico de la situación actual de la organización.

                  </p>

<h3 

                    className="text-[#006837] mt-8 mb-4"

                    style={{ 

                      fontFamily: 'var(--font-heading)',

                      fontSize: '1.5rem',

                      fontWeight: 600,

                    }}

                  >

                    Análisis PESTEL

                  </h3>

                  <p className="text-gray-700 leading-relaxed text-base mb-4">

                    El PESTEL es una herramienta que se utiliza para analizar los aspectos del macroentorno, el cual analiza factores políticos, económicos, sociales, tecnológicos, ecológicos y legales con el fin de identificar motores de cambio de la industria, aquellas variables interrelacionadas que pueden llegar a afectar una industria en el futuro.

                  </p>

<h4 className="text-lg font-semibold text-gray-800 mb-3 mt-6">Pasos a tener en cuenta para elaborar un PESTEL</h4>

<div className="space-y-4 mb-6">

                    <div className="bg-gray-50 p-4 rounded-lg">

                      <p className="font-semibold text-gray-900 mb-2">1. Define el objetivo</p>

                      <p className="text-gray-700 text-base">

                        Antes de empezar, ten claro qué quieres analizar: un nuevo producto, un mercado diferente o la viabilidad general de la empresa.

                      </p>

                    </div>

<div className="bg-gray-50 p-4 rounded-lg">

                      <p className="font-semibold text-gray-900 mb-2">2. Recopila información</p>

                      <p className="text-gray-700 text-base mb-2">Investiga fuentes confiables y actualizadas para cada factor:</p>

                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                        <li><strong>Políticos:</strong> Estabilidad política, políticas gubernamentales, acuerdos comerciales.</li>

                        <li><strong>Económicos:</strong> Inflación, tipos de interés, PIB, desempleo, ciclos económicos.</li>

                        <li><strong>Sociales:</strong> Tendencias demográficas, culturales, de consumo y estilo de vida.</li>

                        <li><strong>Tecnológicos:</strong> Innovaciones, automatización, inversión en I+D y adopción de nuevas tecnologías.</li>

                        <li><strong>Ecológicos:</strong> Conciencia ambiental, regulaciones, cambio climático, sostenibilidad.</li>

                        <li><strong>Legales:</strong> Leyes laborales, de protección de datos, de propiedad intelectual, normativas de seguridad.</li>

                      </ul>

                    </div>

{/* Diagrama PESTEL - Imagen */}

                    <div className="mt-8 flex justify-center">

                      <div className="w-full max-w-5xl">

                        <img 

                          src="/pestel.png" 

                          alt="Diagrama PESTEL - Análisis de factores Políticos, Económicos, Sociales, Tecnológicos, Ecológicos y Legales" 

                          className="w-full h-auto rounded-xl shadow-lg"

                        />

                      </div>

                    </div>

<div className="bg-gray-50 p-4 rounded-lg">

                      <p className="font-semibold text-gray-900 mb-2">3. Evalúa el impacto</p>

                      <p className="text-gray-700 text-base">

                        Crea una matriz o tabla para organizar la información de cada factor. Analiza cada punto para determinar si representa una oportunidad o una amenaza para tu negocio.

                      </p>

                    </div>

<div className="bg-gray-50 p-4 rounded-lg">

                      <p className="font-semibold text-gray-900 mb-2">4. Prioriza y extrae conclusiones</p>

                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                        <li>Evalúa la probabilidad y la magnitud del impacto de cada factor para priorizar los más importantes.</li>

                        <li>Determina cómo cada factor relevante afecta a la empresa de forma positiva o negativa.</li>

                      </ul>

                    </div>

<div className="bg-gray-50 p-4 rounded-lg">

                      <p className="font-semibold text-gray-900 mb-2">5. Desarrolla estrategias</p>

                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                        <li>Usa las conclusiones del análisis para diseñar planes de acción.</li>

                        <li>Desarrolla estrategias para aprovechar las oportunidades identificadas e intentar mitigar o evitar las amenazas.</li>

                      </ul>

                    </div>

<div className="bg-gray-50 p-4 rounded-lg">

                      <p className="font-semibold text-gray-900 mb-2">6. Revisa y actualiza</p>

                      <p className="text-gray-700 text-base">

                        El análisis PESTEL no es un documento estático; revísalo y actualízalo periódicamente para adaptarte a los cambios del entorno.

                      </p>

                    </div>

                  </div>

                </div>

              </section>

{/* Caso de Estudio Section */}

            <section id="caso" className="mb-16">

                <div className="mb-8">

                  <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Caso de estudio</div>

                  <h2 

                    className="text-gray-900 mb-6 leading-tight"

                    style={{ 

                      fontFamily: 'var(--font-heading)',

                      fontSize: '2rem',

                      fontWeight: 700,

                    }}

                  >

                    Estudio de caso: POWER PEDALS

                  </h2>

                  <div className="w-16 h-1 bg-gray-900"></div>

                </div>

<div className="prose prose-neutral max-w-none space-y-6">

                  <div className="mb-4">

                    <p className="text-gray-700 leading-relaxed text-base mb-4">

                      Vamos a estudiar un caso empresarial donde podremos evidenciar cómo se desarrolla un análisis mediante la matriz PESTEL.

                    </p>

                    <p className="text-gray-700 leading-relaxed text-base mb-4">

                      Carlos, un joven emprendedor de Ipiales, inició un negocio de bicicletas eléctricas. Para comprender mejor el entorno, aplicó la matriz PESTEL y obtuvo los siguientes resultados:

                    </p>

                  </div>

<div className="mb-4">

                    <h3 

                      className="text-gray-900 mb-3"

                      style={{ 

                        fontFamily: 'var(--font-heading)',

                        fontSize: '1.5rem',

                        fontWeight: 600,

                      }}

                    >

                      Análisis PESTEL

                    </h3>

                    <div className="space-y-3">

                      <div className="bg-gray-50 p-4 rounded-lg">

                        <p className="text-gray-700 leading-relaxed text-base mb-2">

                          <strong>Político:</strong> El municipio de Ipiales lanzó programás de movilidad sostenible y subsidios para transporte alternativo.

                        </p>

                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">

                        <p className="text-gray-700 leading-relaxed text-base mb-2">

                          <strong>Económico:</strong> El aumento constante del precio de la gasolina generó interés en medios de transporte más económicos.

                        </p>

                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">

                        <p className="text-gray-700 leading-relaxed text-base mb-2">

                          <strong>Social:</strong> La población joven muestra creciente interés por el deporte, la vida saludable y la movilidad ecológica.

                        </p>

                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">

                        <p className="text-gray-700 leading-relaxed text-base mb-2">

                          <strong>Tecnológico:</strong> Avances en baterías de litio permiten mayor autonomía y menor tiempo de carga.

                        </p>

                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">

                        <p className="text-gray-700 leading-relaxed text-base mb-2">

                          <strong>Ecológico:</strong> La conciencia ambiental impulsa la preferencia por medios de transporte limpios.

                        </p>

                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">

                        <p className="text-gray-700 leading-relaxed text-base mb-2">

                          <strong>Legal:</strong> Normás de tránsito regulan el uso de bicicletas eléctricas, pero permiten su circulación en vías principales.

                        </p>

                      </div>

                    </div>

                  </div>

<div className="mb-4 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">

                    <h3 

                      className="text-gray-900 mb-3"

                      style={{ 

                        fontFamily: 'var(--font-heading)',

                        fontSize: '1.5rem',

                        fontWeight: 600,

                      }}

                    >

                      Conclusión del análisis

                    </h3>

                    <p className="text-gray-700 leading-relaxed text-base mb-4">

                      Carlos identificó que su negocio tenía una gran oportunidad de posicionarse como alternativa sostenible y económica frente al transporte tradicional. Reconoció que las amenazas (competencia y regulaciones) podían convertirse en ventajas si actuaba con estrategia.

                    </p>

                  </div>

<div className="mb-4">

                    <h3 

                      className="text-gray-900 mb-3"

                      style={{ 

                        fontFamily: 'var(--font-heading)',

                        fontSize: '1.5rem',

                        fontWeight: 600,

                      }}

                    >

                      Estrategias que decidió implementar

                    </h3>

                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-base ml-4 mb-4">

                      <li><strong>Alianza con el programa municipal de movilidad sostenible:</strong> para acceder a subsidios y campañas de promoción conjunta.</li>

                      <li><strong>Campañas de marketing digital:</strong> enfocadas en jóvenes y profesionales que buscan transporte económico y saludable.</li>

                      <li><strong>Innovación tecnológica:</strong> importar baterías de litio de mayor duración para diferenciarse de competidores locales.</li>

                      <li><strong>Promociones de lanzamiento:</strong> descuentos en la primera compra y facilidades de pago para captar clientes sensibles al precio.</li>

                      <li><strong>Enfoque ecológico en la marca:</strong> empaques reciclables, mensajes verdes y participación en ferias ambientales para reforzar identidad sostenible.</li>

                    </ul>

                  </div>

<div className="mb-4 bg-green-50 border-l-4 border-green-600 p-4 rounded">

                    <h3 

                      className="text-gray-900 mb-3"

                      style={{ 

                        fontFamily: 'var(--font-heading)',

                        fontSize: '1.5rem',

                        fontWeight: 600,

                      }}

                    >

                      Resultado esperado

                    </h3>

                    <p className="text-gray-700 leading-relaxed text-base mb-4">

                      Con estas acciones, Carlos proyectó aumentar su participación en el mercado local en un 20% durante el primer año, consolidando su negocio como referente de movilidad limpia en la región.

                    </p>

                  </div>

{/* Spacer para mejor scroll */}

            <div className="h-20"></div>

          </div>

        </section>

      </div>

    </div>

{/* Bottom Navigation */}

        <div className="flex justify-end mt-8">

          <div className="relative group">

            <Button

              onClick={handleCompleteStep}

              disabled={!hasScrolledToBottom}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${

                !hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

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

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/descubrimiento-oportunidades/unidad1/inicio');

          }}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          Atrás

        </Button>

      </div>

<Footer />

    </div>

  );

};

export default DescubrimientoUnidad1DesarrolloPage;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const dofaElements = [

  {

    nombre: 'Debilidades (D)',

    tipo: 'Interno',

    definicion: 'Factores negativos propios de la organización que limitan su desempeño.',

    preguntas: ['¿En qué aspectos fallamos?', '¿Qué debemos mejorar?']

  },

  {

    nombre: 'Oportunidades (O)',

    tipo: 'Externo',

    definicion: 'Condiciones del entorno que podrían beneficiar a la organización si se aprovechan.',

    preguntas: ['¿Qué tendencias del mercado podemos explotar?']

  },

  {

    nombre: 'Fortalezas (F)',

    tipo: 'Interno',

    definicion: 'Capacidades, recursos o ventajas competitivas que destacan frente a la competencia.',

    preguntas: ['¿Qué hacemos mejor que los demás?']

  },

  {

    nombre: 'Amenazas (A)',

    tipo: 'Externo',

    definicion: 'Factores externos que pueden perjudicar el desempeño o la estabilidad del negocio.',

    preguntas: ['¿Qué cambios externos podrían afectarnos negativamente?']

  }

];

const estrategiasDofa = [

  { 

    tipo: 'FO', 

    combina: 'Fortalezas + Oportunidades',

    objetivo: 'Crecimiento y expansión',

    ejemplo: 'Café premium para turistas'

  },

  { 

    tipo: 'DO', 

    combina: 'Debilidades + Oportunidades',

    objetivo: 'Superar debilidades',

    ejemplo: 'Integrarse a apps de delivery'

  },

  { 

    tipo: 'DA', 

    combina: 'Debilidades + Amenazas',

    objetivo: 'Minimizar riesgos',

    ejemplo: 'Asociarse con productores locales'

  },

  { 

    tipo: 'FA', 

    combina: 'Fortalezas + Amenazas',

    objetivo: 'Defenderse de amenazas',

    ejemplo: 'Fidelización de clientes'

  }

];

const Unidad1DesarrolloPage = () => {

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

// Habilitar "Siguiente Paso" cuando el viewport alcanza la parte superior del footer

  useEffect(() => {

    const handleWindowScroll = () => {

      const windowHeight = window.innerHeight;

      const documentHeight = document.documentElement.scrollHeight;

      const scrollTop = window.scrollY;

const footerEl = document.querySelector('footer');

      const footerTop = footerEl ? footerEl.getBoundingClientRect().top + window.scrollY : documentHeight - 10;

if (scrollTop + windowHeight >= footerTop) {

        setHasScrolledToBottom(true);

      }

    };

window.addEventListener('scroll', handleWindowScroll, { passive: true });

    handleWindowScroll();

    return () => window.removeEventListener('scroll', handleWindowScroll);

  }, []);

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing y Comercialización',

          paso_nombre: 'Unidad 1: Fundamentación',

          curso_nombre: 'Marketing y Comercialización'

        })

      });

      navigate('/student/unidad1/taller');

    } catch (error) {

      navigate('/student/unidad1/taller');

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

{/* CAPA INTERMEDIA: Elementos flotantes ascendiendo en diagonal -48 grados */}

          {/* Hoja Morada 1 - Diagonal -48° */}

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

          {/* Hoja Morada 2 - Diagonal -48° */}

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

          {/* Hoja Azul 1 - Diagonal -48° */}

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

          {/* Hoja Azul 2 - Diagonal -48° */}

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

          {/* Hoja Amarilla 1 - Diagonal -48° */}

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

          {/* Hoja Amarilla 2 - Diagonal -48° */}

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

          {/* Hoja Morada 3 - Diagonal -48° */}

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[12%] w-11 h-11"

            animate={{

              x: [0, 137],

              y: [80, -33],

              opacity: [0, 0.65, 0.65, 0],

            }}

            transition={{

              duration: 4.2,

              repeat: Infinity,

              ease: "linear",

              delay: 0.3,

              times: [0, 0.1, 0.85, 1],

            }}

          />

{/* CAPA FRONTAL: Contenido estático y UI nítido */}

          <div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              {/* Logo */}

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

{/* Título centrado al hacer scroll */}

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

                      Marketing y Comercialización

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 1 · Fundamentación

                    </p>

                  </div>

                </motion.div>

              )}

{/* Usuario */}

              <div className="flex justify-end">

                <div className="relative z-[10000]">

                  <button

                    onClick={() => setUserMenuOpen(!userMenuOpen)}

                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"

                  >

                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 overflow-hidden">

                      {fotoPerfilUrl ? (

                        <img

                          src={fotoPerfilUrl}

                          alt="Foto de perfil"

                          className="w-full h-full object-cover"

                          onError={(e) => {

                            e.currentTarget.style.display = 'none';

                            const fallback = e.currentTarget.nextElementSibling;

                            if (fallback) fallback.style.display = 'flex';

                          }}

                        />

                      ) : null}

                      <span 

                        className="text-white font-semibold text-sm"

                        style={{ display: fotoPerfilUrl ? 'none' : 'flex' }}

                      >

                        {userName.charAt(0).toUpperCase() || 'U'}

                      </span>

                    </div>

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

                onClick={() => navigate('/student/presentacion-modulo')}

                className="text-gray-600 hover:text-[#006837] transition-colors"

              >

                Marketing y Comercialización

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#006837] font-semibold">

                Unidad 1 · Fundamentación

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

          {/* Breadcrumás visibles solo sin scroll */}

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

                onClick={() => navigate('/student/presentacion-modulo')}

                className="hover:text-white transition-colors"

              >

                Marketing y Comercialización

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 1 · Fundamentación</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-2">

              MÓDULO: Marketing y Comercialización

            </p>

            <h1

              className="text-white mb-3"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Caracterización Interna y Externa del Negocio

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Aprende sobre la matriz DOFA y cómo utilizarla para analizar tu negocio y tomar decisiones estratégicas.

            </p>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path

              d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z"

              fill="white"

            />

          </svg>

        </div>

      </section>

{/* PASOS - STICKY */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-4 sm:px-8">

          <div className="flex items-center justify-between relative">

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-300 z-0"

              initial={{ width: 0 }}

              animate={{ width: '33.33%' }}

              transition={{ duration: 1 }}

            />

{/* Paso 1 - completado */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-400 text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                1

              </div>

              <p className="text-[10px] text-gray-500">Presentación</p>

            </div>

{/* Paso 2 - activo */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: 'spring', stiffness: 200 }}

                className="bg-gradient-to-br from-emerald-500 to-emerald-400 text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                2

              </motion.div>

              <p className="text-[10px] text-emerald-700 font-bold">Fundamentación</p>

            </div>

{/* Paso 3 */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-400 mb-0.5">Paso</p>

              <div className="bg-gray-200 text-gray-500 rounded-full w-6 h-6 flex items-center justify-center mb-0.5 text-xs font-bold">

                3

              </div>

              <p className="text-[10px] text-gray-500">Taller</p>

            </div>

{/* Paso 4 */}

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

{/* Content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">

        {/* Título del Paso e Instrucciones (como Modulo 1) */}

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

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Debes leer todo el contenido hasta el final para activar el siguiente paso.

            </p>

          </div>

        </div>

<div className="space-y-12">

          {/* Título Principal */}

          <section>

            <h2 

              className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4"

              style={{ fontFamily: 'var(--font-heading)' }}

            >

              UNIDAD 1. CARACTERIZACIÓN INTERNA Y EXTERNA DEL NEGOCIO

            </h2>

          </section>

{/* Fundamentos sobre la caracterización interna y externa del negocio */}

          <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Fundamentos sobre la caracterización interna y externa del negocio</h3>

            <div className="mb-4">

              <h4 className="text-lg font-semibold text-neutral-800 mb-2">La matriz DOFA</h4>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed mb-3">

                La matriz DOFA (Debilidades, Oportunidades, Fortalezas y Amenazas) es una herramienta de diagnóstico estratégico que permite analizar tanto los factores internos del negocio (fortalezas y debilidades) como los externos (oportunidades y amenazas).

              </p>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed mb-3">

                La DOFA nos ayuda a caracterizar el negocio y a definir estrategias que aprovechen las fortalezas y oportunidades, mientras se gestionan las debilidades y amenazas.

              </p>

              <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm md:text-base ml-4">

                <li><strong>Fortalezas:</strong> capacidades internas que diferencian al negocio (ejemplo: calidad del producto, buena atención).</li>

                <li><strong>Debilidades:</strong> aspectos internos que limitan el crecimiento (ejemplo: falta de capital, poca experiencia).</li>

                <li><strong>Oportunidades:</strong> condiciones externas que pueden favorecer el negocio (ejemplo: tendencias de consumo, apoyo institucional).</li>

                <li><strong>Amenazas:</strong> factores externos que pueden afectar negativamente (ejemplo: competencia fuerte, cambios en regulaciones).</li>

              </ul>

            </div>

          </section>

{/* Tabla de Elementos DOFA */}

          <section className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Elementos de la matriz DOFA</h3>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse bg-white border-2 border-neutral-300 rounded-lg">

                <thead>

                  <tr className="bg-green-600 text-white">

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Elemento</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Tipo</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Definición</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Preguntas Clave</th>

                  </tr>

                </thead>

                <tbody>

                  {dofaElements.map((el, idx) => (

                    <tr key={el.nombre} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>

                      <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">{el.nombre}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-neutral-700">{el.tipo}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-neutral-700">{el.definicion}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-neutral-700">

                        {el.preguntas.map((q, qIdx) => (

                          <p key={qIdx} className={qIdx > 0 ? 'mt-1' : ''}>{q}</p>

                        ))}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

{/* Diferencia Interno vs Externo */}

          <section className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Es importante que entendamos la diferencia entre interno y externo:</h3>

            <div className="space-y-3 text-neutral-700 text-sm md:text-base leading-relaxed">

              <p>

                <strong>Interno:</strong> Se refiere a lo que controla la organización (recursos humanos, procesos, tecnología, cultura). → Fortalezas y Debilidades.

              </p>

              <p>

                <strong>Externo:</strong> Se refiere a lo que no controla directamente (mercado, competencia, regulaciones, tendencias económicas o sociales). → Oportunidades y Amenazas.

              </p>

            </div>

          </section>

{/* Generación de estrategias */}

          <section className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Generación de estrategias a partir de la matriz DOFA</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              La combinación de los factores que componen a la matriz DOFA (Fortalezas, Debilidades, Oportunidades, Amenazas) entre sí, nos permite generar unas estrategias en base al análisis interno y externo de nuestro emprendimiento de la siguiente manera:

            </p>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse bg-white border-2 border-neutral-300 rounded-lg">

                <thead>

                  <tr className="bg-orange-600 text-white">

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Estrategia</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Combina</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Objetivo principal</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Ejemplo aplicado</th>

                  </tr>

                </thead>

                <tbody>

                  {estrategiasDofa.map((estrategia, idx) => (

                    <tr key={estrategia.tipo} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>

                      <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">{estrategia.tipo}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-neutral-700">{estrategia.combina}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-neutral-700">{estrategia.objetivo}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-neutral-700">{estrategia.ejemplo}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

{/* La matriz DOFA: radiografía estratégica */}

          <section className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">La matriz DOFA: radiografía estratégica para la toma de decisiones.</h3>

            <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

              La matriz DOFA permite a las organizaciones conocerse a sí mismas y su entorno para actuar con inteligencia. Las Fortalezas y Debilidades muestran el estado interno: recursos, procesos y cultura. Las Oportunidades y Amenazas provienen del entorno: competencia, tendencias y factores socioeconómicos. Un análisis bien realizado no es solo una lista, sino una base para formular estrategias: potenciar fortalezas, minimizar debilidades, aprovechar oportunidades y enfrentar amenazas. Su uso no se limita a grandes empresas; cualquier emprendimiento o proyecto personal puede beneficiarse de esta herramienta.

            </p>

          </section>

{/* 6 ventajas de la matriz DOFA */}

          <section className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">6 ventajas de la matriz DOFA.</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Si aplicas la matriz DOFA en el contexto de tu emprendimiento tendrás ventajas como:

            </p>

            <ol className="list-decimal list-inside space-y-3 text-neutral-700 text-sm md:text-base ml-4">

              <li><strong>Visión integral del emprendimiento:</strong> permite analizar simultáneamente factores internos (fortalezas y debilidades) y externos (oportunidades y amenazas), ayudándote a construir un panorama completo de la situación actual del emprendimiento.</li>

              <li><strong>Mejora en la toma de decisiones:</strong> facilita decisiones argumentadas, reduciendo sesgos y prejuicios y orientando al emprendedor hacia estrategias realistas y alineadas con las capacidades de su negocio.</li>

              <li><strong>Identificación de ventajas competitivas:</strong> resalta las fortalezas que diferencian al emprendimiento en el mercado, permitiendo diseñar estrategias para aprovechar esas ventajas frente a la competencia.</li>

              <li><strong>Prevención de riesgos:</strong> al reconocer las amenazas externas, el emprendedor puede anticiparse y diseñar planes de contingencia, reduciendo la vulnerabilidad frente a cambios del mercado, regulaciones o competidores.</li>

              <li><strong>Aprovechamiento de oportunidades:</strong> orienta hacia nichos de mercado, tendencias emergentes o alianzas estratégicas, favoreciendo la innovación y la adaptación en entornos dinámicos.</li>

              <li><strong>Simplicidad y aplicabilidad:</strong> es una herramienta fácil de usar, incluso para emprendedores sin formación avanzada en estrategia. Puede aplicarse en cualquier sector, desde cafeterías locales hasta startups tecnológicas.</li>

            </ol>

          </section>

{/* Estudio de caso */}

          <section className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Estudio de caso: DOFA para una cafetería local.</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Una pequeña cafetería local en Tumaco desea realizar un diagnóstico de su negocio, para tal propósito, aplica el análisis DOFA obteniendo los siguientes resultados:

            </p>

<div className="overflow-x-auto mb-4">

              <table className="w-full border-collapse bg-white border-2 border-neutral-300 rounded-lg">

                <thead>

                  <tr className="bg-neutral-900 text-white">

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Interno</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Externo</th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 align-top">

                      <div className="mb-4">

                        <p className="font-semibold text-green-700 mb-2">Fortalezas (F)</p>

                        <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm">

                          <li>Café orgánico de alta calidad.</li>

                          <li>Atención personalizada.</li>

                        </ul>

                      </div>

                      <div>

                        <p className="font-semibold text-red-700 mb-2">Debilidades (D)</p>

                        <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm">

                          <li>Escasa presencia digital.</li>

                          <li>Limitado capital para expansión.</li>

                        </ul>

                      </div>

                    </td>

                    <td className="border border-neutral-300 px-4 py-3 align-top">

                      <div className="mb-4">

                        <p className="font-semibold text-blue-700 mb-2">Oportunidades (O)</p>

                        <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm">

                          <li>Crecimiento del consumo de productos sostenibles.</li>

                          <li>Tendencia al teletrabajo que incrementa clientes locales.</li>

                        </ul>

                      </div>

                      <div>

                        <p className="font-semibold text-amber-700 mb-2">Amenazas (A)</p>

                        <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm">

                          <li>Entrada de cadenas internacionales.</li>

                          <li>Aumento en el precio del café.</li>

                        </ul>

                      </div>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

<div>

              <h4 className="text-lg font-semibold text-neutral-800 mb-3">Estrategias derivadas:</h4>

              <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm md:text-base ml-4">

                <li><strong>Estrategias FO:</strong> Aprovechar el interés en productos sostenibles para fortalecer campañas de marketing digital.</li>

                <li><strong>Estrategias DO:</strong> Buscar alianzas con influencers locales para aumentar la visibilidad online.</li>

                <li><strong>Estrategias FA:</strong> Usar la calidad del producto para diferenciarse frente a grandes cadenas.</li>

                <li><strong>Estrategias DA:</strong> Diversificar proveedores para mitigar riesgos de precios.</li>

              </ul>

            </div>

          </section>

        </div>

{/* Bottom Navigation */}

        <div className="flex justify-end mt-8">

          <div className="relative group">

            <Button

              onClick={handleCompleteStep}

              disabled={!hasScrolledToBottom}

              className={`bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${

                !hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

              }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

            {!hasScrolledToBottom && (

              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">

                Desplázate hasta el final para continuar

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

          onClick={() => navigate('/student/unidad1')}

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

export default Unidad1DesarrolloPage;


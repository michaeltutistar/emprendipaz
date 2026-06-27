import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const LiderazgoUnidad2DesarrolloPage = () => {

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

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Liderazgo',

          paso_nombre: 'Unidad 2: Fundamentación',

          curso_nombre: 'Liderazgo'

        })

      });

      navigate('/student/liderazgo/unidad2/taller');

    } catch (error) {

      navigate('/student/liderazgo/unidad2/taller');

    }

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

                      Liderazgo

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 2

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

                                        <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/student/perfil');
                      }}
                      className="max-w-[180px] truncate text-sm font-semibold text-white"
                    >
                      {userName || 'Usuario'}
                    </span>

                    <ChevronDown className="w-4 h-4 text-white" />

                  </button>

{userMenuOpen && (

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border z-[10001]">

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

              Módulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button onClick={() => navigate('/student/liderazgo')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Liderazgo

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Liderazgo Visionario

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

              MÓDULO: Liderazgo

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

              Liderazgo Visionario

            </h1>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z" fill="white" />

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

              <p className="text-[10px] text-gray-500">Cierre</p>

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

                  Fundamentos sobre liderazgo visionario

                </h2>

                <div className="w-16 h-1 bg-[#006837]"></div>

              </div>

<div className="prose prose-lg max-w-none space-y-6">

                <div className="mb-8">

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Conoces las capacidades de un líder?</h3>

                  <p className="text-gray-700 mb-4 leading-relaxed text-base">

                    Para liderar tu emprendimiento, es importante que conozcas y desarrolles estas capacidades, catalogadas como indispensables para dirigir de manera efectiva a tu equipo de trabajo:

                  </p>

<div className="space-y-4 mb-6">

                    <div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                      <h4 className="font-semibold text-gray-900 mb-2">Habilidades de liderazgo</h4>

                      <p className="text-gray-700">

                        Poseen creencias, valores, ética, carácter, conocimiento, valentía y destrezas que motivan a la gente a seguirlos. Irradian una energía que contagia confianza y tienen la facilidad de levantar la moral del equipo cuando hay dificultades.

                      </p>

                    </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                      <h4 className="font-semibold text-gray-900 mb-2">Visión</h4>

                      <p className="text-gray-700">

                        Los líderes tienen la capacidad de impulsar la productividad en las áreas que más lo requieren. Pueden presentar una visión clara y motivadora que los colaboradores asumen y que los inspira a lograr los objetivos.

                      </p>

                    </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                      <h4 className="font-semibold text-gray-900 mb-2">Gestión de equipos</h4>

                      <p className="text-gray-700">

                        Los líderes desarrollan equipos con alta productividad que se integran para colaborar y alcanzar una meta común.

                      </p>

                    </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                      <h4 className="font-semibold text-gray-900 mb-2">Resolución de conflictos</h4>

                      <p className="text-gray-700">

                        Los líderes resuelven enfrentamientos al enfocarse en solucionar problemas de forma justa para las partes implicadas. Un buen líder es firme y, a la vez, flexible con los colaboradores.

                      </p>

                    </div>

                  </div>

                </div>

<div className="mb-8">

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">La trilogía de la comunicación efectiva</h3>

                  <p className="text-gray-700 mb-4 leading-relaxed text-base">

                    La comunicación efectiva por parte del líder en tres áreas clave es indispensable para ganar la confianza del equipo de trabajo:

                  </p>

                  <div className="flex justify-center my-6">

                    <img

                      src="/la trilogia de la comunicación efectiva.png"

                      alt="La trilogía de la comunicación efectiva"

                      className="max-w-full h-auto rounded-lg shadow-md"

                    />

                  </div>

                </div>

<div className="mb-8">

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Apunta a la cima del liderazgo</h3>

                  <p className="text-gray-700 mb-4 leading-relaxed text-base">

                    En la Unidad 1 estudiamos cinco tipos de liderazgo. Concluimos que cada persona posee uno predominante y que, en realidad, lo importante no es encasillarse en un solo estilo, sino comprender sus ventajas y desventajas, así como identificar en qué contexto resulta conveniente aplicar cada tipo de liderazgo.

                  </p>

                  <p className="text-gray-700 mb-4 leading-relaxed text-base">

                    Sin embargo, existe un tipo de liderazgo que reúne todas las características ideales que debería tener un líder. Se trata de un modelo completo de liderazgo al cual los grandes personajes de la historia han aspirado siempre: el liderazgo visionario.

                  </p>

                  <p className="text-gray-700 mb-6 leading-relaxed text-base">

                    El liderazgo visionario, descrito por Goleman, puede definirse como uno de los estilos más impactantes, pues conecta profundamente con las emociones, aspiraciones y valores del equipo de trabajo. El líder visionario no solo es capaz de dirigir, sino que también inspira a través de una visión clara, atractiva y compartida. Este estilo resulta ideal en diversas situaciones del ámbito empresarial, como reorientar el rumbo, motivar de manera profunda o transformar de raíz la cultura organizacional.

                  </p>

                  <p className="text-gray-700 mb-4 leading-relaxed text-base font-semibold">

                    Algunas características puntuales del líder visionario incluyen:

                  </p>

<div className="overflow-x-auto mb-8">

                    <table className="min-w-full border border-gray-200 rounded-xl text-sm">

                      <thead className="bg-gray-900 text-white">

                        <tr>

                          <th className="px-4 py-3 text-left">Característica</th>

                          <th className="px-4 py-3 text-left">Definición</th>

                          <th className="px-4 py-3 text-left">Ejemplo</th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-200">

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Inspiración emocional</td>

                          <td className="px-4 py-3">Transmite entusiasmo y sentido de propósito.</td>

                          <td className="px-4 py-3">El líder motiva al equipo en una reunión, generando energía positiva frente a un reto.</td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Compromiso con la visión</td>

                          <td className="px-4 py-3">Vive y encarna los valores del emprendimiento.</td>

                          <td className="px-4 py-3">Actúa coherentemente con los principios de la empresa, incluso en decisiones difíciles.</td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Comunicación clara</td>

                          <td className="px-4 py-3">Explica el "por qué" detrás de cada acto.</td>

                          <td className="px-4 py-3">Antes de asignar una tarea, explica cómo contribuye al objetivo general del proyecto.</td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Empatía estratégica</td>

                          <td className="px-4 py-3">Conecta con las necesidades del equipo y las alinea con los objetivos.</td>

                          <td className="px-4 py-3">Escucha las preocupaciones de los colaboradores y ajusta el plan para mantener motivación.</td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Capacidad de movilizar</td>

                          <td className="px-4 py-3">Genera fidelidad y energía en el equipo de trabajo.</td>

                          <td className="px-4 py-3">El equipo se ofrece voluntariamente a asumir responsabilidades adicionales en un proyecto.</td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Orientación a largo plazo</td>

                          <td className="px-4 py-3">Piensa en sostenibilidad, legado y evolución.</td>

                          <td className="px-4 py-3">Diseña estrategias que aseguran el crecimiento del negocio más allá de resultados inmediatos.</td>

                        </tr>

                      </tbody>

                    </table>

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

                  Líderes visionarios en la historia de la humanidad

                </h2>

                <div className="w-16 h-1 bg-gray-900"></div>

              </div>

<div className="prose prose-neutral max-w-none space-y-6">

                <p className="text-gray-700 leading-relaxed text-base mb-6">

                  Vamos a observar algunos personajes históricos que encarnan las cualidades de un auténtico líder visionario:

                </p>

<div className="overflow-x-auto mb-8">

                  <table className="min-w-full border border-gray-200 rounded-xl text-sm">

                    <thead className="bg-gray-900 text-white">

                      <tr>

                        <th className="px-4 py-3 text-left">Nombre</th>

                        <th className="px-4 py-3 text-left">Contexto / Obra principal</th>

                        <th className="px-4 py-3 text-left">Rasgos visionarios clave</th>

                        <th className="px-4 py-3 text-left">¿Por qué es un líder visionario?</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-200">

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Nelson Mandela</td>

                        <td className="px-4 py-3">Luchó contra el apartheid en Sudáfrica y lideró la transición hacia una democracia inclusiva.</td>

                        <td className="px-4 py-3">Inspiración ética, resiliencia, visión de reconciliación.</td>

                        <td className="px-4 py-3">Movilizó a millones con una visión de paz y justicia, incluso tras décadas de encarcelamiento.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Mahatma Gandhi</td>

                        <td className="px-4 py-3">Impulsó la independencia de la India mediante la resistencia no violenta.</td>

                        <td className="px-4 py-3">Coherencia entre valores y acción, liderazgo moral, movilización pacífica.</td>

                        <td className="px-4 py-3">Transformó un movimiento político en una revolución ética basada en la no violencia.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Steve Jobs</td>

                        <td className="px-4 py-3">Fundador de Apple; revolucionó la tecnología personal con productos como el iPhone y el Mac.</td>

                        <td className="px-4 py-3">Imaginación disruptiva, obsesión por el diseño, visión del futuro digital.</td>

                        <td className="px-4 py-3">Anticipó necesidades no expresadas y creó productos que redefinieron industrias enteras.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Amancio Ortega</td>

                        <td className="px-4 py-3">Fundador de Zara; transformó la moda con el modelo de "fast fashion" accesible y ágil.</td>

                        <td className="px-4 py-3">Visión estratégica, enfoque en eficiencia, sensibilidad al mercado.</td>

                        <td className="px-4 py-3">Democratizó el acceso a la moda y rediseñó la cadena de valor en tiempo récord.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Juan Roig</td>

                        <td className="px-4 py-3">Presidente de Mercadona; convirtió una empresa local en líder nacional en distribución.</td>

                        <td className="px-4 py-3">Visión de largo plazo, cultura de mejora continua, enfoque en el cliente.</td>

                        <td className="px-4 py-3">Reformuló el modelo de supermercado con eficiencia, innovación y compromiso social.</td>

                      </tr>

                    </tbody>

                  </table>

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

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/liderazgo/unidad2/inicio');

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

export default LiderazgoUnidad2DesarrolloPage;


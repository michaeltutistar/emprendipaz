import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const ModeloNegociosUnidad1DesarrolloPage = () => {

  const navigate = useNavigate();

  const [scrollProgress, setScrollProgress] = useState(0);

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

ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Modelo de Negocios',

          paso_nombre: 'Unidad 1: Fundamentación',

          curso_nombre: 'Modelo de Negocios'

        })

      });

      navigate('/student/modelo-negocios/unidad1/taller');

    } catch (error) {

      navigate('/student/modelo-negocios/unidad1/taller');

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

                      Modelo de Negocios

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

              <button onClick={() => navigate('/student/modelo-negocios')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Modelo de Negocios

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Business Model Canvas · Fundamentación

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

              MÓDULO: Modelo de Negocios

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

              Business Model Canvas

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

{/* Content */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="space-y-8">

          {/* Título e Instrucciones */}

          <div>

            <h2 

              className="text-[#006837] mb-4"

              style={{ 

                fontFamily: 'var(--font-heading)',

                fontSize: '2.25rem',

                fontWeight: 700,

              }}

            >

              Paso 2: Fundamentación

            </h2>

            <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 mb-6">

              <p className="text-gray-700 leading-snug text-xs">

                <strong>📌 Instrucciones:</strong> Debes leer todo el contenido hasta el final para activar el siguiente paso.

              </p>

            </div>

          </div>

{/* Título Principal */}

          <section>

            <h2 

              className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4"

              style={{ fontFamily: 'var(--font-heading)' }}

            >

              UNIDAD 1: BUSINESS MODEL CANVAS

            </h2>

          </section>

{/* Fundamentos Business Model Canvas */}

          <section>

            <h3 

              className="text-xl md:text-2xl font-bold text-neutral-900 mb-4"

              style={{ fontFamily: 'var(--font-heading)' }}

            >

              Fundamentos Business Model Canvas

            </h3>

          </section>

{/* ¿Qué es el modelo Business Model Canvas? */}

          <section>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3">¿Qué es el modelo Business Model Canvas?</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              El Business Model Canvas es una herramienta visual que permite estructurar, analizar y comunicar el modelo de negocios en una sola página. Fue creado por Alexander Osterwalder y Yves Pigneur y se compone de nueve bloques interconectados que muestran cómo una empresa crea, entrega y captura valor.

            </p>

          </section>

{/* Los nueve elementos clave del Canvas */}

          <section>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3">Los nueve elementos clave del Canvas</h3>

<div className="space-y-4 mb-6">

              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Segmento de clientes:</strong> define a quién se dirige la empresa y cuál es su público objetivo.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Mujeres entre 30 y 40 años de San Juan de Pasto que buscan ropa exclusiva para vacaciones.

                </p>

              </div>

<div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Propuesta de valor:</strong> explica qué problema resuelve y por qué los clientes eligen la empresa.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: "Prendas artesanales de playa con diseños únicos y materiales de calidad, producidas localmente."

                </p>

              </div>

<div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Canales:</strong> describe cómo se llega al cliente y cómo se entrega el producto o servicio.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Tienda física en Pasto, Instagram y servicio de entrega a domicilio.

                </p>

              </div>

<div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Relación con clientes:</strong> establece cómo se interactúa y se retiene a los clientes.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Atención personalizada en tienda y comunicación constante por WhatsApp.

                </p>

              </div>

<div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Fuentes de ingresos:</strong> identifica cómo se generan los ingresos y cuál es el modelo de monetización.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Venta directa por unidad y paquetes especiales para eventos.

                </p>

              </div>

<div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Recursos clave:</strong> señala los activos esenciales (humanos, tecnológicos, financieros, físicos).

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Diseñadora principal, máquinas de coser, capital inicial y proveedores de telas.

                </p>

              </div>

<div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Actividades clave:</strong> define las acciones críticas que permiten que el negocio funcione.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Diseño de prendas, confección diaria y gestión de redes sociales.

                </p>

              </div>

<div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Asociaciones clave:</strong> muestra con quién se colabora para reducir riesgos y aprovechar oportunidades.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Proveedores locales de telas y alianzas con influenciadores de moda.

                </p>

              </div>

<div className="bg-pink-50 border-l-4 border-pink-600 p-4 rounded-lg">

                <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                  <strong>Estructura de costos:</strong> detalla los gastos principales, tanto fijos como variables.

                </p>

                <p className="text-neutral-600 text-sm italic">

                  Ejemplo: Arrendamiento del taller, servicios públicos, compra de telas y pago a costureras.

                </p>

              </div>

            </div>

          </section>

{/* Ventajas del Business Model Canvas */}

          <section>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3">Ventajas del Business Model Canvas para un emprendimiento</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              La aplicación de este modelo genera ventajas importantes en tu emprendimiento, entre las que se destacan:

            </p>

            <ul className="space-y-2 text-neutral-700 text-sm md:text-base ml-6 list-disc">

              <li><strong>Claridad estratégica:</strong> permite visualizar de manera sencilla cómo funciona el negocio en su totalidad.</li>

              <li><strong>Coherencia interna:</strong> asegura que todos los elementos estén alineados entre sí, evitando contradicciones.</li>

              <li><strong>Flexibilidad:</strong> facilita ajustes rápidos ante cambios del mercado o nuevas oportunidades.</li>

              <li><strong>Comunicación efectiva:</strong> sirve como herramienta para explicar el modelo a socios, inversionistas o equipos de trabajo.</li>

              <li><strong>Validación temprana:</strong> ayuda a identificar debilidades y fortalezas antes de escalar el negocio.</li>

              <li><strong>Accesibilidad:</strong> no requiere conocimientos técnicos avanzados; cualquier emprendedor puede aplicarlo.</li>

              <li><strong>Enfoque práctico:</strong> convierte ideas abstractas en un esquema visual que orienta decisiones inmediatas.</li>

            </ul>

          </section>

{/* Estudio de caso: Beachwear Nariño */}

          <section className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-600 p-6 rounded-lg">

            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Estudio de caso: Beachwear Nariño</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              A continuación, encontrarás un ejemplo práctico de cómo se aplican los conceptos estudiados en esta primera unidad:

            </p>

<div className="mb-4">

              <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

                Catalina Martínez, emprendedora de Pasto, diseña y vende prendas de playa de manera informal. Aunque su negocio funciona, enfrenta problemas:

              </p>

              <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm md:text-base ml-4 mb-4">

                <li><strong>Segmentación indefinida:</strong> no conoce con claridad quién es su cliente ideal.</li>

                <li><strong>Propuesta de valor débil:</strong> compite por precio sin diferenciación clara.</li>

                <li><strong>Canales dispersos:</strong> usa redes sociales sin medir su efectividad.</li>

                <li><strong>Costos opacos:</strong> desconoce su margen real por prenda.</li>

                <li><strong>Modelo poco escalable:</strong> no sabe si puede crecer con mayoristas o tienda física.</li>

              </ul>

            </div>

<div className="mb-4">

              <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed font-semibold">

                Al aplicar el Business Model Canvas, Catalina obtuvo:

              </p>

<div className="bg-white border-2 border-orange-300 rounded-lg p-4 space-y-3">

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Segmento de clientes:</strong><br/>

                  Mujeres jóvenes de 25-35 años en Pasto que buscan prendas exclusivas para vacaciones.

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Propuesta de valor:</strong><br/>

                  "Diseños únicos de bañadores con materiales de calidad y producción ética local."

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Canales:</strong><br/>

                  Instagram como canal principal, WhatsApp para pedidos y alianzas con tiendas de ropa.

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Relación con clientes:</strong><br/>

                  Atención personalizada en redes sociales y fidelización con promociones.

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Fuentes de ingresos:</strong><br/>

                  Venta directa por unidad y pedidos especiales para grupos.

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Recursos clave:</strong><br/>

                  Taller pequeño, máquinas de coser, costureras freelance y proveedores locales.

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Actividades clave:</strong><br/>

                  Diseño, confección, gestión de redes sociales y atención de pedidos.

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Asociaciones clave:</strong><br/>

                  Proveedores de telas y colaboraciones con influenciadores locales.

                </p>

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>Estructura de costos:</strong><br/>

                  Telas (15.000-20.000 COP por prenda), mano de obra (8.000 COP), arrendamiento (300.000 COP/más) y servicios (150.000 COP/más).

                </p>

              </div>

            </div>

<div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                Este ejercicio le permitió identificar debilidades y estructurar un modelo más claro y sostenible.

              </p>

            </div>

          </section>

        </div>

{/* Botón Continuar */}

        {hasScrolledToBottom && (

          <div className="mt-8 flex justify-end">

            <Button

              onClick={handleCompleteStep}

              className="bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2"

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        )}

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/modelo-negocios/unidad1/inicio');

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

export default ModeloNegociosUnidad1DesarrolloPage;


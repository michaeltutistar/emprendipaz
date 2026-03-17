import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { clearLocalSession, getAuthToken } from '@/utils/auth-storage'

const PlanInversionUnidad2DesarrolloPage = () => {

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

          modulo_nombre: 'Plan de Inversión',

          paso_nombre: 'Unidad 2: Fundamentación',

          curso_nombre: 'Plan de Inversión'

        })

      });

      navigate('/student/plan-inversion/unidad2/taller');

    } catch (error) {

      navigate('/student/plan-inversion/unidad2/taller');

    }

  };

const handleLogout = () => {
    clearLocalSession();
    localStorage.removeItem('userData');
    navigate('/login');

  };

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* HEADER ANIMADO */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-4 sm:px-8 overflow-hidden min-h-[60px]"

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

                    src="/formacion.png" 

                    alt="Formación Logo" 

                    onClick={() => navigate(`/student/dashboard`)} 

                    className="h-10 w-auto object-contain drop-shadow-2xl cursor-pointer hover:opacity-80"

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

                      Plan de Inversión

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

                        alt={userName}

                        className="w-10 h-10 rounded-full border-2 border-white object-cover"

                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}

                      />

                    ) : (

                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">

                        <span className="text-white font-semibold text-sm">

                          {userName ? userName.charAt(0).toUpperCase() : 'U'}

                        </span>

                      </div>

                    )}

                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />

                  </button>

{userMenuOpen && (

                    <motion.div

                      initial={{ opacity: 0, y: -10 }}

                      animate={{ opacity: 1, y: 0 }}

                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[10001]"

                    >

                      <button

                        onClick={() => {

                          setUserMenuOpen(false);

                          navigate('/student/perfil');

                        }}

                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"

                      >

                        <span className="text-gray-700">Mi perfil</span>

                      </button>

                      <button

                        onClick={handleLogout}

                        className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"

                      >

                        <LogOut className="w-4 h-4" />

                        <span>Cerrar sesión</span>

                      </button>

                    </motion.div>

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

                className="text-gray-600 hover:text-[#59D22E] transition-colors flex items-center gap-1"

              >

                <Home className="w-3.5 h-3.5" />

                Inicio

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button

                onClick={() => navigate('/student/modulos')}

                className="text-gray-600 hover:text-[#59D22E] transition-colors"

              >

                Modulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button

                onClick={() => navigate('/student/plan-inversion')}

                className="text-gray-600 hover:text-[#59D22E] transition-colors"

              >

                Plan de Inversión

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#59D22E] font-semibold">

                Unidad 2 · Fundamentación

              </span>

            </div>

          </div>

        </motion.div>

{/* Hero Section - MORADO */}

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

              MÓDULO: Plan de Inversión

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

              Análisis y Estructura Financiera del Plan de Inversión

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

<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">

        {/* Título Principal */}

        <motion.section

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.2 }}

          className="space-y-6"

        >

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">

            UNIDAD 2: ANÁLISIS Y ESTRUCTURA FINANCIERA DEL PLAN DE INVERSIÓN

          </h1>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-[#59D22E]/20 rounded-2xl p-8 shadow-lg">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fundamentos sobre análisis y estructura financiera del plan de inversión</h2>

<div className="space-y-6">

              {/* ¿Qué es el análisis financiero? */}

              <div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">¿Qué es el análisis financiero?</h3>

                <p className="text-base md:text-lg leading-relaxed text-gray-700">

                  El análisis financiero es el proceso que traduce las ideas de inversión en números claros y verificables. Es el lenguaje que entienden bancos, socios e inversionistas, y permite demostrar que una decisión de inversión no es intuición, sino estrategia sustentada en datos.

                </p>

              </div>

{/* Elementos fundamentales del análisis financiero */}

              <div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Elementos fundamentales del análisis financiero</h3>

{/* 1. Identificación de necesidades de inversión */}

                <div className="bg-gradient-to-br from-[#59D22E]/10 to-[#A5E811]/10 border-l-4 border-[#59D22E] p-5 rounded-xl mb-4">

                  <p className="text-base font-semibold text-[#59D22E] mb-2">1. Identificación de necesidades de inversión</p>

                  <p className="text-base text-gray-700 mb-2">Antes de calcular cifras, el emprendedor debe reconocer qué limita su crecimiento.</p>

                  <p className="text-base font-semibold text-gray-900 mb-2">Definición:</p>

                  <p className="text-base text-gray-700 mb-4">Detectar los cuellos de botella y transformarlos en necesidades concretas.</p>

                  <p className="text-base font-semibold text-gray-900 mb-2">Proceso:</p>

                  <ul className="list-disc list-inside space-y-1 text-base text-gray-700 ml-4 mb-2">

                    <li>Identificar limitantes (ejemplo: capacidad de producción insuficiente).</li>

                    <li>Especificar necesidades (ejemplo: telar semiautomático).</li>

                    <li>Dimensionar (ejemplo: capacidad de 500 prendas/más).</li>

                    <li>Priorizar (ejemplo: inversión más urgente es el telar, no la publicidad).</li>

                    <li>Valorar económicamente (ejemplo: costo $4.5 millones).</li>

                  </ul>

                  <p className="text-base font-semibold text-gray-900 mb-2">Utilidad:</p>

                  <p className="text-base text-gray-700">Permite que la inversión responda a un problema real y no a un deseo abstracto.</p>

                </div>

{/* 2. Fuentes de financiamiento */}

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-xl mb-4">

                  <p className="text-base font-semibold text-blue-900 mb-2">2. Fuentes de financiamiento</p>

                  <p className="text-base text-gray-700 mb-2">Toda inversión requiere dinero, y conocer las fuentes disponibles es clave para estructurar un plan viable.</p>

                  <ul className="list-disc list-inside space-y-1 text-base text-gray-700 ml-4 mb-2">

                    <li><strong>Capital propio:</strong> ahorros o aportes de socios, sin costo financiero.</li>

                    <li><strong>Crédito bancario:</strong> préstamás formales, con tasas reguladas (8–18% anual).</li>

                    <li><strong>Microcrédito:</strong> accesible, pero con tasas más altas (20–36% anual).</li>

                    <li><strong>Capital de terceros:</strong> inversión de ángeles o socios, con participación en ganancias.</li>

                    <li><strong>Subsidios/convenios:</strong> fondos no reembolsables, competitivos.</li>

                    <li><strong>Reinversión de ganancias:</strong> más lento, pero sin endeudamiento.</li>

                  </ul>

                  <p className="text-base font-semibold text-gray-900 mb-2">Ejemplo aplicado:</p>

                  <p className="text-base text-gray-700">Una inversión de $6 millones puede financiarse con $2.5 millones de capital propio y $3.5 millones de crédito bancario.</p>

                </div>

{/* 3. Proyección de flujos de caja */}

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 p-5 rounded-xl mb-4">

                  <p className="text-base font-semibold text-purple-900 mb-2">3. Proyección de flujos de caja</p>

                  <p className="text-base text-gray-700 mb-2">El flujo de caja es la herramienta que muestra cómo entra y sale el dinero en el negocio.</p>

                  <p className="text-base font-semibold text-gray-900 mb-2">Estructura básica:</p>

                  <ul className="list-disc list-inside space-y-1 text-base text-gray-700 ml-4 mb-2">

                    <li><strong>Ingresos:</strong> ventas de productos o servicios.</li>

                    <li><strong>Costos variables:</strong> materia prima, empaque, transporte.</li>

                    <li><strong>Costos fijos:</strong> arriendo, servicios, nómina.</li>

                    <li><strong>Pagos de deuda:</strong> cuotas de crédito.</li>

                    <li><strong>Flujo neto:</strong> resultado final disponible.</li>

                  </ul>

                  <p className="text-base font-semibold text-gray-900 mb-2">Ejemplo:</p>

                  <p className="text-base text-gray-700 mb-2">Tras invertir en un horno industrial, los ingresos suben a $2.5M, los costos a $1.4M, y el flujo neto mensual queda en $900,000.</p>

                  <p className="text-base font-semibold text-gray-900 mb-2">Utilidad:</p>

                  <p className="text-base text-gray-700">Permite anticipar si la inversión generará dinero suficiente para cubrir gastos y crecer.</p>

                </div>

{/* 4. Indicadores financieros básicos */}

                <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 p-5 rounded-xl mb-4">

                  <p className="text-base font-semibold text-green-900 mb-2">4. Indicadores financieros básicos</p>

                  <p className="text-base text-gray-700 mb-2">Son herramientas que resumen la viabilidad de la inversión en cifras clave:</p>

                  <ul className="list-disc list-inside space-y-1 text-base text-gray-700 ml-4 mb-2">

                    <li><strong>VAN (Valor Actual Neto):</strong> mide la riqueza adicional generada. Si es positivo, la inversión crea valor.</li>

                    <li><strong>TIR (Tasa Interna de Retorno):</strong> mide la rentabilidad porcentual anual. Si es mayor al costo del crédito, la inversión es rentable.</li>

                    <li><strong>Período de retorno (Payback):</strong> tiempo necesario para recuperar la inversión inicial. Mientras más corto, mejor.</li>

                    <li><strong>Punto de equilibrio:</strong> nivel mínimo de ventas para cubrir costos.</li>

                  </ul>

                  <p className="text-base font-semibold text-gray-900 mb-2">Ejemplo aplicado:</p>

                  <p className="text-base text-gray-700">Telar semiautomático → VAN $2.1M, TIR 32%, retorno 14 meses, punto de equilibrio 40% de capacidad.</p>

                </div>

{/* 5. Sensibilidad y riesgos */}

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 p-5 rounded-xl">

                  <p className="text-base font-semibold text-orange-900 mb-2">5. Sensibilidad y riesgos</p>

                  <p className="text-base text-gray-700 mb-2">El análisis financiero no es estático: depende de supuestos que pueden variar.</p>

                  <p className="text-base font-semibold text-gray-900 mb-2">Escenarios:</p>

                  <ul className="list-disc list-inside space-y-1 text-base text-gray-700 ml-4 mb-2">

                    <li><strong>Optimista:</strong> ventas superan lo esperado.</li>

                    <li><strong>Base:</strong> ventas cumplen lo proyectado.</li>

                    <li><strong>Pesimista:</strong> ventas menores, pero aún viables.</li>

                    <li><strong>Muy pesimista:</strong> ventas insuficientes, inversión no recuperada.</li>

                  </ul>

                  <p className="text-base font-semibold text-gray-900 mb-2">Ejemplo aplicado:</p>

                  <p className="text-base text-gray-700 mb-2">Si las ventas proyectadas eran $4.5M y solo alcanzan $2.7M, el VAN se vuelve negativo y la inversión deja de ser viable.</p>

                  <p className="text-base font-semibold text-gray-900 mb-2">Utilidad:</p>

                  <p className="text-base text-gray-700">Permite anticipar riesgos y definir planes de contingencia (ejemplo: asegurar contratos antes de invertir).</p>

                </div>

              </div>

            </div>

          </div>

        </motion.section>

{/* Estudio de Caso */}

        <motion.section

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.4 }}

          className="space-y-6"

        >

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Estudio de caso: Sabores Nariño</h2>

{/* Contexto */}

            <div className="mb-6">

              <h3 className="text-xl font-bold text-gray-900 mb-3">Contexto</h3>

              <p className="text-base md:text-lg leading-relaxed text-gray-700">

                La empresa Sabores Nariño produce conservas y panela artesanal. Tras 20 meses, genera $1.5M mensuales y acumula $2.5M de capital propio. Un supermercado le propone triplicar producción si invierte en nuevos equipos.

              </p>

            </div>

{/* Oportunidad de inversión */}

            <div className="mb-6">

              <h3 className="text-xl font-bold text-gray-900 mb-3">Oportunidad de inversión</h3>

              <ul className="list-disc list-inside space-y-2 text-base md:text-lg text-gray-700 ml-4">

                <li><strong>Equipo de producción:</strong> $4,000,000</li>

                <li><strong>Adecuación de espacio:</strong> $800,000</li>

                <li><strong>Capital de trabajo:</strong> $1,200,000</li>

                <li><strong>Total inversión:</strong> $6,000,000</li>

              </ul>

            </div>

{/* Comparativo de escenarios */}

            <div className="mb-6">

              <h3 className="text-xl font-bold text-gray-900 mb-3">Comparativo de escenarios</h3>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse border-2 border-gray-200 text-sm rounded-lg overflow-hidden mb-4">

                  <thead>

                    <tr className="bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white">

                      <th className="border border-gray-300 p-3 text-left font-bold">Escenario</th>

                      <th className="border border-gray-300 p-3 text-left font-bold">Ventas</th>

                      <th className="border border-gray-300 p-3 text-left font-bold">VAN</th>

                      <th className="border border-gray-300 p-3 text-left font-bold">TIR</th>

                      <th className="border border-gray-300 p-3 text-left font-bold">Retorno</th>

                      <th className="border border-gray-300 p-3 text-left font-bold">Viabilidad</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="hover:bg-gray-50 transition-colors">

                      <td className="border border-gray-300 p-3 font-semibold text-gray-900">Optimista</td>

                      <td className="border border-gray-300 p-3 text-gray-700">$5,400,000</td>

                      <td className="border border-gray-300 p-3 text-gray-700">$4,800,000</td>

                      <td className="border border-gray-300 p-3 text-gray-700">35%</td>

                      <td className="border border-gray-300 p-3 text-gray-700">4 meses</td>

                      <td className="border border-gray-300 p-3 text-gray-700">Excelente</td>

                    </tr>

                    <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">

                      <td className="border border-gray-300 p-3 font-semibold text-gray-900">Base</td>

                      <td className="border border-gray-300 p-3 text-gray-700">$4,500,000</td>

                      <td className="border border-gray-300 p-3 text-gray-700">$3,450,000</td>

                      <td className="border border-gray-300 p-3 text-gray-700">28%</td>

                      <td className="border border-gray-300 p-3 text-gray-700">6 meses</td>

                      <td className="border border-gray-300 p-3 text-gray-700">Muy buena</td>

                    </tr>

                    <tr className="hover:bg-gray-50 transition-colors">

                      <td className="border border-gray-300 p-3 font-semibold text-gray-900">Pesimista</td>

                      <td className="border border-gray-300 p-3 text-gray-700">$3,600,000</td>

                      <td className="border border-gray-300 p-3 text-gray-700">$1,850,000</td>

                      <td className="border border-gray-300 p-3 text-gray-700">18%</td>

                      <td className="border border-gray-300 p-3 text-gray-700">9 meses</td>

                      <td className="border border-gray-300 p-3 text-gray-700">Viable</td>

                    </tr>

                    <tr className="bg-red-50 hover:bg-red-100 transition-colors">

                      <td className="border border-gray-300 p-3 font-semibold text-gray-900">Muy pesimista</td>

                      <td className="border border-gray-300 p-3 text-gray-700">$2,700,000</td>

                      <td className="border border-gray-300 p-3 text-red-600 font-semibold">-$200,000</td>

                      <td className="border border-gray-300 p-3 text-gray-700">12%</td>

                      <td className="border border-gray-300 p-3 text-gray-700">No recupera</td>

                      <td className="border border-gray-300 p-3 text-red-600 font-semibold">No viable</td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

{/* Decisión */}

            <div className="bg-gradient-to-br from-[#59D22E]/10 to-[#A5E811]/10 border-l-4 border-[#59D22E] p-6 rounded-xl">

              <h3 className="text-xl font-bold text-[#59D22E] mb-3">Decisión</h3>

              <p className="text-base md:text-lg leading-relaxed text-gray-700">

                La inversión es viable en escenarios base y pesimista. Se recomienda proceder, asegurando contratos con el supermercado y diversificando clientes para reducir riesgos.

              </p>

            </div>

          </div>

        </motion.section>

      </div>{/* Botón de siguiente paso */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-12">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: hasScrolledToBottom ? 1 : 0.5, y: 0 }}

          transition={{ duration: 0.3 }}

          className="flex justify-end"

        >

          <Button

            onClick={handleCompleteStep}

            disabled={!hasScrolledToBottom}

            className={`px-6 py-3 text-sm font-bold rounded-lg transition-all transform ${

              hasScrolledToBottom

                ? 'bg-gradient-to-r from-[#59D22E] to-[#A5E811] hover:from-[#A5E811] hover:to-[#59D22E] text-white shadow-lg hover:scale-105'

                : 'bg-gray-300 text-gray-500 cursor-not-allowed'

            }`}

          >

            {hasScrolledToBottom ? 'Siguiente Paso →' : 'Desplázate hasta el final para continuar'}

          </Button>

        </motion.div>

      </div>

{/* Botón flotante de regreso */}

      <motion.div

        initial={{ opacity: 0, x: -20 }}

        animate={{ opacity: 1, x: 0 }}

        className="fixed bottom-8 left-8 z-40"

      >

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/plan-inversion/unidad2/inicio');

          }}

          className="bg-white hover:bg-gray-100 text-[#59D22E] border-2 border-[#59D22E] rounded-full px-6 py-3 flex items-center gap-2 shadow-2xl font-bold transition-all transform hover:scale-105"

        >

          <ArrowLeft className="w-5 h-5" />

          Atrás

        </Button>

      </motion.div>

<Footer />

    </div>

  );

};

export default PlanInversionUnidad2DesarrolloPage;


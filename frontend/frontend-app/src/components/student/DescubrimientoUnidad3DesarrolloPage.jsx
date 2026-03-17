import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const DescubrimientoUnidad3DesarrolloPage = () => {

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

const { pasoCompletado, registrarProgreso } = useProgressTracking('Descubrimiento de Oportunidades', 'Unidad 3: Fundamentación');

const handleCompleteStep = async () => {

    if (!hasScrolledToBottom) return;

    // Registrar progreso en el backend

    await registrarProgreso();

    navigate('/student/descubrimiento-oportunidades/unidad3/taller');

  };

return (

    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">

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

                      Unidad 3

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

                Modulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/descubrimiento-oportunidades')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Descubrimiento de Oportunidades

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Ciclo de Vida del Producto · Fundamentación

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

              Ciclo de Vida del Producto

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

{/* Contenido */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-8">

          {/* Título e Instrucciones */}

          <div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#1a1a1a' }}>

              Contenidos sobre Ciclo de Vida de un Producto

            </h2>

            <div className="bg-purple-50 border-l-4 border-[#AA27B9] p-4 rounded">

              <p className="text-gray-700 text-sm md:text-base">

                <strong>📌 Instrucciones:</strong> Lee detenidamente el siguiente contenido sobre el ciclo de vida del producto. 

                Desplázate hasta el final para continuar al siguiente paso.

              </p>

            </div>

          </div>

{/* Introducción */}

          <section>

            <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">

              El ciclo de vida de un producto (CVP) es una herramienta clave del marketing que permite comprender las etapas por las que pasa un producto desde su creación hasta su salida del mercado. Este modulo utiliza la idea de negocio "Taller: Desarrollando mi Producto" para que el estudiante aplique los conceptos de manera práctica y contextualizada.

            </p>

          </section>

{/* Objetivos */}

          <section>

            <h3 className="text-xl font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Objetivo General</h3>

            <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">

              Analizar y aplicar el ciclo de vida de un producto en el desarrollo de una idea de negocio.

            </p>

<h3 className="text-xl font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Objetivos Específicos</h3>

            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm md:text-base">

              <li>Conocer las etapas del ciclo de vida del producto.</li>

              <li>Identificar características clave de cada etapa.</li>

              <li>Aplicar el CVP al taller "Desarrollando mi Producto".</li>

              <li>Proponer estrategias de marketing para cada fase.</li>

              <li>Evaluar productos reales utilizando el modelo.</li>

            </ol>

          </section>

{/* Etapas del CVP */}

          <section>

            <h3 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Etapas del Ciclo de Vida de un Producto</h3>

            <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">

              El ciclo de vida de un producto se divide en 4 etapas principales:

            </p>

            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm md:text-base mb-4">

              <li>Introducción</li>

              <li>Crecimiento</li>

              <li>Madurez</li>

              <li>Declive</li>

            </ol>

            <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">

              Cada una incluye características del mercado, ventas, inversión, competencia y estrategias recomendadas.

            </p>

          </section>

{/* Tabla de Fases del CVP */}

          <section className="bg-white border-2 border-gray-200 rounded-lg p-6">

            <div className="overflow-x-auto">

              <table className="w-full border-collapse border-2 border-gray-300 text-sm md:text-base">

                <thead>

                  <tr className="bg-gradient-to-r from-[#AA27B9] to-[#8E1FA3] text-white">

                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Fase del CVP</th>

                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Estrategias clave</th>

                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Ejemplo práctico</th>

                  </tr>

                </thead>

                <tbody>

                  {/* Fila 1: Introducción */}

                  <tr className="hover:bg-gray-50 transition-colors">

                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900 align-top">

                      1. Introducción

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      <ul className="list-disc list-inside space-y-1">

                        <li><strong>a).</strong> Promoción fuerte: dar visibilidad con campañas intensas.</li>

                        <li><strong>b).</strong> Pruebas gratuitas: incentivar adopción inicial.</li>

                        <li><strong>c).</strong> Definición de mercado meta: enfocar en el segmento adecuado.</li>

                      </ul>

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      Degustaciones en ferias y publicidad digital para posicionar un nuevo jugo natural.

                    </td>

                  </tr>

                  {/* Fila 2: Crecimiento */}

                  <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">

                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900 align-top">

                      2. Crecimiento

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      <ul className="list-disc list-inside space-y-1">

                        <li><strong>a).</strong> Diferenciar: destacar atributos únicos.</li>

                        <li><strong>b).</strong> Ampliar distribución: llegar a más mercados.</li>

                        <li><strong>c).</strong> Mejorar calidad: optimizar desempeño y características.</li>

                      </ul>

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      Expandir ventas a supermercados y mejorar la receta para fidelizar clientes.

                    </td>

                  </tr>

                  {/* Fila 3: Madurez */}

                  <tr className="hover:bg-gray-50 transition-colors">

                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900 align-top">

                      3. Madurez

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      <ul className="list-disc list-inside space-y-1">

                        <li><strong>a).</strong> Versiones nuevas: lanzar variantes.</li>

                        <li><strong>b).</strong> Promociones: descuentos para sostener ventas.</li>

                        <li><strong>c).</strong> Extensión de marca: aprovechar reputación para nuevos productos.</li>

                      </ul>

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      Introducir nuevos sabores y empaques biodegradables en un mercado saturado.

                    </td>

                  </tr>

                  {/* Fila 4: Declive */}

                  <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">

                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900 align-top">

                      4. Declive

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      <ul className="list-disc list-inside space-y-1">

                        <li><strong>a).</strong> Liquidación: vender inventario con rebajas.</li>

                        <li><strong>b).</strong> Segmentación selectiva: mantener el producto en nichos rentables.</li>

                        <li><strong>c).</strong> Retiro gradual: retirar progresivamente para minimizar impacto.</li>

                      </ul>

                    </td>

                    <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top">

                      Retirar sabores poco vendidos y mantener solo los más demandados en gimnasios.

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>

{/* Estudio de Caso */}

          <section className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-600 rounded-xl p-6">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>

              Estudio de Caso: "COCA-COLA ZERO"

            </h3>

            <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">

              A continuación, encontrarás un ejemplo práctico de cómo se desarrolla el CVP:

            </p>

<div className="space-y-4">

              <div>

                <h4 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>CASO REALISTA (LECTURA CONTINUA): CICLO DE VIDA DEL PRODUCTO – COCA-COLA ZERO</h4>

                <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">

                  En 2005, The Coca-Cola Company lanzó un nuevo producto llamado Coca-Cola Zero, una versión sin azúcar ni calorías diseñada para atraer principalmente a jóvenes adultos que buscaban el sabor tradicional de la Coca-Cola, pero sin el aporte calórico. La empresa decidió crear está producto porque Coca-Cola Light tenía gran aceptación en el público femenino, pero no lograba conectar con hombres jóvenes, quienes preferían un sabor más parecido al de la Coca-Cola original. Así comenzó la historia de un producto que recorrería todas las etapas del ciclo de vida.

                </p>

              </div>

<div className="bg-white border-l-4 border-green-600 p-4 rounded">

                <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Durante la etapa de introducción</h4>

                <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                  Coca-Cola invirtió fuertemente en campañas publicitarias, degustaciones en universidades y lanzamientos simultáneos en varios países. Aunque al inicio el público no entendía claramente la diferencia entre Coca-Cola Light y Coca-Cola Zero, la empresa insistió en reforzar el mensaje de que Zero ofrecía un sabor "más auténtico". En estos primeros años, las ventas crecieron lentamente y los costos de marketing fueron altos, propios de está etapa del ciclo de vida.

                </p>

              </div>

<div className="bg-white border-l-4 border-blue-600 p-4 rounded">

                <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>La etapa de crecimiento</h4>

                <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                  comenzó a notarse alrededor de 2008. Las ventas empezaron a aumentar rápidamente en Europa, Estados Unidos y América Latina. Coca-Cola amplió su distribución, incorporó nuevas presentaciones (botellas familiares, latas pequeñas, multipacks) y trabajó en campañas con artistas, deportistas y eventos juveniles. El sabor fue el principal impulsor del éxito: los consumidores percibían a Coca-Cola Zero como la alternativa sin azúcar más parecida a la clásica Coca-Cola. En está fase, el producto alcanzó gran popularidad y se convirtió en una de las bebidas de mayor crecimiento dentro del portafolio de la compañía.

                </p>

              </div>

<div className="bg-white border-l-4 border-yellow-600 p-4 rounded">

                <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Con los años, el producto entró en la etapa de madurez</h4>

                <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                  la cual se consolidó alrededor de 2016. En ese momento, el crecimiento se estabilizó porque la categoría de bebidas sin azúcar dejó de ser una novedad y surgió una fuerte competencia, especialmente de Pepsi Max y de nuevas opciones saludables como aguas saborizadas y bebidas funcionales. Para mantener la relevancia del producto, Coca-Cola implementó una estrategia clave: en 2017 relanzó el producto a nivel global bajo el nombre Coca-Cola Zero Sugar, con una formulación más parecida al sabor original y un nuevo diseño. Este cambio permitió revitalizar la marca y prolongar su permanencia en la etapa de madurez.

                </p>

              </div>

<div className="bg-white border-l-4 border-red-600 p-4 rounded">

                <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>A pesar de está éxito, la empresa reconoce que podría llegar una etapa de declive</h4>

                <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                  en el futuro, como ocurre con cualquier producto. Las tendencias hacia bebidas naturales, la preocupación sobre edulcorantes artificiales y el alejamiento de algunos consumidores jóvenes de las gaseosas podrían reducir la demanda. Para prevenir ese declive, Coca-Cola ha adoptado estrategias de extensión del ciclo de vida: nuevos sabores, ediciones especiales, reformulaciones, paquetes reutilizables y campañas enfocadas en sostenibilidad.

                </p>

              </div>

<div className="bg-green-50 border-2 border-green-300 p-4 rounded mt-4">

                <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                  En conjunto, el ciclo de vida de Coca-Cola Zero muestra cómo un producto puede mantenerse competitivo durante muchos años si se adapta a las necesidades del mercado. Aunque actualmente se encuentra en una madurez sólida, su permanencia depende de la capacidad de la empresa para innovar y responder a un consumidor que cambia constantemente.

                </p>

              </div>

            </div>

          </section>

{/* Botón de continuar */}

          {hasScrolledToBottom && (

            <motion.div 

              className="mt-8 pt-6 border-t border-gray-200"

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

            >

              <div className="flex justify-end">

                <Button

                  onClick={handleCompleteStep}

                  className="bg-gradient-to-r from-[#AA27B9] to-[#8E1FA3] hover:from-[#9d24ab] hover:to-[#7d1a93] text-white px-8 py-4 flex items-center gap-2 shadow-lg"

                >

                  Continuar a Taller

                  <ChevronRight className="w-5 h-5" />

                </Button>

              </div>

            </motion.div>

          )}

        </div>

      </div>

{/* Botón Atrás */}

      <motion.div 

        className="fixed bottom-8 left-4 md:left-8 z-40"

        initial={{ opacity: 0, x: -20 }}

        animate={{ opacity: 1, x: 0 }}

        transition={{ delay: 0.5 }}

      >

        <Button

          onClick={() => {

            sessionStorage.setItem('scrollToComencemás', 'true');

            navigate('/student/descubrimiento-oportunidades');

          }}

          className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </motion.div>

<Footer />

    </div>

  );

};

export default DescubrimientoUnidad3DesarrolloPage;


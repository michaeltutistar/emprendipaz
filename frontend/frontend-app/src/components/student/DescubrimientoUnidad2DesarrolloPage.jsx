import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const DescubrimientoUnidad2DesarrolloPage = () => {

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

const { pasoCompletado, registrarProgreso } = useProgressTracking('Descubrimiento de Oportunidades', 'Unidad 2: Fundamentación');

const handleCompleteStep = async () => {

    if (!hasScrolledToBottom) return;

    // Registrar progreso en el backend

    await registrarProgreso();

    navigate('/student/descubrimiento-oportunidades/unidad2/taller');

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

          <motion.div

            className="absolute inset-0"

            style={{ background: 'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)' }}

            animate={{

              background: [

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 30% 70%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 70% 30%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

              ],

            }}

            transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}

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

                Diamante de Porter · Fundamentación

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

              Diamante de Porter

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

              ¿Qué es el diamante de Porter?

            </h2>

            <div className="bg-purple-50 border-l-4 border-[#AA27B9] p-4 rounded">

              <p className="text-gray-700 text-sm md:text-base">

                <strong>📌 Instrucciones:</strong> Lee detenidamente el siguiente contenido sobre el diamante de Porter. 

                Desplázate hasta el final para continuar al siguiente paso.

              </p>

            </div>

          </div>

{/* Contenido del PDF */}

          <div className="space-y-6">

            <p className="text-gray-700 text-sm md:text-base leading-relaxed">

              El "diamante de Porter" es un modelo de Michael Porter que analiza la ventaja competitiva de un país, región o empresa, identificando factores que impulsan la competitividad. Se compone de cuatro elementos interconectados: condiciones de los factores (recursos como mano de obra calificada, capital y tecnología), condiciones de la demanda (mercado local), industrias de apoyo y afines (proveedores competitivos) y la estrategia, estructura y rivalidad de las empresas.

            </p>

<p className="text-gray-700 text-sm md:text-base leading-relaxed">

              El modelo se basa en cuatro atributos interrelacionados en el entorno nacional que, cuando son favorables, fomentan la innovación y la competitividad:

            </p>

<div className="space-y-4">

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">

                <h4 className="font-bold text-blue-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Condición de los factores</h4>

                <p className="text-gray-700 text-sm md:text-base">

                  Se refiere a la dotación de factores de producción de un país, como mano de obra cualificada, infraestructura (carreteras, puertos, redes de comunicación) y recursos naturales. Porter argumenta que los factores "creados" (como la educación y la infraestructura digital) son más importantes para la ventaja competitiva sostenida que los factores "heredados" (como los recursos naturales).

                </p>

              </div>

<div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">

                <h4 className="font-bold text-green-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Condición de la demanda</h4>

                <p className="text-gray-700 text-sm md:text-base">

                  Analiza la naturaleza y sofisticación de los compradores en el mercado domestico. Una demanda interna exigente y perspicaz presiona a las empresas para que innoven, mejoren la calidad y se diferencien, lo que a su vez las prepara mejor para competir en mercados internacionales.

                </p>

              </div>

<div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">

                <h4 className="font-bold text-purple-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Sectores conexos y de apoyo</h4>

                <p className="text-gray-700 text-sm md:text-base">

                  La presencia de industrias proveedoras y sectores relacionados que sean competitivos a nivel internacional puede generar sinergias y fomentar la innovación en toda la cadena de valor. La colaboración y la proximidad geográfica facilitan el flujo de información y la eficiencia.

                </p>

              </div>

<div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">

                <h4 className="font-bold text-orange-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Estrategia, estructura y rivalidad de las empresas</h4>

                <p className="text-gray-700 text-sm md:text-base">

                  Este elemento considera el contexto nacional en el que se crean, organizan y gestionan las empresas, así como el nivel de rivalidad interna. Una competencia domestica feroz y saludable impulsa a las empresas a ser más eficientes, a buscar constantemente la innovación y a desarrollar estrategias competitivas más sólidas.

                </p>

              </div>

            </div>

<div>

              <h4 className="text-lg font-semibold text-gray-800 mb-3 mt-6" style={{ fontFamily: 'var(--font-heading)' }}>Uso del Modelo</h4>

              <p className="text-gray-700 mb-2 text-sm md:text-base">El diamante de Porter es útil para distintos escenarios, por ejemplo:</p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm md:text-base ml-4 mb-4">

                <li><strong>Análisis industrial:</strong> comprender la estructura de la industria y el entorno competitivo.</li>

                <li><strong>Planificación estratégica:</strong> desarrollar estrategias competitivas más efectivas.</li>

                <li><strong>Comercio internacional:</strong> comparar la competitividad entre diferentes países y planificar estrategias de entrada a nuevos mercados.</li>

                <li><strong>Visión integral:</strong> analiza factores internos y externos (demanda, proveedores, condiciones de factores, rivalidad) de manera interconectada.</li>

                <li><strong>Adaptabilidad:</strong> puede aplicarse a distintos niveles: empresa, sector, región o país.</li>

                <li><strong>Fomento de la innovación:</strong> la presión competitiva y la demanda sofisticada obligan a las organizaciones a mejorar continuamente.</li>

                <li><strong>Identificación de ventajas competitivas sostenibles:</strong> permite descubrir qué elementos diferencian a una empresa o país en el largo plazo.</li>

                <li><strong>Apoyo en la toma de decisiones:</strong> facilita la creación de estrategias más efectivas y realistas.</li>

                <li><strong>Aplicación práctica:</strong> se puede usar en estudios de caso, diagnósticos estratégicos y planificación de expansión internacional.</li>

              </ul>

            </div>

{/* Gráfico */}

            <div className="mt-8 mb-8 flex justify-center">

              <div className="w-full max-w-5xl">

                <img 

                  src="/competitividad-ambiente-empresarial.png" 

                  alt="Competitividad y el ambiente empresarial - Diagrama del diamante de Porter" 

                  className="w-full h-auto rounded-xl shadow-lg"

                />

              </div>

            </div>

{/* CASO REAL: TOYOTA */}

            <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-600 rounded-xl p-6">

              <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>

                CASO REAL: TOYOTA Y EL DIAMANTE DE PORTER

              </h4>

<div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded mb-4">

                <h5 className="font-bold text-yellow-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Introducción</h5>

                <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                  Toyota Motor Corporation, fundada en 1937 en Japón, es uno de los fabricantes automotrices más grandes e influyentes del mundo. Su éxito internacional se ha convertido en un ejemplo de estudio para analizar cómo un país con recursos naturales limitados pudo crear una industria altamente competitiva. El Diamante de Porter permite entender las razones detrás de está ventaja competitiva sostenible.

                </p>

              </div>

<div className="space-y-4">

                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">

                  <h5 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>1. Condiciones de los Factores</h5>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-2">

                    Japón carece de recursos naturales, lo que obligó a Toyota a desarrollar procesos altamente eficientes. El país importa acero, petróleo y minerales, lo que motivó la creación del Toyota Production System, un modelo orientado a reducir desperdicios y optimizar recursos.

                  </p>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                    Con el tiempo, Japón formó una fuerza laboral altamente capacitada, disciplinada y experta en ingeniería. Este capital humano permitió la creación de sistemas como Lean Manufacturing, Just-in-time y Kaizen, que hoy son referentes en todo el mundo.

                  </p>

                </div>

<div className="bg-white border-2 border-gray-200 rounded-lg p-4">

                  <h5 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>2. Condiciones de la Demanda</h5>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-2">

                    El mercado japonés se caracteriza por consumidores exigentes que valoran:

                  </p>

                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base ml-4">

                    <li>Alta calidad</li>

                    <li>Fiabilidad</li>

                    <li>Seguridad</li>

                    <li>Eficiencia en consumo</li>

                    <li>Tamaño compacto por limitaciones de espacio</li>

                  </ul>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-2">

                    Esta presión interna impulsó a Toyota a crear productos de excelente calidad, que luego serían altamente valorados en mercados internacionales como Estados Unidos y Europa. La preferencia global por autos eficientes e híbridos fortaleció aún más su posición.

                  </p>

                </div>

<div className="bg-white border-2 border-gray-200 rounded-lg p-4">

                  <h5 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>3. Industrias Relacionadas y de Apoyo</h5>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-2">

                    Toyota cuenta con una poderosa red de proveedores conocida como keiretsu, formada por empresas líderes como Denso y Aisin. Japón también posee industrias avanzadas en:

                  </p>

                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base ml-4">

                    <li>Robótica</li>

                    <li>Ingeniería mecánica</li>

                    <li>Electrónica</li>

                    <li>Automatización</li>

                    <li>Acero y materiales de alta calidad</li>

                  </ul>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-2">

                    La proximidad entre proveedores, fábricas y puertos crea un clúster automotriz muy eficiente.

                  </p>

                </div>

<div className="bg-white border-2 border-gray-200 rounded-lg p-4">

                  <h5 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>4. Estrategia, Estructura y Rivalidad</h5>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-2">

                    Toyota adoptó una estrategia basada en:

                  </p>

                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base ml-4">

                    <li>Eficiencia</li>

                    <li>Calidad superior</li>

                    <li>Innovación continua</li>

                    <li>Reducción de costos</li>

                    <li>Producción ajustada</li>

                  </ul>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-2">

                    La cultura empresarial valora el trabajo en equipo, la disciplina y la mejora continua. Además, la fuerte competencia local con marcas como Honda, Nissan y Mazda impulsó a Toyota a ser cada vez más innovadora y eficiente.

                  </p>

                </div>

<div className="bg-white border-2 border-gray-200 rounded-lg p-4">

                  <h5 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>5. Papel del Gobierno</h5>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                    El gobierno japonés ha favorecido históricamente el desarrollo de la industria automotriz mediante regulaciones estrictas en calidad y seguridad, apoyo a la innovación tecnológica, incentivos para vehículos híbridos y eléctricos, e inversión en infraestructura avanzada. Esto fortaleció el entorno competitivo de Toyota.

                  </p>

                </div>

<div className="bg-white border-2 border-gray-200 rounded-lg p-4">

                  <h5 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>6. Sucesos Fortuitos</h5>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                    Varios eventos favorecieron el crecimiento de Toyota: la crisis del petróleo de los años 70 aumentó la demanda de autos eficientes; el auge de la conciencia ambiental impulsó los vehículos híbridos, como el Toyota Prius; y el rápido avance tecnológico japonés fortaleció la automatización y la ingeniería.

                  </p>

                </div>

<div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">

                  <h5 className="font-bold text-green-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Conclusión</h5>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                    El Diamante de Porter demuestra que el éxito de Toyota no se debe solo a su propio esfuerzo, sino a un entorno nacional altamente competitivo. Factores como la escasez de recursos, una fuerza laboral capacitada, un mercado exigente, una red de proveedores avanzada, políticas gubernamentales favorables y una intensa competencia local fueron clave. Hoy Toyota es líder global en calidad, eficiencia y tecnología híbrida, convirtiéndose en un modelo de competitividad internacional.

                  </p>

                </div>

              </div>

            </div>

          </div>

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

export default DescubrimientoUnidad2DesarrolloPage;


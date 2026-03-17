import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const LiderazgoUnidad1DesarrolloPage = () => {

  const navigate = useNavigate();

  const contentRef = useRef(null);

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

          modulo_nombre: 'Liderazgo',

          paso_nombre: 'Unidad 1: Fundamentación',

          curso_nombre: 'Liderazgo'

        })

      });

      navigate('/student/liderazgo/unidad1/taller');

    } catch (error) {

      navigate('/student/liderazgo/unidad1/taller');

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

              <button onClick={() => navigate('/student/liderazgo')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Liderazgo

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Estilos de Liderazgo

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

              Estilos de Liderazgo

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

<div ref={contentRef} className="space-y-8">

          {/* 1.2.1 Fundamentos sobre estilos de liderazgo */}

          <div className="mb-8">

            <h3 

              className="text-[#006837] mb-6"

              style={{ 

                fontFamily: 'var(--font-heading)',

                fontSize: '1.75rem',

                fontWeight: 700,

              }}

            >

              1.2.1. Fundamentos sobre estilos de liderazgo

            </h3>

<div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">¿Qué es liderazgo?</h4>

              <p className="text-gray-700 mb-4 leading-relaxed">

                El liderazgo se define como el conjunto de habilidades y características propias o desarrolladas que posee una persona, las cuales le permiten convocar, dirigir, motivar y evaluar a un equipo de trabajo para la consecución de unos objetivos planteados.

              </p>

              <p className="text-gray-700 mb-4 leading-relaxed">

                Un liderazgo competente es crucial para la supervivencia de un emprendimiento, dado que garantiza que las empresas poseen la capacidad de enfrentarse a los retos que se registran diariamente en las situaciones organizacionales. Por ejemplo: la pérdida de competitividad en el mercado, escasa conexión con los clientes, mala reputación de marca, competidores con mayores recursos, etc.

              </p>

            </div>

<div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">Evita los cuatro enemigos del liderazgo:</h4>

              <p className="text-gray-700 mb-4 leading-relaxed">

                Estos son 4 enemigos del liderazgo que debes conocer para evitar caer en ellos y que tu labor como líder se vea afectada:

              </p>

              <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed">

                <li>

                  <strong>No inspirar desde el ejemplo:</strong> no se puede liderar simplemente desde el discurso, la teoría o las buenas intenciones. Actualmente, los equipos de trabajo necesitan líderes que se pongan manos a la obra y se integren activamente en las actividades.

                </li>

                <li>

                  <strong>Exceso de poder:</strong> si el líder se distancia de sus colaboradores, aislado en su posición de poder, creando un abismo donde no existe la comunicación efectiva, se puede generar una sensación de falta de compromiso de su parte, en este punto el proyecto empieza a perder impulso, dada la desilusión del talento humano ocasionando resultados insuficientes.

                </li>

                <li>

                  <strong>Negar la realidad:</strong> no reconocer las debilidades y problemáticas que presente el proyecto y, por el contrario, intentar a toda costa convencer que el proyecto es perfecto y con un futuro prometedor, impide realizar los ajustes necesarios para lograr el éxito esperado.

                </li>

                <li>

                  <strong>No ser humilde:</strong> perder la llaneza, la humildad, adoptar una postura egocéntrica y perder el norte de que el líder depende de su equipo de trabajo. Creer que asumir el papel de ser líder es el fin del camino y no se requiere nada más.

                </li>

              </ol>

            </div>

<div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">¿Cuáles son los estilos de liderazgo?</h4>

              <p className="text-gray-700 mb-4 leading-relaxed">

                Como reflexión inicial, debemos comprender que los estilos de liderazgo que se describirán a continuación son situacionales, es decir, un líder integral será capaz de adoptar cada estilo dependiendo de la situación y el momento ideal para cada uno de ellos. Lo fundamental es identificar qué estilo o estilos utilizamos con mayor frecuencia para establecer cuáles deberíamos enriquecer e incluso dejar de ejercer porque no estamos consiguiendo los resultados deseados.

              </p>

              <p className="text-gray-700 mb-4 leading-relaxed">

                Los 5 estilos de liderazgo más comunes son:

              </p>

<div className="space-y-6">

                <div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">1) Liderazgo autoritario</h5>

                  <p className="text-gray-700">

                    Este estilo de liderazgo es uno de los menos impactantes, en vista de que es un estilo que deteriora la motivación del equipo de trabajo en poco tiempo. Es un estilo que se suele utilizar solo en situaciones críticas. Los líderes que implementan frecuentemente este perfil de liderazgo pierden el compromiso de su equipo y en la empresa sólo permanecen las personas que no tienen otra alternativa que quedarse.

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">2) Liderazgo democrático</h5>

                  <p className="text-gray-700">

                    Este tipo de líder le otorga al equipo de trabajo la posibilidad de decidir. En este sentido, el líder no posee gran relevancia y su actuación no aporta demasiado. Se recomienda este estilo para situaciones de menor importancia que puedan ser delegadas en su totalidad y en las que el líder no requiera actuar.

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">3) Liderazgo afiliativo</h5>

                  <p className="text-gray-700">

                    Este tipo de líder tiene una relación muy cercana con su equipo de trabajo dado que su filosofía es poner a las personas primero. Sin embargo, pueden perder el foco de los objetivos del negocio y los resultados esperados, lo que hace que su estilo se perciba como arriesgado.

                  </p>

                  <p className="text-gray-700 mt-2">

                    Este estilo de liderazgo debería implementarse en situaciones muy puntuales, por ejemplo, cuando el equipo a liderar es nuevo o cuando el equipo ha enfrentado una situación negativa recientemente. Por ejemplo, imagina un equipo que ha sufrido un recorte de personal. ¿Seríamos autoritarios con ellos o generaríamos de nuevo confianza a través de un buen clima laboral?

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">4) Liderazgo timonel</h5>

                  <p className="text-gray-700">

                    En este estilo el líder decide lo que hay que hacer, realiza seguimiento y corrige. Su rol, es similar al timonel de un barco, poniendo rumbo y manteniéndolo. Es un liderazgo altamente efectivo y de los más utilizados. Sin embargo, no es efectivo en el desarrollo del talento humano y en la potenciación de sus cualidades personales, por eso no logra inspirar.

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">5) Liderazgo coaching</h5>

                  <p className="text-gray-700">

                    El líder coach, es un líder que utiliza habilidades y técnicas de coaching para obtener la mejor versión de su equipo de trabajo. El líder coach sitúa al equipo en mentalidad de aprendizaje continuo para que ellos mismos se cuestionen su forma de funcionar, generando un ambiente de mejora constantemente. Sin la necesidad de realizar demasiado seguimiento, el líder-coach consigue que las personas mejoren por sus propios medios.

                  </p>

                  <p className="text-gray-700 mt-2">

                    El estilo de líder coach es importante cuando queremos que otros se desarrollen y conseguir grandes resultados a mediano y largo plazo.

                  </p>

                </div>

              </div>

            </div>

          </div>

{/* 1.2.2 Estudio de caso */}

          <div className="mb-8">

            <h3 

              className="text-[#006837] mb-6"

              style={{ 

                fontFamily: 'var(--font-heading)',

                fontSize: '1.75rem',

                fontWeight: 700,

              }}

            >

              1.2.2. Estudio de caso

            </h3>

            <p className="text-gray-700 mb-6 leading-relaxed">

              A continuación, encontrarás 5 casos que ejemplifican las características propias de cada estilo de liderazgo en su respectivo contexto de aplicación, así como sus limitaciones.

            </p>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Liderazgo Autoritario */}

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">

                <h4 className="text-lg font-bold text-gray-900 mb-3">Liderazgo autoritario</h4>

                <div className="mb-3">

                  <img 

                    src="/assets/liderazgo-autoritario.png" 

                    alt="Liderazgo Autoritario" 

                    className="w-full max-h-48 object-cover rounded-lg shadow-md"

                  />

                </div>

                <div className="space-y-2 text-sm">

                  <p><strong>Contexto:</strong> Empresa industrial en Pasto enfrenta una crisis de producción por fallas técnicas.</p>

                  <p><strong>Estilo:</strong> Carlos adopta un liderazgo autoritario, imponiendo turnos dobles, restringiendo la toma de decisiones y centralizando el control.</p>

                  <p><strong>Rasgos:</strong> Directivo, inflexible, orientado a resultados inmediatos.</p>

                  <p><strong>Aplicación:</strong> Aunque logra estabilizar la producción en el corto plazo, el equipo muestra signos de desmotivación y desgaste. Solo permanecen quienes no tienen otra opción laboral.</p>

                  <p><strong>Reflexión:</strong> Este estilo fue útil en la emergencia, pero su uso prolongado deteriora el clima laboral y el compromiso.</p>

                </div>

              </div>

{/* Liderazgo Democrático */}

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">

                <h4 className="text-lg font-bold text-gray-900 mb-3">Liderazgo democrático</h4>

                <div className="mb-3">

                  <img 

                    src="/assets/liderazgo-democratico.png" 

                    alt="Liderazgo Democrático" 

                    className="w-full max-h-48 object-cover rounded-lg shadow-md"

                  />

                </div>

                <div className="space-y-2 text-sm">

                  <p><strong>Contexto:</strong> Empresa de asesoría en gestión ambiental, desarrollando un informe técnico sencillo.</p>

                  <p><strong>Estilo:</strong> Sandra delega completamente la elaboración del informe al equipo, promoviendo decisiones colectivas sin intervenir.</p>

                  <p><strong>Rasgos:</strong> Muy participativo, poca directiva.</p>

                  <p><strong>Aplicación:</strong> El equipo se siente autónomo, pero ante la falta de orientación, el resultado es disperso y poco articulado. El liderazgo se percibe como ausente.</p>

                  <p><strong>Reflexión:</strong> Útil en tareas menores, pero insuficiente cuando se requiere dirección o visión.</p>

                </div>

              </div>

{/* Liderazgo Afiliativo */}

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">

                <h4 className="text-lg font-bold text-gray-900 mb-3">Liderazgo afiliativo</h4>

                <div className="mb-3">

                  <img 

                    src="/assets/liderazgo-afiliativo.png" 

                    alt="Liderazgo Afiliativo" 

                    className="w-full max-h-48 object-cover rounded-lg shadow-md"

                  />

                </div>

                <div className="space-y-2 text-sm">

                  <p><strong>Contexto:</strong> ONG que acaba de atravesar un recorte de personal por falta de financiación.</p>

                  <p><strong>Estilo:</strong> Manuel prioriza el bienestar emocional del equipo, organiza espacios de escucha, flexibiliza horarios y evita presiones.</p>

                  <p><strong>Rasgos:</strong> Empático, cercano, protector.</p>

                  <p><strong>Aplicación:</strong> El equipo recupera la confianza y el sentido de pertenencia, pero los indicadores de impacto social se estancan por falta de autoridad.</p>

                  <p><strong>Reflexión:</strong> Ideal para reconstruir vínculos tras una crisis, pero requiere complementar con dirección clara para evitar desvíos.</p>

                </div>

              </div>

{/* Liderazgo Timonel */}

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">

                <h4 className="text-lg font-bold text-gray-900 mb-3">Liderazgo timonel</h4>

                <div className="mb-3">

                  <img 

                    src="/assets/liderazgo-timonel.png" 

                    alt="Liderazgo Timonel" 

                    className="w-full max-h-48 object-cover rounded-lg shadow-md"

                  />

                </div>

                <div className="space-y-2 text-sm">

                  <p><strong>Contexto:</strong> Empresa de diseño gráfico con múltiples proyectos simultáneos y plazos ajustados.</p>

                  <p><strong>Estilo:</strong> Sara establece objetivos precisos, asigna tareas, realiza seguimiento constante y corrige desviaciones.</p>

                  <p><strong>Rasgos:</strong> Directivo, estructurado, orientado a resultados.</p>

                  <p><strong>Aplicación:</strong> La agencia cumple con las entregables y mantiene eficiencia operativa, pero los diseñadores sienten que sus ideas no son valoradas ni desarrolladas.</p>

                  <p><strong>Reflexión:</strong> Muy efectivo en ejecución, pero limitado en desarrollo del talento y generación de inspiración.</p>

                </div>

              </div>

{/* Liderazgo Coaching */}

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 md:col-span-2 shadow-sm">

                <h4 className="text-lg font-bold text-gray-900 mb-3">Liderazgo coaching</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="mb-3 md:mb-0">

                    <img 

                      src="/assets/liderazgo-coaching.png" 

                      alt="Liderazgo Coaching" 

                      className="w-full max-h-48 object-cover rounded-lg shadow-md"

                    />

                  </div>

                  <div className="space-y-2 text-sm">

                    <p><strong>Contexto:</strong> Promueve educación que busca impulsar auto-mejora mediante la orientación continua.</p>

                    <p><strong>Estilo:</strong> Guía, acompaña y empodera.</p>

                    <p><strong>Aplicación:</strong> Ideal para aquellos equipos donde se requiere desarrollar competencias en los colaboradores con la finalidad de elevar su rendimiento a largo plazo.</p>

                    <p><strong>Reflexión:</strong> Esta metodología de liderazgo se convierte en molesta sobre todo cuando los colaboradores desean decidir por su cuenta. Es fundamental tener cuidado al dosificar.</p>

                  </div>

                </div>

              </div>

            </div>

          </div>

{/* Progress indicator */}

          {hasScrolledToBottom && (

            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">

              <p className="text-green-800 font-semibold text-center">

                ✓ Has leído todo el contenido. Puedes continuar al siguiente paso.

              </p>

            </div>

          )}

{!hasScrolledToBottom && (

            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-6">

              <p className="text-yellow-800 text-center">

                ⬇️ Desplázate hacia abajo para leer todo el contenido antes de continuar.

              </p>

            </div>

          )}

<div className="flex justify-end mt-8">

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

          </div>

        </div>

      </div>

<Footer />

    </div>

  );

};

export default LiderazgoUnidad1DesarrolloPage;


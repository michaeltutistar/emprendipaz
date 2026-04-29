import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const LiderazgoUnidad3DesarrolloPage = () => {

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

    let ticking = false;

    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          setIsScrolled(window.scrollY > 100);

          const windowHeight = window.innerHeight;

          const documentHeight = document.documentElement.scrollHeight;

          const scrollTop = window.scrollY;

          const progress = (scrollTop / (documentHeight - windowHeight)) * 100;

          setScrollProgress(Math.min(100, progress));

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

          paso_nombre: 'Unidad 3: Fundamentación',

          curso_nombre: 'Liderazgo'

        })

      });

      navigate('/student/liderazgo/unidad3/taller');

    } catch (error) {

      navigate('/student/liderazgo/unidad3/taller');

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

                      Unidad 3

                    </p>

                  </div>

                </motion.div>

              )}

{/* Menú de usuario - Derecha */}

              <div className="flex justify-end">

                <div className="relative">

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

                    <div className="absolute right-full mr-2 top-0 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] border">

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

              Toma de Decisiones

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

              Toma de Decisiones

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

              animate={{ width: `${scrollProgress > 0 ? Math.min(scrollProgress / 3, 33.33) : 0}%` }}

              transition={{ duration: 0.3 }}

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

              <strong>📌 Instrucciones:</strong> Lee detenidamente el siguiente contenido sobre toma de decisiones. Desplázate hasta el final para continuar al siguiente paso.

            </p>

          </div>

        </div>

<div className="space-y-8">

          {/* 3.2.1 Fundamentos sobre toma de decisiones */}

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

            <h3

              className="text-[#006837] mb-6"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '1.75rem',

                fontWeight: 700,

              }}

            >

              3.2.1. Fundamentos sobre toma de decisiones

            </h3>

<div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">Premisas para la toma de decisiones</h4>

              <p className="text-gray-700 mb-4 leading-relaxed">

                Para un líder el saber tomar decisiones no es solo elegir entre un conjunto de opciones, sino construir confianza, movilizar al equipo de trabajo y transformar la visión en acción. Un líder que decide adecuadamente no solo resuelve problemas, además crea futuro.

              </p>

              <p className="text-gray-700 mb-4 leading-relaxed">

                En este sentido, un líder debe tomar en consideración los siguientes puntos al momento de tomar decisiones:

              </p>

<div className="space-y-4">

                <div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">a) Ofrece reconocimiento</h5>

                  <p className="text-gray-700">

                    Agradece y reconoce las acciones acertadas de los miembros del equipo de trabajo que conforman tu emprendimiento.

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">b) El lado humano de tus colaboradores</h5>

                  <p className="text-gray-700">

                    No pierdas de vista que cada colaborador posee un lado humano que aspira a ser feliz y tener satisfacciones. Impulsa su anhelo.

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">c) Lo mínimo es la igualdad</h5>

                  <p className="text-gray-700">

                    No promuevas desigualdades en el entorno laboral de tu emprendimiento sin justificación.

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">d) Necesidad de seguridad</h5>

                  <p className="text-gray-700">

                    Garantiza la seguridad del trabajador en aspectos básicos como el salario y la protección de sus derechos fundamentales.

                  </p>

                </div>

<div className="bg-gray-50 border-l-4 border-[#006837] p-4 rounded">

                  <h5 className="font-semibold text-gray-900 mb-2">e) El líder siempre está en la mira</h5>

                  <p className="text-gray-700">

                    Como líder siempre serás más observado que el resto de los colaboradores. Por lo tanto, es importante que te conviertas en un ejemplo para los demás.

                  </p>

                </div>

              </div>

            </div>

<div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">Decisiones que retan al líder</h4>

              <p className="text-gray-700 mb-4 leading-relaxed">

                No es un secreto que a veces el líder debe asumir la responsabilidad de tomar decisiones difíciles que pueden incluso llegar a desafiar su carácter. Pero el hecho de poder tomar las siguientes decisiones puede ser la diferencia entre el éxito y el fracaso de su gestión:

              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded space-y-2">

                <p className="text-gray-700">• Si un proyecto se desvía del camino previsto, hay que saber anticiparlo y tomar decisiones.</p>

                <p className="text-gray-700">• Si un colaborador no está comprometido aun cuando se le han brindado los recursos y la formación necesaria, hay que prescindir de él.</p>

                <p className="text-gray-700">• Si un proveedor incumple el contrato, deberá cambiarse.</p>

                <p className="text-gray-700">• Si un proyecto tiene aspectos críticos, se convierte en prioridad total.</p>

              </div>

            </div>

<div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">Mi ruta para decidir</h4>

              <p className="text-gray-700 mb-4 leading-relaxed">

                Puedes aplicar la siguiente ruta para tomar una decisión en tu emprendimiento, y que no sea del todo clara:

              </p>

<div className="overflow-x-auto">

                <table className="w-full border-collapse border-2 border-gray-300 mb-6">

                  <thead>

                    <tr className="bg-gray-900 text-white">

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Paso</th>

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Orientación</th>

                    </tr>

                  </thead>

                  <tbody className="bg-white">

                    <tr>

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">1. Detectar el problema</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Qué está pasando que necesita solución?</td>

                    </tr>

                    <tr className="bg-gray-50">

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">2. Pensar opciones</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Qué cosas puedo hacer para resolverlo?</td>

                    </tr>

                    <tr>

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">3. Comparar y elegir</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Cuál opción es mejor para todos?</td>

                    </tr>

                    <tr className="bg-gray-50">

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">4. Actuar y revisar</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Funcionó lo que decidí? ¿Qué aprendí?</td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>

{/* 3.2.2 Estudio de casos */}

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

            <h3

              className="text-[#006837] mb-6"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '1.75rem',

                fontWeight: 700,

              }}

            >

              3.2.2. Estudio de casos

            </h3>

            <p className="text-gray-700 mb-6 leading-relaxed">

              A continuación, vamos a analizar los siguientes ejemplos donde se aplica la ruta para tomar decisiones:

            </p>

{/* Caso 1: Aroma Artesanal de Nariño */}

            <div className="mb-8">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">a) Aroma Artesanal de Nariño</h4>

              <p className="text-gray-700 mb-4">

                El emprendimiento de café artesanal "Aroma Artesanal de Nariño", ha detectado un problema y ha obtenido el siguiente resultado aplicando la ruta para decidir:

              </p>

<div className="overflow-x-auto">

                <table className="w-full border-collapse border-2 border-gray-300 mb-6">

                  <thead>

                    <tr className="bg-gray-900 text-white">

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Paso</th>

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Orientación</th>

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Resultado</th>

                    </tr>

                  </thead>

                  <tbody className="bg-white">

                    <tr>

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">1. Detectar el problema</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Qué está pasando que necesita solución?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        En Aroma Artesanal de Nariño, las ventas han bajado sustancialmente en los últimes 30 días, pese a mantener los mismos productos y precios.

                      </td>

                    </tr>

                    <tr className="bg-gray-50">

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">2. Pensar opciones</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Qué cosas puedo hacer para resolverlo?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        • Hacer una promoción con descuentos por tiempo limitado.<br />

                        • Cambiar la vitrina y presentación del local.<br />

                        • Publicar los productos en redes sociales con fotos atractivas.

                      </td>

                    </tr>

                    <tr>

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">3. Comparar y elegir</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Cuál opción es mejor para todos?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        Debido a que no se cuenta con mucho presupuesto, la gerencia ha elegido la opción de publicar los productos en redes sociales con fotos atractivas, siendo esta opción no solo de bajo costo, sino además de fácil y rápida implementación, permitiendo llegar a más personas sin modificar el producto ni el precio.

                      </td>

                    </tr>

                    <tr className="bg-gray-50">

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">4. Actuar y revisar</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Funcionó lo que decidí? ¿Qué aprendí?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        Sí, en la primera semana aumentaron las consultas y ventas por WhatsApp. La lección es que la visibilidad digital es un gran aliado. A veces no es el producto lo que falla, sino que los clientes no lo están viendo.

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

{/* Caso 2: Esencia Viva */}

            <div className="mb-8">

              <h4 className="text-lg font-semibold text-gray-800 mb-3">b) Esencia Viva</h4>

              <p className="text-gray-700 mb-4">

                El emprendimiento de productos naturistas "Esencia Viva", ha detectado un problema y ha obtenido el siguiente resultado aplicando la ruta para decidir:

              </p>

<div className="overflow-x-auto">

                <table className="w-full border-collapse border-2 border-gray-300 mb-6">

                  <thead>

                    <tr className="bg-gray-900 text-white">

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Paso</th>

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Orientación</th>

                      <th className="border-2 border-gray-300 px-4 py-3 text-left text-sm font-semibold">Resultado</th>

                    </tr>

                  </thead>

                  <tbody className="bg-white">

                    <tr>

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">1. Detectar el problema</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Qué está pasando que necesita solución?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        En "Esencia Viva", los clientes han comenzado a quejarse por demoras en los envíos, lo que está afectando la reputación de su tienda online.

                      </td>

                    </tr>

                    <tr className="bg-gray-50">

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">2. Pensar opciones</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Qué cosas puedo hacer para resolverlo?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        • Cambiar de empresa transportadora.<br />

                        • Ofrecer envíos gratuitos para compensar.<br />

                        • Implementar seguimiento en tiempo real.<br />

                        • Llamar personalmente a los clientes afectados para disculparse.

                      </td>

                    </tr>

                    <tr>

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">3. Comparar y elegir</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Cuál opción es mejor para todos?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        Para no cambiar la logística y apaciguar la molestia que manifiestan los clientes, se eligió la opción de ofrecer envíos gratuitos como medida de compensación.

                      </td>

                    </tr>

                    <tr className="bg-gray-50">

                      <td className="border-2 border-gray-300 px-4 py-3 font-semibold text-gray-900">4. Actuar y revisar</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">¿Funcionó lo que decidí? ¿Qué aprendí?</td>

                      <td className="border-2 border-gray-300 px-4 py-3 text-gray-700">

                        No funcionó. Aunque algunos clientes aceptaron el envío gratuito, las quejas no solo continuaron; sino que además se volvieron cada vez más frecuentes porque el problema principal era la demora, no el costo. La lección aprendida es que no basta con compensar superficialmente; hay que resolver la raíz del problema. Por lo tanto, se decide cambiar de empresa transportadora que ofrezca un sistema de seguimiento de pedidos para mejorar la experiencia del cliente y otorgarle tranquilidad.

                      </td>

                    </tr>

                  </tbody>

                </table>

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

{/* Navigation button */}

          <div className="flex justify-end">

            <Button

              onClick={handleCompleteStep}

              disabled={!hasScrolledToBottom}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

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

export default LiderazgoUnidad3DesarrolloPage;


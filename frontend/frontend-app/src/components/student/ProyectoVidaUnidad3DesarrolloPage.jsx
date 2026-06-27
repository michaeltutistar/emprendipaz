import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, BookOpen, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const ProyectoVidaUnidad3DesarrolloPage = () => {

  const navigate = useNavigate();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

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

          modulo_nombre: 'Proyecto de vida',

          paso_nombre: 'Unidad 3: Fundamentación',

          curso_nombre: 'Proyecto de vida'

        })

      });

      localStorage.setItem('pv_unidad3_desarrollo_completado', 'true');

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad3/taller');

    } catch (error) {

      localStorage.setItem('pv_unidad3_desarrollo_completado', 'true');

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad3/taller');

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

                      Proyecto de vida

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

            <button onClick={() => navigate('/student/proyecto-vida')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Proyecto de vida

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Plan de acción del proyecto de vida

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

              MÓDULO: Proyecto de vida

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

              Plan de acción del proyecto de vida

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

        <div className="flex-1">

          <div ref={contentRef} className="px-8 py-4 space-y-10 text-gray-700">

            <section className="space-y-6">

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

                  Fundamentos sobre plan de acción del proyecto de vida

                </h2>

                <div className="w-16 h-1 bg-[#006837]"></div>

              </div>

<div className="space-y-6">

                <div>

                  <h3

                    className="text-[#006837] mb-4"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontSize: '1.5rem',

                      fontWeight: 600,

                    }}

                  >

                    Elementos del plan de acción del proyecto de vida

                  </h3>

                  <p className="text-gray-700 leading-relaxed text-base mb-4">

                    El plan de acción del proyecto de vida consiste en organizar metas y acciones de manera coherente, asignando recursos y tiempos específicos. Este proceso permite anticipar dificultades, priorizar actividades y mantener la coherencia entre lo que se quiere y lo que se hace.

                  </p>

                  <p className="text-gray-700 leading-relaxed text-base mb-4">

                    Un plan de acción del proyecto de vida debe incluir:

                  </p>

                  <ul className="list-disc list-inside space-y-2 text-gray-700 text-base mb-6">

                    <li><strong>Metas claras:</strong> definidas en corto, mediano y largo plazo.</li>

                    <li><strong>Acciones específicas:</strong> tareas concretas que acercan a la meta.</li>

                    <li><strong>Recursos:</strong> materiales financieros, humanos o tecnológicos necesarios.</li>

                    <li><strong>Tiempos:</strong> cronogramas que muestran el avance.</li>

                    <li><strong>Evaluación:</strong> mecanismos para medir resultados y ajustar lo necesario.</li>

                  </ul>

                  <p className="text-gray-700 leading-relaxed text-base mb-6">

                    A través de la siguiente tabla vamos a evidenciar mejor cada elemento del plan de acción del proyecto de vida, su importancia y ejemplos puntuales:

                  </p>

                  <div className="overflow-x-auto">

                    <table className="min-w-full border border-gray-200 rounded-xl text-sm">

                      <thead className="bg-gray-900 text-white">

                        <tr>

                          <th className="px-4 py-3 text-left">Elemento del plan de acción</th>

                          <th className="px-4 py-3 text-left">Su importancia</th>

                          <th className="px-4 py-3 text-left">Ejemplos</th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-200">

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Metas claras</td>

                          <td className="px-4 py-3">Definen la dirección</td>

                          <td className="px-4 py-3">Abrir una tienda de productos orgánicos en 1 año</td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Acciones específicas</td>

                          <td className="px-4 py-3">Representan los pasos hacia la meta</td>

                          <td className="px-4 py-3">

                            • Ahorrar $500.000 mensuales<br />

                            • Capacitarse en formulación de proyectos

                          </td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Recursos</td>

                          <td className="px-4 py-3">Garantizan la viabilidad del plan</td>

                          <td className="px-4 py-3">

                            • $6.000.000<br />

                            • 4 colaboradores<br />

                            • 3 proveedores

                          </td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Tiempos</td>

                          <td className="px-4 py-3">Organizan los avances evitando la improvisación</td>

                          <td className="px-4 py-3">

                            • Cronograma de ahorro<br />

                            • Cronograma de capacitación requerida

                          </td>

                        </tr>

                        <tr>

                          <td className="px-4 py-3 font-semibold text-gray-900">Evaluación</td>

                          <td className="px-4 py-3">Permite medir y ajustar</td>

                          <td className="px-4 py-3">Revisar avances cada 2 meses</td>

                        </tr>

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            </section>

<section className="space-y-6">

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

                  Estudio de caso

                </h2>

                <div className="w-16 h-1 bg-gray-900"></div>

              </div>

<div className="space-y-6">

                <h3

                  className="text-[#006837] text-xl"

                  style={{

                    fontFamily: 'var(--font-heading)',

                    fontWeight: 700,

                  }}

                >

                  Estudio de caso: el plan de acción de Mariana

                </h3>

<p className="text-gray-700 leading-relaxed text-base">

                  Vamos a analizar el siguiente caso empresarial donde se evidencia la aplicación de un plan de acción de proyecto de vida:

                </p>

<div className="bg-gray-50 border-l-4 border-[#006837] rounded-lg p-6">

                  <h4

                    className="text-gray-900 font-semibold mb-4"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontSize: '1.125rem',

                    }}

                  >

                    Contexto:

                  </h4>

                  <p className="text-gray-700 leading-relaxed text-base mb-6">

                    Mariana es estudiante de ingeniería en Pasto y sueña con crear una empresa de soluciones tecnológicas que apoye a pequeños negocios locales en su transformación digital.

                  </p>

                  <p className="text-gray-700 leading-relaxed text-base">

                    Para tal propósito, diseña un plan de acción con sus respectivos pasos para su proyecto, obteniendo los siguientes resultados:

                  </p>

                </div>

<div className="space-y-4">

                  <div>

                    <h4 className="text-gray-900 font-semibold mb-2 text-base">1. Metas claras</h4>

                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                      <li><strong>Corto plazo:</strong> culminar sus estudios universitarios con buen promedio.</li>

                      <li><strong>Mediano plazo:</strong> realizar prácticas en una empresa de software de Nariño para adquirir experiencia.</li>

                      <li><strong>Largo plazo:</strong> fundar su propia empresa de desarrollo de aplicaciones para comercios locales.</li>

                    </ul>

                  </div>

<div>

                    <h4 className="text-gray-900 font-semibold mb-2 text-base">2. Acciones específicas</h4>

                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                      <li>Inscribirse en cursos de programación avanzada y marketing digital.</li>

                      <li>Participar en ferias de emprendimiento en Pasto para conocer aliados estratégicos.</li>

                      <li>Desarrollar un prototipo de aplicación para gestión de inventarios en tiendas locales.</li>

                    </ul>

                  </div>

<div>

                    <h4 className="text-gray-900 font-semibold mb-2 text-base">3. Recursos</h4>

                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                      <li><strong>Materiales:</strong> computador portátil, acceso a internet y software de programación.</li>

                      <li><strong>Financieros:</strong> ahorro personal y apoyo de un fondo universitario de emprendimiento.</li>

                      <li><strong>Humanos:</strong> colaboración de compañeros con habilidades en diseño gráfico y comunicación.</li>

                    </ul>

                  </div>

<div>

                    <h4 className="text-gray-900 font-semibold mb-2 text-base">4. Tiempos</h4>

                    <p className="text-gray-700 leading-relaxed text-base mb-2"><strong>Cronograma:</strong></p>

                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                      <li>6 meses para terminar cursos complementarios.</li>

                      <li>1 año para realizar prácticas y validar el prototipo.</li>

                      <li>2 años para consolidar la empresa y buscar clientes en municipios de Nariño.</li>

                    </ul>

                  </div>

<div>

                    <h4 className="text-gray-900 font-semibold mb-2 text-base">5. Evaluación</h4>

                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">

                      <li>Revisar cada semestre el cumplimiento de metas académicas.</li>

                      <li>Medir la aceptación del prototipo mediante encuestas a comerciantes locales.</li>

                      <li>Ajustar la estrategia de marketing si no se alcanzan los objetivos de captación de clientes.</li>

                    </ul>

                  </div>

                </div>

<div className="bg-[#006837]/10 border-l-4 border-[#006837] rounded-lg p-6 mt-6">

                  <h4

                    className="text-[#006837] font-semibold mb-3"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontSize: '1.125rem',

                    }}

                  >

                    Conclusión del caso:

                  </h4>

                  <p className="text-gray-700 leading-relaxed text-base">

                    El proyecto de vida de Mariana demuestra que cuando las metas se convierten en acciones concretas, respaldadas por recursos, tiempos definidos y una evaluación constante, los sueños dejan de ser ideales lejanos y se transforman en logros alcanzables con impacto real en la comunidad.

                  </p>

                </div>

              </div>

{/* Spacer para mejor scroll */}

              <div className="h-20"></div>

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

            navigate('/student/proyecto-vida/unidad3/inicio');

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

export default ProyectoVidaUnidad3DesarrolloPage;


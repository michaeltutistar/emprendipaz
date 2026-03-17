import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const ModeloNegociosUnidad2DesarrolloPage = () => {

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

          paso_nombre: 'Unidad 2: Fundamentación',

          curso_nombre: 'Modelo de Negocios'

        })

      });

      navigate('/student/modelo-negocios/unidad2/taller');

    } catch (error) {

      navigate('/student/modelo-negocios/unidad2/taller');

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

                      Unidad 2

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

                Modulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/modelo-negocios')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Modelo de Negocios

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Propuesta de Valor · Fundamentación

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

              Propuesta de Valor

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

              UNIDAD 2: PROPUESTA DE VALOR

            </h2>

          </section>

{/* Fundamentos propuesta de valor */}

          <section>

            <h3 

              className="text-xl md:text-2xl font-bold text-neutral-900 mb-4"

              style={{ fontFamily: 'var(--font-heading)' }}

            >

              Fundamentos propuesta de valor

            </h3>

          </section>

{/* ¿Qué es una propuesta de valor? */}

          <section>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3">¿Qué es una propuesta de valor?</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              La propuesta de valor es el núcleo de cualquier modelo de negocios y constituye la razón de ser de una empresa frente a sus clientes. Se entiende como la promesa diferenciadora que una organización formula para explicar por qué su producto o servicio merece ser elegido en lugar de las alternativas disponibles en el mercado. No se limita a describir las características técnicas de lo que se ofrece, sino que articula de manera integral el beneficio funcional, emocional y simbólico que el cliente recibe.

            </p>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              En otras palabras, la propuesta de valor es el puente entre las capacidades internas de la empresa y las expectativas externas del mercado: define cómo se resuelve un problema, qué ventajas se entregan y qué elementos hacen que la experiencia de consumo sea única.

            </p>

          </section>

{/* Elementos de una propuesta de valor */}

          <section>

            <h3 className="text-xl font-semibold text-neutral-800 mb-3">Elementos de una propuesta de valor</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Para identificar la propuesta de valor de tu producto deberías considerar los siguientes elementos:

            </p>

<div className="space-y-4 mb-6">

              {/* Diferenciación frente a la competencia */}

              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-lg">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Diferenciación frente a la competencia:</h4>

                <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed">

                  Una propuesta de valor sólida debe responder: ¿qué hace único mi producto?

                </p>

                <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm md:text-base ml-4">

                  <li><strong>Innovación y originalidad:</strong> introducir características nuevas que no existen en el mercado.</li>

                  <li><strong>Precio accesible:</strong> ofrecer una alternativa competitiva sin sacrificar calidad.</li>

                  <li><strong>Durabilidad y calidad superior:</strong> garantizar que el producto resista el tiempo y supere expectativas.</li>

                </ul>

              </div>

{/* Necesidad o problema que resuelve */}

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Necesidad o problema que resuelve:</h4>

                <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed">

                  La propuesta de valor debe conectar con una necesidad real del cliente:

                </p>

                <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm md:text-base ml-4">

                  <li><strong>Ahorro de tiempo o esfuerzo:</strong> simplificar procesos o tareas.</li>

                  <li><strong>Mejora de la experiencia o comodidad:</strong> elevar la satisfacción en el uso.</li>

                  <li><strong>Reducción de costos o gastos:</strong> ofrecer eficiencia económica.</li>

                </ul>

              </div>

{/* Generadores de confianza */}

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Generadores de confianza:</h4>

                <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed">

                  La confianza es un factor decisivo en la elección del cliente:

                </p>

                <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm md:text-base ml-4">

                  <li><strong>Calidad comprobada:</strong> certificaciones, pruebas o estándares reconocidos.</li>

                  <li><strong>Recomendación de otros clientes:</strong> testimonios y reseñas.</li>

                  <li><strong>Garantía o respaldo:</strong> políticas claras de devolución o servicio postventa.</li>

                </ul>

              </div>

{/* Valor emocional */}

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Valor emocional:</h4>

                <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed">

                  Más allá de lo funcional, la propuesta de valor debe conectar emocionalmente:

                </p>

                <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm md:text-base ml-4">

                  <li><strong>Orgullo de consumir algo único/local:</strong> identidad cultural y autenticidad.</li>

                  <li><strong>Seguridad y tranquilidad:</strong> confianza en el uso.</li>

                  <li><strong>Alegría y satisfacción personal:</strong> experiencias positivas que generan fidelidad.</li>

                </ul>

              </div>

{/* Atractivo en el mercado */}

              <div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded-lg">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Atractivo en el mercado:</h4>

                <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed">

                  La propuesta de valor también debe ser competitiva en términos de percepción:

                </p>

                <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm md:text-base ml-4">

                  <li><strong>Diseño innovador o estético:</strong> atractivo visual y diferenciación.</li>

                  <li><strong>Funcionalidad práctica:</strong> utilidad inmediata y facilidad de uso.</li>

                  <li><strong>Relación costo-beneficio:</strong> equilibrio entre precio y calidad.</li>

                </ul>

              </div>

{/* Compromisos adicionales */}

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Compromisos adicionales:</h4>

                <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed">

                  Finalmente, una propuesta de valor se fortalece con compromisos que reflejan responsabilidad y cercanía:

                </p>

                <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm md:text-base ml-4">

                  <li>Sostenibilidad y cuidado ambiental.</li>

                  <li>Atención personalizada al cliente.</li>

                  <li>Rapidez en la entrega o disponibilidad.</li>

                </ul>

              </div>

            </div>

<p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Una propuesta de valor efectiva integra diferenciación, resolución de necesidades, confianza, valor emocional, atractivo competitivo y compromisos adicionales. Es el puente entre lo que la empresa ofrece y lo que el cliente realmente valora.

            </p>

          </section>

{/* Estudio de caso */}

          <section className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-600 p-6 rounded-lg">

            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Estudio de caso: Artesanías Icónicas del Galeras – "Valor local con impacto global"</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Un emprendimiento de artesanías en Pasto enfrentaba dificultades para competir con productos industrializados más baratos. Tras redefinir los elementos de su propuesta de valor, logró posicionarse en el mercado de la siguiente manera:

            </p>

<div className="bg-white border-2 border-orange-300 rounded-lg p-4 mb-4 space-y-3">

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>Segmento de clientes:</strong> turistas nacionales e internacionales que buscan autenticidad.

              </p>

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>Propuesta de valor:</strong> "Artesanías elaboradas por comunidades indígenas de Nariño, con diseños únicos, materiales sostenibles y certificación de comercio justo."

              </p>

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>Diferenciación:</strong> autenticidad cultural, sostenibilidad y respaldo comunitario.

              </p>

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>Valor emocional:</strong> orgullo de consumir productos locales y conexión con la cultura.

              </p>

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>Compromiso adicional:</strong> parte de las ganancias se reinvierte en proyectos comunitarios.

              </p>

            </div>

<div className="mb-4">

              <h4 className="text-lg font-semibold text-neutral-800 mb-3">Resultados obtenidos:</h4>

              <p className="text-neutral-700 mb-3 text-sm md:text-base leading-relaxed">

                La redefinición de la propuesta de valor generó beneficios tangibles e intangibles:

              </p>

              <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm md:text-base ml-4">

                <li><strong>Incremento en ventas:</strong> el negocio logró acceder a ferias internacionales y duplicar sus ingresos en un año.</li>

                <li><strong>Reconocimiento cultural:</strong> los clientes expresaron orgullo y satisfacción al adquirir productos que preservan tradiciones locales.</li>

                <li><strong>Fidelización:</strong> muchos turistas repitieron compras en línea, convirtiéndose en embajadores de la marca en sus países.</li>

                <li><strong>Impacto social:</strong> las comunidades artesanas recibieron mayores ingresos y fortalecieron su identidad cultural.</li>

                <li><strong>Sostenibilidad:</strong> el uso de materiales locales y prácticas responsables mejoró la percepción de la marca y atrajo clientes conscientes.</li>

              </ul>

            </div>

<div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">

              <h4 className="text-lg font-semibold text-neutral-800 mb-2">Reflexión:</h4>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                Este caso demuestra que una propuesta de valor bien definida no solo mejora la competitividad, sino que también genera confianza, orgullo y sostenibilidad. El beneficio trasciende lo económico: se convierte en un motor de identidad y desarrollo comunitario.

              </p>

            </div>

          </section>

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

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/modelo-negocios/unidad2/inicio');

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

export default ModeloNegociosUnidad2DesarrolloPage;


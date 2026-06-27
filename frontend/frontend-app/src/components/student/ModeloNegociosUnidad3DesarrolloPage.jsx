import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const ModeloNegociosUnidad3DesarrolloPage = () => {

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

          paso_nombre: 'Unidad 3: Fundamentación',

          curso_nombre: 'Modelo de Negocios'

        })

      });

      navigate('/student/modelo-negocios/unidad3/taller');

    } catch (error) {

      navigate('/student/modelo-negocios/unidad3/taller');

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

              Módulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button onClick={() => navigate('/student/modelo-negocios')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Modelo de Negocios

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Ingresos y Costos · Fundamentación

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

              Ingresos y Costos

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

              UNIDAD 3: INGRESOS Y COSTOS

            </h2>

          </section>

{/* Fundamentos sobre Ingresos y Costos */}

          <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Fundamentos sobre Ingresos y Costos</h3>

            <div className="mb-4">

              <h4 className="text-lg font-semibold text-neutral-800 mb-2">Reflexión inicial</h4>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                La sostenibilidad de un modelo de negocio depende de su capacidad para generar ingresos suficientes y administrar los costos de manera eficiente. El bloque de estructura de ingresos y costos en el Business Model Canvas permite evaluar la viabilidad económica de una propuesta de valor y garantizar que las decisiones estratégicas se traduzcan en resultados financieros positivos.

              </p>

            </div>

          </section>

{/* Fuentes de ingresos */}

          <section className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Fuentes de ingresos</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Los ingresos representan el dinero que una empresa recibe de sus clientes por la venta de productos o servicios. Pueden provenir de:

            </p>

<div className="overflow-x-auto">

              <table className="w-full border-collapse bg-white border-2 border-neutral-300 rounded-lg">

                <thead>

                  <tr className="bg-green-600 text-white">

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Fuente de ingreso</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Definición</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Ejemplo</th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Venta directa</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Intercambio de bienes o servicios por dinero en una transacción puntual.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Una tienda de ropa vende camisetas directamente al consumidor en su local.</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Suscripciones</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Pagos periódicos que garantizan acceso continuo a un producto o servicio.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Una plataforma de cursos cobra una mensualidad por acceso ilimitado a contenidos educativos.</td>

                  </tr>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Licencias</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Cobro por permitir el uso de propiedad intelectual o tecnología.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Un software de diseño gráfico cobra a empresas por licencias anuales de uso.</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Publicidad</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Ingresos obtenidos por la exposición de marcas en medios o plataformas.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Un blog local recibe pagos de empresas por colocar anuncios en su página web.</td>

                  </tr>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Comisiones</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Porcentaje recibido por intermediar en una transacción entre terceros.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Una aplicación de delivery cobra comisión a los restaurantes por cada pedido gestionado.</td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>

{/* Tipos de precios */}

          <section className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg mb-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Tipos de precios</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              La estrategia de precios es clave para atraer clientes y mantener márgenes. Puedes utilizar las siguientes estrategias de precios:

            </p>

<div className="overflow-x-auto">

              <table className="w-full border-collapse bg-white border-2 border-neutral-300 rounded-lg">

                <thead>

                  <tr className="bg-orange-600 text-white">

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Tipo de precio</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Definición</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Ejemplo</th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Basados en costos</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Se calculan sumando los costos de producción más un margen de ganancia.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Una panadería calcula que producir una torta cuesta $20.000; añade un margen de $10.000 y la vende a $30.000.</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Basados en valor</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Se fijan según la percepción del cliente sobre el beneficio recibido.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Un café orgánico certificado se vende a un precio superior porque el cliente valora su origen sostenible y el impacto social.</td>

                  </tr>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Dinámicos</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Varían según la demanda, la temporada o la competencia.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Un hotel en Pasto ajusta sus tarifas: más altas en temporada de Carnaval de Negros y Blancos, más bajas en temporada baja.</td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>

{/* Estructura de costos */}

          <section className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg mb-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Estructura de costos</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Los costos reflejan los recursos que la empresa debe invertir para operar. Se clasifican en:

            </p>

<div className="overflow-x-auto">

              <table className="w-full border-collapse bg-white border-2 border-neutral-300 rounded-lg">

                <thead>

                  <tr className="bg-purple-600 text-white">

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Tipo de costo</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Definición</th>

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Ejemplos</th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Fijos</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">No dependen del volumen de producción; se mantienen constantes.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">

                      <ul className="list-disc list-inside space-y-1">

                        <li>El arriendo mensual de la planta de producción.</li>

                        <li>El salario del personal administrativo.</li>

                      </ul>

                    </td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Variables</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Cambian según la cantidad producida o vendida.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">

                      <ul className="list-disc list-inside space-y-1">

                        <li>Materias primas para elaborar café.</li>

                        <li>Envases y empaques utilizados según el volumen de ventas.</li>

                      </ul>

                    </td>

                  </tr>

                  <tr>

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Directos</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Asociados directamente al producto o servicio.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">

                      <ul className="list-disc list-inside space-y-1">

                        <li>El costo de la tela utilizada para confeccionar una camiseta.</li>

                        <li>Los ingredientes de una pizza en un restaurante.</li>

                      </ul>

                    </td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">Indirectos</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">Gastos generales que no se vinculan a un producto específico.</td>

                    <td className="border border-neutral-300 px-4 py-3 text-neutral-700">

                      <ul className="list-disc list-inside space-y-1">

                        <li>Servicios públicos de la oficina.</li>

                        <li>Gastos de mantenimiento del sistema</li>

                      </ul>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>

{/* Punto de equilibrio */}

          <section className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg mb-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Punto de equilibrio</h3>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              El punto de equilibrio es el nivel de ventas en el que los ingresos igualan los costos totales. A partir de este punto, cualquier venta adicional genera utilidad. Es una herramienta clave para evaluar la viabilidad de un negocio, pues permite responder: ¿cuánto debo vender para no perder dinero?

            </p>

<div className="bg-white border-2 border-yellow-300 rounded-lg p-4 mb-4">

              <p className="text-neutral-900 font-semibold mb-2 text-center">Punto de equilibrio (en unidades) =</p>

              <div className="text-center text-2xl font-bold text-neutral-900 mb-2">

                Costos fijos totales

              </div>

              <div className="text-center text-neutral-700 mb-2">────────────────────────────</div>

              <div className="text-center text-2xl font-bold text-neutral-900">

                Precio de venta unitario − Costo variable unitario

              </div>

            </div>

<div className="bg-white border-2 border-yellow-300 rounded-lg p-4">

              <p className="text-neutral-900 font-semibold mb-2">Ejemplo:</p>

              <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                Una cafetería tiene costos fijos mensuales de $2.000.000 (arriendo, servicios, salarios). El costo variable por cada café vendido es de $2.000 y el precio de venta es de $5.000.

              </p>

              <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                <strong>Margen por unidad</strong> = $5.000 – $2.000 = $3.000.

              </p>

              <p className="text-neutral-700 mb-2 text-sm md:text-base leading-relaxed">

                <strong>Punto de equilibrio</strong> = $2.000.000 ÷ $3.000 ≈ 667 cafés al más.

              </p>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                Esto significa que la cafetería debe vender al menos 667 cafés mensuales para cubrir sus costos. A partir del café número 668, empieza a generar utilidad.

              </p>

            </div>

<p className="text-neutral-700 mt-4 text-sm md:text-base leading-relaxed italic">

              Comprender ingresos y costos permite diseñar modelos de negocio viables, tomar decisiones estratégicas informadas y garantizar la sostenibilidad en el tiempo

            </p>

          </section>

{/* Estudio de caso */}

          <section className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-600 p-6 rounded-lg">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Estudio de caso: rentabilidad con propósito</h3>

<div className="space-y-4">

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                Un emprendimiento de café orgánico en Nariño enfrentaba dificultades para crecer debido a la competencia de grandes marcas. Tras analizar su modelo de negocio, identificó que debía ajustar su estructura de ingresos y costos.

              </p>

<div>

                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Acciones implementadas</h4>

                <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm md:text-base ml-4">

                  <li><strong>Fuentes de ingresos:</strong> venta directa en ferias locales, suscripción mensual de clientes en Bogotá y exportación a pequeños distribuidores en Europa.</li>

                  <li><strong>Estrategia de precios:</strong> basada en valor, destacando la calidad orgánica y el impacto social.</li>

                  <li><strong>Costos principales:</strong> producción agrícola, certificaciones de calidad y logística de exportación.</li>

                </ul>

              </div>

<div>

                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Resultados alcanzados</h4>

                <ul className="list-disc list-inside space-y-2 text-neutral-700 text-sm md:text-base ml-4">

                  <li><strong>Incremento en ingresos:</strong> la diversificación de fuentes permitió aumentar las ventas en un 40%.</li>

                  <li><strong>Optimización de costos:</strong> al negociar con proveedores locales y reducir intermediarios, se disminuyeron gastos en un 20%.</li>

                  <li><strong>Sostenibilidad financiera:</strong> el negocio alcanzó el punto de equilibrio en seis meses y proyectó utilidades crecientes.</li>

                  <li><strong>Impacto social:</strong> los caficultores recibieron mejores pagos, fortaleciendo la economía rural.</li>

                </ul>

              </div>

<div className="bg-white border-2 border-green-300 rounded-lg p-4">

                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Reflexión del caso</h4>

                <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                  Este caso demuestra que comprender y ajustar ingresos y costos no solo mejora la rentabilidad, sino que también genera estabilidad y confianza en los clientes y aliados estratégicos.

                </p>

              </div>

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

            navigate('/student/modelo-negocios/unidad3/inicio');

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

export default ModeloNegociosUnidad3DesarrolloPage;


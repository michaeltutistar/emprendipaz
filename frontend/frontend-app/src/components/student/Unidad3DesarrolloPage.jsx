import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, BookOpen, ClipboardList, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const Unidad3DesarrolloPage = () => {

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

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 100);

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

const handleNext = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing y Comercialización',

          paso_nombre: 'Unidad 3: Fundamentación',

          curso_nombre: 'Marketing y Comercialización'

        })

      });

      navigate('/student/unidad3/taller');

    } catch (error) {

      navigate('/student/unidad3/taller');

    }

  };

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* HEADER ANIMADO */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-4 sm:px-8 overflow-hidden min-h-[60px]"

          animate={{

            minHeight: isScrolled ? '60px' : '60px',

            paddingTop: '0.5rem',

            paddingBottom: '0.5rem',

          }}

          transition={{ duration: 0.3 }}

        >

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

              ease: 'easeInOut',

              repeat: Infinity,

            }}

          />

<div

            className="absolute inset-0 flex items-center justify-center"

            style={{ mixBlendMode: 'overlay', opacity: 0.4 }}

          >

            <img

              src="https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png"

              alt=""

              className="w-[160%] h-auto object-cover"

            />

          </div>

{/* CAPA INTERMEDIA: Elementos flotantes ascendiendo en diagonal -48 grados */}

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

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[12%] w-11 h-11"

            animate={{

              x: [0, 137],

              y: [80, -33],

              opacity: [0, 0.65, 0.65, 0],

            }}

            transition={{

              duration: 4.2,

              repeat: Infinity,

              ease: "linear",

              delay: 0.3,

              times: [0, 0.1, 0.85, 1],

            }}

          />

{/* CAPA FRONTAL: Contenido estático y UI nítido */}

          <div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              {/* Logo */}

              <div>

                <motion.div

                  className="flex items-center justify-start"

                  initial={{ opacity: 0, x: -20 }}

                  animate={{ opacity: 1, x: 0 }}

                  transition={{ duration: 0.8, ease: 'easeOut' }}

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

                      Marketing y Comercialización

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

{/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] pt-8 pb-16 px-8">

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

          {/* Breadcrumás visibles solo sin scroll */}

          {!isScrolled && (

            <motion.div

              initial={{ opacity: 0, y: -10 }}

              animate={{ opacity: 1, y: 0 }}

              className="flex items-center gap-2 text-white/80 mb-6 text-sm"

            >

              <button

                onClick={() => navigate('/student/dashboard')}

                className="hover:text-white transition-colors flex items-center gap-1"

              >

                <Home className="w-4 h-4" />

                Inicio

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/modulos')}

                className="hover:text-white transition-colors"

              >

                Modulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/presentacion-modulo')}

                className="hover:text-white transition-colors"

              >

                Marketing y Comercialización

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Estrategias de comercialización</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <h1

              className="text-white"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Estrategias de comercialización

            </h1>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path

              d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z"

              fill="white"

            />

          </svg>

        </div>

      </section>

{/* Progress Steps - STICKY */}

      <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

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

<div className="space-y-12">

          <section className="space-y-3">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center">

                <BookOpen className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">1.4.1</p>

                <h2 className="text-2xl font-bold text-neutral-900">FUNDAMENTACION TEORICA</h2>

              </div>

            </div>

            <p className="text-neutral-700 mb-4">

              Las estrategias de comercialización son acciones planificadas para posicionar un producto o servicio en el mercado, atraer clientes y generar valor sostenible. Se fundamentan en el análisis del entorno, la identificación del consumidor y la comprensión de las capacidades internas de la empresa. Su propósito es conectar la propuesta de valor con las necesidades del mercado objetivo.

            </p>

            <p className="text-neutral-700 mb-4">

              Se debe tener en cuenta que el objetivo de una estrategia de comercialización es facilitar la conexión entre el producto y el cliente para generar ventas. El punto de partida es la segmentación, que permite dividir el mercado en grupos diferenciados. Luego se define el público objetivo y el posicionamiento, es decir, cómo se quiere que la marca sea percibida por los consumidores.

            </p>

            <p className="text-neutral-700 mb-4">

              Otro pilar fundamental es el marketing mix, tradicionalmente compuesta por las 4P: Producto, Precio, Plaza y Promoción. La estrategia de producto busca ofrecer bienes o servicios que satisfagan necesidades específicas de los clientes.

            </p>

            <div className="bg-neutral-50 border-l-4 border-neutral-900 p-5 rounded-r-lg mb-4">

              <p className="text-neutral-800 font-semibold mb-2">Ejemplo 1:</p>

              <p className="text-neutral-700 text-sm mb-4">

                Una panadería artesanal identifica que su público objetivo son jóvenes profesionales que valoran productos saludables. Define un posicionamiento basado en "ingredientes naturales" y desarrolla estrategias de redes sociales con contenido atractivo para ese segmento.

              </p>

              <p className="text-neutral-800 font-semibold mb-2">Ejemplo 2:</p>

              <p className="text-neutral-700 text-sm">

                Una empresa de ropa deportiva decide vender exclusivamente por comercio electrónico. Ajusta su estrategia de precio al mercado digital, optimiza su logística de envíos y utiliza campañas de influencers para aumentar visibilidad.

              </p>

            </div>

          </section>

<section className="space-y-3">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-neutral-200 text-neutral-900 flex items-center justify-center">

                <BookOpen className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">1.4.2</p>

                <h3 className="text-2xl font-bold text-neutral-900">Definiciones Clave</h3>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full border border-neutral-200 rounded-xl text-sm">

                <thead className="bg-neutral-900 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left">Concepto</th>

                    <th className="px-4 py-3 text-left">Definición</th>

                    <th className="px-4 py-3 text-left">Preguntas Clave</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-neutral-200">

                  <tr>

                    <td className="px-4 py-3 font-semibold text-neutral-900">Marketing</td>

                    <td className="px-4 py-3">Proceso de crear, comunicar, entregar e intercambiar ofertas que tienen valor para clientes, socios y la sociedad en general.</td>

                    <td className="px-4 py-3">¿Qué valor ofrecemos? ¿A quién? ¿Cómo lo comunicamos?</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold text-neutral-900">Necesidades</td>

                    <td className="px-4 py-3">Carencias básicas del ser humano (alimentación, seguridad, pertenencia).</td>

                    <td className="px-4 py-3">¿Qué necesidades cubrimás?</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold text-neutral-900">Deseos</td>

                    <td className="px-4 py-3">Formas en que las personas eligen satisfacer sus necesidades, moldeadas por la cultura y la personalidad.</td>

                    <td className="px-4 py-3">¿Cómo adaptamos la oferta a deseos específicos?</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold text-neutral-900">Segmentación</td>

                    <td className="px-4 py-3">División del mercado en grupos de consumidores con características o comportamientos similares.</td>

                    <td className="px-4 py-3">¿A qué grupo nos dirigimos?</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold text-neutral-900">Posicionamiento</td>

                    <td className="px-4 py-3">Lugar que ocupa una marca en la mente del consumidor frente a la competencia.</td>

                    <td className="px-4 py-3">¿Cómo queremos ser percibidos?</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold text-neutral-900">Mezcla de Marketing (4P)</td>

                    <td className="px-4 py-3">Herramienta estratégica que integra Producto, Precio, Plaza (distribución) y Promoción para satisfacer al cliente y lograr objetivos.</td>

                    <td className="px-4 py-3">¿Qué ofrecemos, a qué precio, dónde y cómo lo comunicamos?</td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>

<section className="space-y-3">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">

                <ClipboardList className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">Caso práctico</p>

                <h3 className="text-2xl font-bold text-neutral-900">"La Tiendita Verde: Mejorando su comercialización"</h3>

              </div>

            </div>

            <p className="text-neutral-700 mb-4">

              La Tiendita Verde es un pequeño negocio de productos naturales que no lograba atraer suficientes clientes.

              Su principal problema era que no tenía una estrategia clara para promocionar sus productos ni para diferenciarse de otras tiendas del sector.

            </p>

            <p className="text-neutral-700 mb-4">

              Para mejorar, primero identificaron a su público objetivo: personas entre 20 y 45 años interesadas en alimentación saludable.

              Luego definieron un posicionamiento: ser una tienda cercana, económica y con productos realmente frescos.

            </p>

            <p className="text-neutral-700 mb-4">

              La empresa ajustó su marketing MIX. Creó combos de frutas y verduras para ofrecer mejores precios, organizó su tienda para hacer más visibles los productos

              y comenzó a promocionarse en redes sociales con fotos sencillas y mensajes sobre alimentación saludable. Además, incluyó servicio a domicilio los fines de semana.

              Después de tres meses, las ventas aumentaron 15% y se observaron más clientes recurrentes.

            </p>

          </section>

<section className="space-y-3">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">

                <ClipboardList className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">1.4.3</p>

                <h3 className="text-2xl font-bold text-neutral-900">Ejemplos Prácticos</h3>

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50 space-y-3">

                <p className="text-neutral-900 font-bold">a) Local de ropa deportiva sostenible</p>

                <div className="space-y-2 text-sm">

                  <p className="text-neutral-700"><strong>Necesidad:</strong> Vestimenta deportiva funcional.</p>

                  <p className="text-neutral-700"><strong>Deseo:</strong> Ropa ecológica y moderna.</p>

                  <p className="text-neutral-700"><strong>Segmentación:</strong> Jóvenes adultos interesados en sostenibilidad.</p>

                  <p className="text-neutral-700"><strong>Posicionamiento:</strong> "La marca deportiva que cuida tu rendimiento y el planeta".</p>

                  <div className="mt-3 pt-3 border-t border-neutral-300">

                    <p className="text-neutral-800 font-semibold mb-2">4P:</p>

                    <ul className="list-disc list-inside space-y-1 text-neutral-700">

                      <li><strong>Producto:</strong> Leggins de materiales reciclados.</li>

                      <li><strong>Precio:</strong> Nivel medio-alto.</li>

                      <li><strong>Plaza:</strong> Tienda online y puntos en gimnasios.</li>

                      <li><strong>Promoción:</strong> Influencers de fitness y redes sociales.</li>

                    </ul>

                  </div>

                </div>

              </div>

              <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50 space-y-3">

                <p className="text-neutral-900 font-bold">b) Panadería de barrio</p>

                <div className="space-y-2 text-sm">

                  <p className="text-neutral-700"><strong>Necesidad:</strong> Alimentación rápida y económica.</p>

                  <p className="text-neutral-700"><strong>Deseo:</strong> Productos frescos y atención cercana.</p>

                  <p className="text-neutral-700"><strong>Segmentación:</strong> Familias y trabajadores locales.</p>

                  <p className="text-neutral-700"><strong>Posicionamiento:</strong> "El sabor casero de la cuadra".</p>

                  <div className="mt-3 pt-3 border-t border-neutral-300">

                    <p className="text-neutral-800 font-semibold mb-2">4P:</p>

                    <ul className="list-disc list-inside space-y-1 text-neutral-700">

                      <li><strong>Producto:</strong> Pan tradicional y postres.</li>

                      <li><strong>Precio:</strong> Accesible.</li>

                      <li><strong>Plaza:</strong> Venta directa en el barrio.</li>

                      <li><strong>Promoción:</strong> Carteles locales y promociones de lealtad.</li>

                    </ul>

                  </div>

                </div>

              </div>

            </div>

          </section>

<section className="space-y-3">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">

                <BookOpen className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">1.4.4</p>

                <h3 className="text-2xl font-bold text-neutral-900">Lectura corta</h3>

              </div>

            </div>

            <div className="bg-neutral-50 border-l-4 border-emerald-600 p-6 rounded-r-lg mb-4">

              <p className="text-neutral-900 font-bold text-lg mb-3">"El marketing: mucho más que vender"</p>

            </div>

            <p className="text-neutral-700 mb-4">

              El marketing no es solo publicidad ni ventas. Es un proceso integral que parte de comprender al cliente, detectar necesidades y diseñar soluciones que generen valor.

              En un mundo hiperconectado, el consumidor es más exigente y busca experiencias personalizadas.

            </p>

            <p className="text-neutral-700 mb-4">

              Por ello, los fundamentos de marketing —como la segmentación, el posicionamiento y las 4P— ayudan a las organizaciones a destacarse.

              Ya sea una gran multinacional o un pequeño emprendimiento, el marketing es la brújula para crear relaciones sólidas y sostenibles con los clientes.

            </p>

          </section>

</div>

{/* Next Button */}

        <div className="flex justify-end mt-8">

          <div className="relative group">

            <Button

              onClick={handleNext}

              disabled={!hasScrolledToBottom}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

            {!hasScrolledToBottom && (

              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">

                Desplázate hasta el final para continuar

                <div className="absolute top-full right-4 transform -mt-1">

                  <div className="border-4 border-transparent border-t-neutral-900"></div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

{/* Back Button - Bottom Left */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/unidad3/inicio');

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

export default Unidad3DesarrolloPage;


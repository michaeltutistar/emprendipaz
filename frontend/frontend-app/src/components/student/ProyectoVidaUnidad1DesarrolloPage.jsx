import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const ProyectoVidaUnidad1DesarrolloPage = () => {

  const navigate = useNavigate();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

const contentRef = useRef(null);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    const handleWindowScroll = () => {

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

    };

    window.addEventListener('scroll', handleWindowScroll);

    return () => window.removeEventListener('scroll', handleWindowScroll);

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

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Proyecto de vida',

          paso_nombre: 'Unidad 1: Fundamentación',

          curso_nombre: 'Proyecto de vida'

        })

      });

      // Guardar en localStorage para el cálculo de progreso

      localStorage.setItem('pv_unidad1_desarrollo_completado', 'true');

      // Disparar evento para actualizar progreso

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad1/taller');

    } catch (error) {

      // Guardar en localStorage incluso si falla la API

      localStorage.setItem('pv_unidad1_desarrollo_completado', 'true');

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad1/taller');

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

            <button onClick={() => navigate('/student/proyecto-vida')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Proyecto de vida

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Valores e intereses personales

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

              Valores e intereses personales

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

        <div>

          <div ref={contentRef} className="px-8 py-4">

            {/* Lectura Section */}

            <section id="lectura" className="mb-16">

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

                  Fundamentos sobre valores e intereses personales

                </h2>

                <div className="w-16 h-1 bg-[#006837]"></div>

              </div>

<div className="prose prose-lg max-w-none space-y-6">

                <p className="text-gray-700 leading-relaxed text-base">

                  El autoconocimiento comienza con la identificación de los valores que guían nuestras acciones y los intereses que despiertan nuestra motivación. Los valores son principios que orientan la conducta, como la honestidad, la responsabilidad o la solidaridad.

                </p>

                <p className="text-gray-700 leading-relaxed text-base">

                  Los intereses, por su parte, son aquellas áreas que generan entusiasmo y energía, como el arte, la innovación o el servicio social. Reconocerlos nos permite tomar decisiones coherentes y evitar contradicciones entre lo que se desea vs lo que se hace.

                </p>

<h3

                  className="text-[#006837] mt-8 mb-4"

                  style={{

                    fontFamily: 'var(--font-heading)',

                    fontSize: '1.5rem',

                    fontWeight: 600,

                  }}

                >

                  Valores esenciales para un emprendimiento

                </h3>

                <p className="text-gray-700 leading-relaxed text-base mb-4">

                  Estos son los 4 valores que deberías considerar en la actividad cotidiana de tu emprendimiento:

                </p>

                <ol className="list-decimal list-inside space-y-3 text-gray-700 text-base">

                  <li>

                    <strong>Responsabilidad:</strong> mediante este valor se asumen compromisos y se cumplen con seriedad. De esta manera, se genera confianza con clientes, colaboradores y demás aliados.

                  </li>

                  <li>

                    <strong>Honestidad:</strong> se refiere a la franqueza en la gestión del negocio, fortaleciendo la credibilidad y reputación.

                  </li>

                  <li>

                    <strong>Perseverancia:</strong> este valor permite mantener el esfuerzo y la constancia frente a las dificultades, a través de la disciplina y resiliencia.

                  </li>

                  <li>

                    <strong>Solidaridad:</strong> a través de este valor logramos compromiso con el bienestar de la comunidad y los colaboradores, promoviendo la cooperación y el beneficio general.

                  </li>

                </ol>

<h3

                  className="text-[#006837] mt-8 mb-4"

                  style={{

                    fontFamily: 'var(--font-heading)',

                    fontSize: '1.5rem',

                    fontWeight: 600,

                  }}

                >

                  Influencia de los intereses personales en la actividad comercial

                </h3>

                <p className="text-gray-700 leading-relaxed text-base mb-4">

                  Nuestros intereses personales se convierten en motores que orientan el tipo de negocio que podemos desarrollar. Esto se debe a que cuando construimos un emprendimiento alineado a nuestros gustos, realizamos las tareas con mayor pasión y empeño, obteniendo mejores resultados.

                </p>

                <p className="text-gray-700 leading-relaxed text-base mb-6">

                  En la siguiente tabla encontrarás una relación entre intereses personales y posibles alternativas de negocio:

                </p>

                <div className="overflow-x-auto mb-8">

                  <table className="min-w-full border border-gray-200 rounded-xl text-sm">

                    <thead className="bg-gray-900 text-white">

                      <tr>

                        <th className="px-4 py-3 text-left">Interés personal</th>

                        <th className="px-4 py-3 text-left">Posible negocio</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-200">

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Servicio social</td>

                        <td className="px-4 py-3">Emprendimientos comunitarios, programas de capacitación o negocios con impacto social.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Gastronomía</td>

                        <td className="px-4 py-3">Restaurantes temáticos, productos artesanales, cocina de autor.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Arte y creatividad</td>

                        <td className="px-4 py-3">Diseño gráfico, artesanías, moda, experiencias culturales.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Sostenibilidad ambiental</td>

                        <td className="px-4 py-3">Producción ecológica, reciclaje, negocios verdes.</td>

                      </tr>

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Tecnología</td>

                        <td className="px-4 py-3">Plataformas digitales, comercio electrónico, soluciones tecnológicas.</td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>

            </section>

{/* Caso de Estudio Section */}

            <section id="caso" className="mb-16">

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

<div className="prose prose-neutral max-w-none space-y-6">

                <p className="text-gray-700 leading-relaxed text-base mb-6">

                  A continuación, vamos a analizar dos casos de emprendedores donde se evidencia cómo el identificar nuestros intereses personales, nos permite desarrollar una idea de negocio adecuada.

                </p>

<div className="space-y-6">

                  <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg p-8 my-6">

                    <h3

                      className="text-xl mb-3"

                      style={{

                        fontFamily: 'var(--font-heading)',

                        fontWeight: 700,

                      }}

                    >

                      Caso 1: Maximiliano

                    </h3>

                    <p className="opacity-90 mb-4">

                      Maximiliano es un joven que desea emprender, sin embargo, no ha logrado identificar cuál es el tipo de negocio en el cual debería hacerlo. Un amigo suyo le señala que el joven siempre se ha preocupado por la sostenibilidad ambiental, y ha mostrado preocupación por los empaques que afectan al medio ambiente.

                    </p>

                    <div className="bg-white/10 rounded-lg p-4 mt-4">

                      <p className="font-semibold mb-2">Solución del caso:</p>

                      <p className="opacity-95">

                        Gracias al apunte que su amigo le realiza, Maximiliano concluye que debe emprender en un área relacionada con la sostenibilidad ambiental, por ende, desarrolla un emprendimiento de empaques biodegradables para negocios locales. Ofreciendo productos como: vasos, bolsas de compras, bandejas, cajas de pizza, bolsas de papel, etc. Que sean amigables con el medio ambiente.

                      </p>

                      <p className="opacity-95 mt-2">

                        Maximiliano ha encontrado la manera de emprender de forma apasionada y en comunión con sus intereses.

                      </p>

                    </div>

                  </div>

<div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg p-8 my-6">

                    <h3

                      className="text-xl mb-3"

                      style={{

                        fontFamily: 'var(--font-heading)',

                        fontWeight: 700,

                      }}

                    >

                      Caso 2: Janeth

                    </h3>

                    <p className="opacity-90 mb-4">

                      Janeth tenía un emprendimiento de artesanías en un sitio turístico de su ciudad. Sin embargo, el negocio se vino a pique porque los clientes se quejaban de la pésima atención ofrecida por Janeth, además manifestaban que los acabados de las artesanías eran cada vez peores, como si los hicieran sin ganas y sin cuidado.

                    </p>

                    <p className="opacity-90 mb-4">

                      A pesar de la excelente ubicación para este tipo de negocio, la realidad es que Janeth no disfrutaba de esta actividad y eso le generaba frustración, ocasionando la mala atención y elaboración de sus productos.

                    </p>

                    <div className="bg-white/10 rounded-lg p-4 mt-4">

                      <p className="font-semibold mb-2">Solución del caso:</p>

                      <p className="opacity-95">

                        Tras una autoevaluación personal, Janeth concluyó que ella siempre había gustado de todo lo relacionado con la gastronomía, por lo tanto, emprendió una nueva aventura en un restaurante de comida típica, pocos meses después su clientela era numerosa y aumentaba con el paso de los días, además sus clientes manifestaban excelente atención y platos elaborados con alta calidad.

                      </p>

                      <p className="opacity-95 mt-2">

                        Janeth finalmente había emprendido en un negocio que se ajustaba a sus intereses personales y le despertaba gran pasión y satisfacción.

                      </p>

                    </div>

                  </div>

                </div>

{/* Spacer para mejor scroll */}

                <div className="h-20"></div>

              </div>

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

            navigate('/student/proyecto-vida/unidad1/inicio');

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

export default ProyectoVidaUnidad1DesarrolloPage;


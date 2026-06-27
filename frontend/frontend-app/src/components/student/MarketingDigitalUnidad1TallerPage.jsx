import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, Star, CheckCircle, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const pasos = [

  {

    id: 1,

    titulo: '¿Me encuentran fácilmente?',

    instruccion: 'Dirígete al buscador de Google y digita el nombre de tu emprendimiento. Y observa: ¿Tu sitio web aparece en la primera página? Si no tienes sitio web, ¿Aparece alguna red social principal? (Facebook, Instagram, TikTok).',

    opciones: [

      {

        id: '1-5',

        texto: 'Mi sitio web y todas las redes sociales de mi emprendimiento aparecen en primera página.',

        estrellas: 5

      },

      {

        id: '1-4',

        texto: 'Mi sitio web o en caso de no tener página web, alguna de las redes sociales de mi emprendimiento aparece en primera página.',

        estrellas: 4

      },

      {

        id: '1-3',

        texto: 'Mi sitio web o en caso de no tener página web, ninguna de más redes sociales aparece en primera página pero sí en la segunda.',

        estrellas: 3

      },

      {

        id: '1-1',

        texto: 'Mi emprendimiento no está en canales digitales.',

        estrellas: 1

      }

    ]

  },

  {

    id: 2,

    titulo: 'Radiografía de más redes sociales',

    instruccion: 'Dirígete a alguna de las redes sociales de tu emprendimiento (Facebook, Instagram, TikTok). Y observa: la información de contacto (teléfono, dirección, horario de atención, etc.…).',

    opciones: [

      {

        id: '2-5',

        texto: 'La información de contacto de la red social seleccionada es completa y corresponde a datos actuales.',

        estrellas: 5

      },

      {

        id: '2-4',

        texto: 'Uno de los datos de contacto está desactualizado (Teléfono, dirección, horario de atención, etc.…).',

        estrellas: 4

      },

      {

        id: '2-3',

        texto: 'Todos los datos de contacto están desactualizados.',

        estrellas: 3

      },

      {

        id: '2-1',

        texto: 'Mi emprendimiento no tiene redes sociales.',

        estrellas: 1

      }

    ]

  },

  {

    id: 3,

    titulo: '¿Cómo es mi contenido en redes sociales?',

    instruccion: 'Dirígete a alguna de las redes sociales de tu emprendimiento (Facebook, Instagram, TikTok). Y reflexiona: lo que publico en las redes sociales o en mi sitio web ¿tiene una frecuencia (semanal, diaria, etc.…)?',

    opciones: [

      {

        id: '3-5',

        texto: 'Las publicaciones siguen una frecuencia (ejemplo, dos veces por semana).',

        estrellas: 5

      },

      {

        id: '3-4',

        texto: 'Las publicaciones no siguen una frecuencia, pero la última publicación es reciente.',

        estrellas: 4

      },

      {

        id: '3-3',

        texto: 'Hace más de dos semanas que no publico nada.',

        estrellas: 3

      },

      {

        id: '3-1',

        texto: 'Mi emprendimiento no tiene redes sociales.',

        estrellas: 1

      }

    ]

  },

  {

    id: 4,

    titulo: '¿Qué dicen más clientes?',

    instruccion: 'Escoge la publicación más reciente de alguna de las redes sociales de tu emprendimiento (Facebook, Instagram, TikTok). Y observa los comentarios de tus clientes.',

    opciones: [

      {

        id: '4-5',

        texto: 'Los clientes realizan comentarios positivos o solicitan información y reciben siempre respuesta.',

        estrellas: 5

      },

      {

        id: '4-4',

        texto: 'Existen algunos comentarios sin responder, pero son la minoría.',

        estrellas: 4

      },

      {

        id: '4-3',

        texto: 'La mayoría de comentarios son negativos.',

        estrellas: 3

      },

      {

        id: '4-1',

        texto: 'No hay ningún comentario o no tengo redes sociales.',

        estrellas: 1

      }

    ]

  }

];

const MarketingDigitalUnidad1TallerPage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('md_u1_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [completado, setCompletado] = useState(() => {

    const saved = localStorage.getItem('md_u1_taller_completado');

    return saved === 'true';

  });

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const isScrolledRef = useRef(false);

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

          const scrollPosition = window.scrollY;

          const newIsScrolled = scrollPosition > 70;

if (newIsScrolled !== isScrolledRef.current) {

            isScrolledRef.current = newIsScrolled;

            setIsScrolled(newIsScrolled);

          }

ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

useEffect(() => {

    localStorage.setItem('md_u1_taller_respuestas', JSON.stringify(respuestas));

    const todasRespondidas = pasos.every(paso => respuestas[paso.id]);

    setCompletado(todasRespondidas);

    localStorage.setItem('md_u1_taller_completado', todasRespondidas.toString());

  }, [respuestas]);

const handleSeleccionar = (pasoId, opcionId) => {

    setRespuestas(prev => ({ ...prev, [pasoId]: opcionId }));

  };

const handleFinalizar = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing Digital',

          paso_nombre: 'Unidad 1: Taller',

          curso_nombre: 'Marketing Digital'

        })

      });

      navigate('/student/marketing-digital/unidad1/cierre');

    } catch (error) {

      navigate('/student/marketing-digital/unidad1/cierre');

    }

  };

const renderEstrellas = (cantidad) => {

    return (

      <div className="flex gap-1">

        {[...Array(5)].map((_, i) => (

          <Star

            key={i}

            className={`w-5 h-5 ${

              i < cantidad

                ? 'fill-yellow-400 text-yellow-400'

                : 'fill-neutral-300 text-neutral-300'

            }`}

          />

        ))}

      </div>

    );

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

{/* Hojas animadas */}

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[8%] w-12 h-12"

            animate={{ x: [0, 140], y: [80, -36], opacity: [0, 0.9, 0.9, 0] }}

            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[28%] w-10 h-10"

            animate={{ x: [0, 133], y: [80, -30], opacity: [0, 0.7, 0.7, 0] }}

            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', delay: 1, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[10%] w-11 h-11"

            animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.85, 0.85, 0] }}

            transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 0.5, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[5%] w-13 h-13"

            animate={{ x: [0, 146], y: [80, -42], opacity: [0, 0.6, 0.6, 0] }}

            transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1.5, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute left-[15%] w-8 h-8"

            animate={{ x: [0, 127], y: [80, -27], opacity: [0, 0.75, 0.75, 0] }}

            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute right-[40%] w-7 h-7"

            animate={{ x: [0, 120], y: [80, -24], opacity: [0, 0.8, 0.8, 0] }}

            transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', delay: 0.8, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[12%] w-11 h-11"

            animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.65, 0.65, 0] }}

            transition={{ duration: 4.2, repeat: Infinity, ease: 'linear', delay: 0.3, times: [0, 0.1, 0.85, 1] }}

          />

<div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

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

                      Marketing Digital

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 1 · Taller

                    </p>

                  </div>

                </motion.div>

<div className="flex justify-end">

                <button

                  onClick={() => navigate('/student/perfil')}

                  className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-[10000]"

                >

                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">

                    <span className="text-white font-semibold text-sm">U</span>

                  </div>

                </button>

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

                className="text-gray-600 hover:text-[#006837] transition-colors flex items-center gap-1"

              >

                <Home className="w-3.5 h-3.5" />

                Inicio

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button

                onClick={() => navigate('/student/modulos')}

                className="text-gray-600 hover:text-[#006837] transition-colors"

              >

                Módulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button

                onClick={() => navigate('/student/marketing-digital')}

                className="text-gray-600 hover:text-[#006837] transition-colors"

              >

                Marketing Digital

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Diagnóstico de Presencia Digital

              </span>

            </div>

          </div>

        </motion.div>

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

                Módulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/marketing-digital')}

                className="hover:text-white transition-colors"

              >

                Marketing Digital

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 1 · Taller</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Marketing Digital

            </p>

            <h1

              className="text-white mb-3"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Diagnóstico de Presencia Digital · Taller

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Evalúa tu presencia digital actual mediante un diagnóstico estructurado en 4 pasos.

            </p>

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

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            {/* Progress Line */}

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#AA27B9] to-[#d946ef] z-0"

              initial={{ width: 0 }}

              animate={{ width: '75%' }}

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

{/* Step 2 - Completado */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                2

              </div>

              <p className="text-[10px] text-gray-500">Fundamentación</p>

            </div>

{/* Step 3 - Active */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: "spring", stiffness: 200 }}

                className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                3

              </motion.div>

              <p className="text-[10px] text-[#AA27B9] font-bold">Taller</p>

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

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">

          <div className="mb-8">

            <h2 className="text-2xl md:text-[32px] font-bold text-neutral-900 mb-4">1.2.4. Taller: "Mi Emprendimiento Bajo la Lupa Digital"</h2>

            <p className="text-neutral-600 text-sm md:text-base mb-2">

              Hemos hablado de los pasos para diagnosticar nuestra presencia digital. Ahora, vamos a aplicarlos de forma práctica a nuestro emprendimiento o a uno que conozcamos bien. No necesitamos ser expertos, solo observar y reflexionar.

            </p>

          </div>

<div className="space-y-8">

            {pasos.map((paso) => {

              const respuestaSeleccionada = respuestas[paso.id];

              const opcionSeleccionada = paso.opciones.find(o => o.id === respuestaSeleccionada);

return (

                <div key={paso.id} className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-6">

                  <div className="mb-4">

                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Paso {paso.id}: {paso.titulo}</h3>

                    <p className="text-neutral-700 text-sm md:text-base mb-4">

                      <strong>• Instrucción:</strong> {paso.instruccion}

                    </p>

                    <p className="text-neutral-700 text-sm md:text-base mb-4">

                      Con base en tus hallazgos selecciona la calificación que más se ajuste a tu ejercicio:

                    </p>

                  </div>

<div className="space-y-3">

                    {paso.opciones.map((opcion) => {

                      const isSelected = respuestaSeleccionada === opcion.id;

                      return (

                        <button

                          key={opcion.id}

                          onClick={() => handleSeleccionar(paso.id, opcion.id)}

                          className={`w-full text-left border-2 rounded-lg px-4 py-3 transition-all ${

                            isSelected

                              ? 'bg-neutral-900 text-white border-neutral-900'

                              : 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900'

                          }`}

                        >

                          <div className="flex items-center justify-between">

                            <span className="text-sm md:text-base flex-1">{opcion.texto}</span>

                            <div className="ml-4">

                              {renderEstrellas(opcion.estrellas)}

                            </div>

                          </div>

                        </button>

                      );

                    })}

                  </div>

{opcionSeleccionada && (

                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">

                      <div className="flex items-center gap-2 text-green-800">

                        <CheckCircle className="w-5 h-5" />

                        <span className="text-sm font-semibold">

                          Seleccionado: {opcionSeleccionada.estrellas} {opcionSeleccionada.estrellas === 1 ? 'estrella' : 'estrellas'}

                        </span>

                      </div>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

{/* Reflexión final y recomendaciones */}

          <div className="mt-10 bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">1.2.5. Reflexión final y recomendaciones</h3>

            <p className="text-sm md:text-base mb-3">

              Recuerda que con base en los resultados de tu actividad práctica "Mi Emprendimiento Bajo la Lupa Digital", se deben adoptar algunas acciones correctivas, algunas serán inmediatas y otras a mediano o incluso a largo plazo.

            </p>

            <p className="text-sm md:text-base mb-4">

              Para la actividad práctica que acabamos de realizar algunas de las posibles acciones inmediatas que se podrían adoptar con base en la calificación de cada paso podrían incluir:

            </p>

<div className="overflow-x-auto">

              <table className="min-w-full border border-neutral-200 rounded-xl text-sm">

                <thead className="bg-neutral-900 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left">PASO</th>

                    <th className="px-4 py-3 text-left">CALIFICACIÓN</th>

                    <th className="px-4 py-3 text-left">POSIBLES ACCIONES DE MEJORA</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-neutral-200">

                  <tr>

                    <td className="px-4 py-3 font-semibold">1. ¿Me encuentran fácilmente?</td>

                    <td className="px-4 py-3">4 estrellas</td>

                    <td className="px-4 py-3">No aplica</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">3, 2 estrellas</td>

                    <td className="px-4 py-3">Considerar estrategia SEO/SEM</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">1 estrella</td>

                    <td className="px-4 py-3">Evaluar en cuál o cuáles son los canales digitales en los que mi emprendimiento debe hacer presencia</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3 font-semibold">2. Radiografía de más redes sociales</td>

                    <td className="px-4 py-3">4 estrellas</td>

                    <td className="px-4 py-3">No aplica</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">3,2 estrellas</td>

                    <td className="px-4 py-3">Actualizar datos de contacto</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">1 estrella</td>

                    <td className="px-4 py-3">Creación de redes sociales de acuerdo al perfil del emprendimiento</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold">3. ¿Cómo es mi contenido en redes sociales?</td>

                    <td className="px-4 py-3">4 estrellas</td>

                    <td className="px-4 py-3">No aplica</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">3,2 estrellas</td>

                    <td className="px-4 py-3">Definir objetivos para los contenidos a publicar y la frecuencia requerida.</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">1 estrella</td>

                    <td className="px-4 py-3">Creación de redes sociales de acuerdo al perfil del emprendimiento</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3 font-semibold">4. ¿Qué dicen más clientes?</td>

                    <td className="px-4 py-3">4 estrellas</td>

                    <td className="px-4 py-3">No aplica</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">3,2 estrellas</td>

                    <td className="px-4 py-3">Gestión de atención al usuario y considerar estrategia de marketing de contenidos.</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3"></td>

                    <td className="px-4 py-3">1 estrella</td>

                    <td className="px-4 py-3">Marketing de contenidos y creación de redes sociales de acuerdo al perfil del emprendimiento</td>

                  </tr>

                </tbody>

              </table>

            </div>

<p className="text-sm md:text-base mt-6">

              Utiliza los conocimientos que has adquirido en esta unidad para elaborar el diagnóstico de presencia digital de manera más detallada en el contexto de tu emprendimiento. Deberías considerar todos los canales digitales en los que el negocio está presente y estudiar en mayor detalle a tu competencia, con el propósito de reconocer aspectos valorados por los clientes.

            </p>

            <p className="text-sm md:text-base mt-4">

              En la unidad 2 y 3 profundizaremos en la definición de metas de marketing digital para el desarrollo de estrategias como resultado del diagnóstico de presencia digital.

            </p>

          </div>

<div className="mt-8 flex justify-end">

            <Button

              onClick={handleFinalizar}

              disabled={!completado}

              className={`px-8 py-4 flex items-center gap-2 ${

                completado

                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white'

                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'

              }`}

            >

              Finalizar Taller

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

{!completado && (

            <p className="text-center text-neutral-500 text-sm mt-4">

              Completa todos los pasos para finalizar el taller

            </p>

          )}

        </div>

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/marketing-digital/unidad1')}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </div>

<Footer />

    </div>

  );

};

export default MarketingDigitalUnidad1TallerPage;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, CheckCircle, X, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const situacionesPracticas = [

  {

    id: 'situacion1',

    texto: 'El cliente llama a la empresa solicitando asesoría sobre las lociones cítricas, una asesora responde con amabilidad, explica precios y ofrece opciones.',

    respuestaCorrecta: 'propuesta'

  },

  {

    id: 'situacion2',

    texto: 'Durante el trayecto, el cliente recibe un mensaje de WhatsApp con el estado de la entrega y una foto al recibir el paquete.',

    respuestaCorrecta: 'seguimiento'

  },

  {

    id: 'situacion3',

    texto: 'Un cliente recibe un volante en la calle con una promoción de lociones importadas.',

    respuestaCorrecta: 'primer_contacto'

  },

  {

    id: 'situacion4',

    texto: 'Al finalizar, la empresa de lociones envía un breve mensaje de agradecimiento y una encuestá de satisfacción para calificar el servicio.',

    respuestaCorrecta: 'post_servicio'

  },

  {

    id: 'situacion5',

    texto: 'El cliente solicita un domicilio.',

    respuestaCorrecta: 'prestacion'

  }

];

const pasosCiclo = [

  { id: 'primer_contacto', nombre: 'Primer contacto (cuando el cliente conoce la empresa)' },

  { id: 'propuesta', nombre: 'Propuesta de solución' },

  { id: 'prestacion', nombre: 'Prestación o ejecución del servicio' },

  { id: 'seguimiento', nombre: 'Seguimiento' },

  { id: 'post_servicio', nombre: 'Post-servicio o acompañamiento' }

];

const AtencionClienteUnidad1TallerPage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('ac_u1_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [situacionesDisponibles, setSituacionesDisponibles] = useState(() => {

    const saved = localStorage.getItem('ac_u1_taller_disponibles');

    return saved ? JSON.parse(saved) : situacionesPracticas.map(s => s.id);

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('ac_u1_taller_validado');

    return saved === 'true';

  });

  const [draggedSituacion, setDraggedSituacion] = useState(null);

  const [dragOver, setDragOver] = useState(null);

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

    localStorage.setItem('ac_u1_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('ac_u1_taller_disponibles', JSON.stringify(situacionesDisponibles));

  }, [situacionesDisponibles]);

useEffect(() => {

    localStorage.setItem('ac_u1_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, situacionId) => {

    setDraggedSituacion(situacionId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, pasoId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(pasoId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, pasoId) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedSituacion) return;

if (respuestas[pasoId]) {

      setSituacionesDisponibles(prev => [...prev, respuestas[pasoId]]);

    }

setRespuestas(prev => ({

      ...prev,

      [pasoId]: draggedSituacion

    }));

setSituacionesDisponibles(prev => prev.filter(id => id !== draggedSituacion));

    setDraggedSituacion(null);

    setValidado(false);

  };

const handleRemoveAnswer = (pasoId) => {

    const situacionId = respuestas[pasoId];

    if (situacionId) {

      setSituacionesDisponibles(prev => [...prev, situacionId]);

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[pasoId];

        return newRespuestas;

      });

      setValidado(false);

    }

  };

const todasRespondidas = Object.keys(respuestas).length === pasosCiclo.length;

  const respuestasCorrectas = pasosCiclo.filter(paso => {

    const situacionId = respuestas[paso.id];

    const situacion = situacionesPracticas.find(s => s.id === situacionId);

    return situacion && situacion.respuestaCorrecta === paso.id;

  }).length;

const handleCompleteStep = async () => {

    if (!validado || respuestasCorrectas !== pasosCiclo.length) {

      alert('Por favor completa correctamente todos los emparejamientos antes de continuar.');

      return;

    }

try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Atención al Cliente y Resolución de Conflictos',

          paso_nombre: 'Unidad 1: Taller',

          curso_nombre: 'Atención al Cliente'

        })

      });

      navigate('/student/atencion-cliente/unidad1/cierre');

    } catch (error) {

      navigate('/student/atencion-cliente/unidad1/cierre');

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

                    Atención al Cliente

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

              Modulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/atencion-cliente')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Atención al Cliente

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Ciclo del Servicio

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

                Modulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/atencion-cliente')}

                className="hover:text-white transition-colors"

              >

                Atención al Cliente

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

              MÓDULO: Atención al Cliente y Resolución de Conflictos

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

              Ciclo del Servicio · Taller

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Mapea el ciclo del servicio emparejando situaciones prácticas con los pasos correspondientes mediante un ejercicio interactivo de arrastrar y soltar.

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

<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-6">

            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Taller: "Mapeando el ciclo del servicio"</h2>

            <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded">

              <p className="text-neutral-700 text-sm md:text-base mb-2">

                <strong>📌 Instrucciones:</strong> Pongamos en práctica los conocimientos que hemos adquirido en esta primera unidad.

                Vamos a identificar los pasos del ciclo del servicio con su respectiva situación práctica.

              </p>

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>Empareja</strong> la situación práctica de la derecha con el paso del ciclo del servicio al que corresponde en la izquierda.

                Arrastra las opciones de la derecha hacia las opciones de la izquierda.

              </p>

            </div>

          </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="space-y-4">

              <h4 className="font-semibold text-neutral-900 mb-3">Ciclo del Servicio</h4>

              <div className="space-y-3">

                {pasosCiclo.map((paso) => {

                  const situacionId = respuestas[paso.id];

                  const situacion = situacionesPracticas.find(s => s.id === situacionId);

                  const isCorrect = validado && situacion && situacion.respuestaCorrecta === paso.id;

                  const isIncorrect = validado && situacion && situacion.respuestaCorrecta !== paso.id;

return (

                    <div

                      key={paso.id}

                      onDragOver={(e) => handleDragOver(e, paso.id)}

                      onDragLeave={handleDragLeave}

                      onDrop={(e) => handleDrop(e, paso.id)}

                      onContextMenu={handleContextMenu}

                      className={`min-h-[100px] p-4 rounded-lg border-2 transition-all select-none ${dragOver === paso.id

                        ? 'border-blue-500 bg-blue-50'

                        : situacion

                          ? isCorrect

                            ? 'border-green-500 bg-green-50'

                            : isIncorrect

                              ? 'border-red-500 bg-red-50'

                              : 'border-neutral-300 bg-neutral-50'

                          : 'border-neutral-300 bg-white'

                        }`}

                    >

                      <div className="flex items-start justify-between mb-2">

                        <h5 className="font-semibold text-neutral-900 text-sm">{paso.nombre}</h5>

                        {situacion && (

                          <button

                            onClick={() => handleRemoveAnswer(paso.id)}

                            className="text-red-600 hover:text-red-800"

                          >

                            <X className="w-4 h-4" />

                          </button>

                        )}

                      </div>

                      {situacion && (

                        <div className="mt-2">

                          <p className="text-xs text-neutral-700 italic">{situacion.texto}</p>

                          {validado && (

                            <div className="mt-2">

                              {isCorrect ? (

                                <div className="flex items-center gap-2 text-green-700">

                                  <CheckCircle className="w-4 h-4" />

                                  <span className="text-xs font-semibold">Correcto</span>

                                </div>

                              ) : (

                                <div className="flex items-center gap-2 text-red-700">

                                  <X className="w-4 h-4" />

                                  <span className="text-xs font-semibold">Incorrecto</span>

                                </div>

                              )}

                            </div>

                          )}

                        </div>

                      )}

                      {!situacion && (

                        <p className="text-xs text-neutral-500 italic mt-2">Arrastra una situación aquí</p>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

<div className="space-y-4">

              <h4 className="font-semibold text-neutral-900 mb-3">Situación Práctica</h4>

              <div className="space-y-3">

                {situacionesPracticas.map((situacion) => {

                  const estaDisponible = situacionesDisponibles.includes(situacion.id);

                  const estaAsignado = Object.values(respuestas).includes(situacion.id);

if (!estaDisponible && estaAsignado) {

                    return null;

                  }

return (

                    <div

                      key={situacion.id}

                      draggable={estaDisponible}

                      onDragStart={(e) => handleDragStart(e, situacion.id)}

                      onContextMenu={handleContextMenu}

                      className={`px-4 py-3 rounded-lg border-2 transition-all select-none ${estaDisponible

                        ? 'bg-white border-neutral-300 hover:border-neutral-900 hover:shadow-md active:opacity-70 cursor-move'

                        : 'bg-neutral-100 border-neutral-200 opacity-50 cursor-not-allowed'

                        }`}

                    >

                      <p className="text-sm text-neutral-900">{situacion.texto}</p>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>

{validado && respuestasCorrectas === pasosCiclo.length && (

            <div className="mt-6 bg-green-50 border-l-4 border-green-600 pl-4 py-3 rounded">

              <p className="text-green-800 font-semibold">

                "Brindar una gran experiencia en cada paso del ciclo del servicio o momento de verdad, nos acerca a convertir a nuestros clientes en auténticos fans de nuestra marca"

              </p>

            </div>

          )}

<div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-neutral-200">

            <Button

              onClick={() => setValidado(true)}

              disabled={!todasRespondidas || validado}

              className={`px-6 py-3 ${todasRespondidas && !validado

                ? 'bg-blue-600 hover:bg-blue-700 text-white'

                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'

                }`}

            >

              Validar Respuestas

            </Button>

            {validado && (

              <div className="flex-1">

                <p className="text-sm text-neutral-700 mb-2">

                  Respuestas correctas: <span className="font-bold">{respuestasCorrectas}/{pasosCiclo.length}</span>

                </p>

              </div>

            )}

            <Button

              onClick={handleCompleteStep}

              disabled={!validado || respuestasCorrectas !== pasosCiclo.length}

              className={`px-8 py-3 flex items-center gap-2 ${validado && respuestasCorrectas === pasosCiclo.length

                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'

                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'

                }`}

            >

              Continuar a Evaluación

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        </div>

      </div>

<div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/atencion-cliente/unidad1')}

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

export default AtencionClienteUnidad1TallerPage;


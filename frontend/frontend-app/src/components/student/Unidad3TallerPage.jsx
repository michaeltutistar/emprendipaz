import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, RotateCcw, ClipboardList, BookOpen, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Función para aleatorizar array

const shuffleArray = (array) => {

  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

  }

  return shuffled;

};

const variablesMarketing = [

  { id: 'producto', numero: 1, nombre: 'Producto' },

  { id: 'precio', numero: 2, nombre: 'Precio' },

  { id: 'plaza', numero: 3, nombre: 'Plaza' },

  { id: 'promocion', numero: 4, nombre: 'Promoción' },

  { id: 'gestion-administrativa', numero: 5, nombre: 'Gestión administrativa' },

  { id: 'fidelizacion-clientes', numero: 6, nombre: 'Fidelización de clientes' }

];

const interrogantesIniciales = [

  {

    id: 'i1',

    texto: '¿Qué características tendrá el producto?',

    respuestaCorrecta: 'producto'

  },

  {

    id: 'i2',

    texto: '¿Qué estrategia aplicarías para definir el valor monetario de tu producto?',

    respuestaCorrecta: 'precio'

  },

  {

    id: 'i3',

    texto: '¿Qué canales de distribución usarías (tiendas físicas, comercio electrónico, exportación)?',

    respuestaCorrecta: 'plaza'

  },

  {

    id: 'i4',

    texto: '¿Qué medios y mensajes usarías para comunicar el producto al público objetivo?',

    respuestaCorrecta: 'promocion'

  },

  {

    id: 'i5',

    texto: '¿Cómo puedo organizar eficientemente las actividades de mi equipo de trabajo?',

    respuestaCorrecta: 'gestion-administrativa'

  },

  {

    id: 'i6',

    texto: '¿Qué acciones me permitirán retener a más clientes?',

    respuestaCorrecta: 'fidelizacion-clientes'

  }

];

const Unidad3TallerPage = () => {

  const navigate = useNavigate();

  const [interrogantesAleatorios, setInterrogantesAleatorios] = useState(() => {

    const saved = localStorage.getItem('u3_taller_interrogantes');

    if (saved) {

      return JSON.parse(saved);

    }

    return shuffleArray(interrogantesIniciales);

  });

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('u3_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [interrogantesDisponibles, setInterrogantesDisponibles] = useState(() => {

    const saved = localStorage.getItem('u3_taller_disponibles');

    if (saved) {

      return JSON.parse(saved);

    }

    return interrogantesAleatorios.map(i => i.id);

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('u3_taller_validado');

    return saved === 'true';

  });

  const [draggedInterrogante, setDraggedInterrogante] = useState(null);

  const [dragOver, setDragOver] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const [mostrarReflexion, setmostrarReflexion] = useState(false);

  const isScrolledRef = useRef(false);

useEffect(() => {

    window.scrollTo(0, 0);

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

    localStorage.setItem('u3_taller_interrogantes', JSON.stringify(interrogantesAleatorios));

  }, [interrogantesAleatorios]);

useEffect(() => {

    localStorage.setItem('u3_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('u3_taller_disponibles', JSON.stringify(interrogantesDisponibles));

  }, [interrogantesDisponibles]);

useEffect(() => {

    localStorage.setItem('u3_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, interroganteId) => {

    setDraggedInterrogante(interroganteId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, variableId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(variableId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, variableId) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedInterrogante) return;

// Si se cambia una respuesta después de validar, resetear validado

    if (validado) {

      setValidado(false);

      setmostrarReflexion(false);

    }

// Si la variable ya tiene una respuesta, devolver el interrogante anterior a disponibles

    if (respuestas[variableId]) {

      setInterrogantesDisponibles(prev => [...prev, respuestas[variableId]]);

    }

// Asignar el nuevo interrogante a la variable

    setRespuestas(prev => ({

      ...prev,

      [variableId]: draggedInterrogante

    }));

// Remover el interrogante de disponibles

    setInterrogantesDisponibles(prev => prev.filter(id => id !== draggedInterrogante));

setDraggedInterrogante(null);

  };

const handleRemoveAnswer = (variableId) => {

    const interroganteId = respuestas[variableId];

    if (interroganteId) {

      setInterrogantesDisponibles(prev => [...prev, interroganteId]);

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[variableId];

        return newRespuestas;

      });

      setValidado(false);

      setmostrarReflexion(false);

    }

  };

const handleValidate = () => {

    setValidado(true);

    setmostrarReflexion(true);

  };

const handleReset = () => {

    setRespuestas({});

    setInterrogantesDisponibles(interrogantesAleatorios.map(i => i.id));

    setValidado(false);

    setmostrarReflexion(false);

    localStorage.removeItem('u3_taller_respuestas');

    localStorage.removeItem('u3_taller_disponibles');

    localStorage.removeItem('u3_taller_validado');

  };

const todasRespondidas = Object.keys(respuestas).length === variablesMarketing.length;

const esRespuestaCorrecta = (variableId) => {

    if (!validado) return false;

    const interroganteId = respuestas[variableId];

    const interrogante = interrogantesAleatorios.find(i => i.id === interroganteId);

    return interrogante && interrogante.respuestaCorrecta === variableId;

  };

const esRespuestaIncorrecta = (variableId) => {

    if (!validado) return false;

    const interroganteId = respuestas[variableId];

    if (!interroganteId) return false;

    const interrogante = interrogantesAleatorios.find(i => i.id === interroganteId);

    return interrogante && interrogante.respuestaCorrecta !== variableId;

  };

const respuestasCorrectasCount = variablesMarketing.filter(v => esRespuestaCorrecta(v.id)).length;

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing y Comercialización',

          paso_nombre: 'Unidad 3: Taller',

          curso_nombre: 'Marketing y Comercialización'

        })

      });

      navigate('/student/unidad3/cierre');

    } catch (error) {

      navigate('/student/unidad3/cierre');

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

{/* Título centrado al hacer scroll */}

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

                      Unidad 3 · Taller

                    </p>

                  </div>

                </motion.div>

              )}

{/* Usuario */}

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

              onClick={() => navigate('/student/presentacion-modulo')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Marketing y Comercialización

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Estrategias de comercialización

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

                onClick={() => navigate('/student/presentacion-modulo')}

                className="hover:text-white transition-colors"

              >

                Marketing y Comercialización

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 3 · Taller</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Marketing y Comercialización

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

              Taller: estrategias de marketing

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Vamos a poner en práctica los conocimientos adquiridos en esta unidad final de nuestro modulo de marketing y comercialización.

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

      <div className="max-w-7xl mx-auto px-8 py-12">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100"

        >

          <div className="mb-8">

            <div className="flex items-center gap-3 mb-4">

              <ClipboardList className="w-6 h-6 text-[#006837]" />

              <h3

                className="text-[#006837]"

                style={{

                  fontFamily: 'var(--font-heading)',

                  fontSize: '1.5rem',

                  fontWeight: 600,

                }}

              >

                Taller: estrategias de marketing

              </h3>

            </div>

            <p className="text-gray-700 leading-relaxed mb-4">

              Vamos a poner en práctica los conocimientos adquiridos en esta unidad final de nuestro modulo de marketing y comercialización.

            </p>

            <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-r-lg">

              <p className="text-neutral-800 font-semibold mb-2">Instrucción del taller:</p>

              <p className="text-neutral-700 text-sm md:text-base">

                Para está actividad deberás arrastrar los interrogantes de la derecha hacia la izquierda para establecer a qué estrategia de marketing corresponden.

              </p>

            </div>

          </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* Columna izquierda: Variables del mix de marketing */}

            <div className="space-y-4">

              <h4 className="font-semibold text-gray-900 mb-3">Variable del mix de marketing</h4>

              {variablesMarketing.map((variable) => {

                const interroganteId = respuestas[variable.id];

                const interrogante = interroganteId ? interrogantesAleatorios.find(i => i.id === interroganteId) : null;

                const esCorrecta = esRespuestaCorrecta(variable.id);

                const esIncorrecta = esRespuestaIncorrecta(variable.id);

return (

                  <div

                    key={variable.id}

                    onDragOver={(e) => handleDragOver(e, variable.id)}

                    onDragLeave={handleDragLeave}

                    onDrop={(e) => handleDrop(e, variable.id)}

                    onContextMenu={handleContextMenu}

                    className={`min-h-[100px] p-4 rounded-lg border-2 transition-all select-none ${dragOver === variable.id

                      ? 'border-gray-900 bg-gray-100 border-dashed'

                      : interroganteId

                        ? esCorrecta

                          ? 'border-green-500 bg-green-50'

                          : esIncorrecta

                            ? 'border-red-500 bg-red-50'

                            : 'border-gray-300 bg-gray-50'

                        : 'border-gray-200 bg-white border-dashed'

                      }`}

                  >

                    <p className="text-sm font-semibold text-gray-900 mb-3">{variable.numero}. {variable.nombre}</p>

                    {interroganteId ? (

                      <div className="flex items-center justify-between">

                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${esCorrecta

                          ? 'bg-green-100 text-green-800'

                          : esIncorrecta

                            ? 'bg-red-100 text-red-800'

                            : 'bg-gray-200 text-gray-700'

                          }`}>

                          {validado && (

                            <>

                              {esCorrecta ? (

                                <CheckCircle className="w-4 h-4" />

                              ) : (

                                <XCircle className="w-4 h-4" />

                              )}

                            </>

                          )}

                          <span className="text-sm">{interrogante.texto}</span>

                        </div>

                        {!validado && (

                          <button

                            onClick={() => handleRemoveAnswer(variable.id)}

                            className="text-xs text-gray-500 hover:text-gray-700 underline"

                          >

                            Quitar

                          </button>

                        )}

                        {validado && esIncorrecta && (

                          <button

                            onClick={() => handleRemoveAnswer(variable.id)}

                            className="text-xs text-red-600 hover:text-red-800 underline"

                          >

                            Quitar

                          </button>

                        )}

                      </div>

                    ) : (

                      <p className="text-xs text-gray-400 italic">Arrastra un interrogante aquí</p>

                    )}

                  </div>

                );

              })}

            </div>

{/* Columna derecha: Interrogantes disponibles */}

            <div className="space-y-4">

              <h4 className="font-semibold text-gray-900 mb-3">Interrogante</h4>

              <div className="space-y-3">

                {interrogantesAleatorios.map((interrogante) => {

                  const estaDisponible = interrogantesDisponibles.includes(interrogante.id);

                  const estaAsignada = Object.values(respuestas).includes(interrogante.id);

if (!estaDisponible && estaAsignada) {

                    return null;

                  }

return (

                    <div

                      key={interrogante.id}

                      draggable={estaDisponible}

                      onDragStart={estaDisponible ? (e) => handleDragStart(e, interrogante.id) : undefined}

                      onContextMenu={handleContextMenu}

                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-move select-none ${estaDisponible

                        ? 'bg-white border-gray-300 hover:border-gray-900 hover:shadow-md active:opacity-70'

                        : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'

                        }`}

                    >

                      <span className="text-sm text-gray-900">{interrogante.texto}</span>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>

{/* Botones de acción */}

          <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">

            <Button

              onClick={handleValidate}

              disabled={!todasRespondidas || validado}

              className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"

            >

              Verificar respuestas

            </Button>

            <Button

              onClick={handleReset}

              variant="outline"

              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 flex items-center gap-2"

            >

              <RotateCcw className="w-4 h-4" />

              Reiniciar

            </Button>

          </div>

{/* Resultado */}

          {validado && (

            <div className={`mt-4 p-4 rounded-lg border-2 ${respuestasCorrectasCount === variablesMarketing.length

              ? 'bg-green-50 border-green-500'

              : 'bg-amber-50 border-amber-500'

              }`}>

              <p className="font-semibold text-gray-900 mb-2">

                {respuestasCorrectasCount === variablesMarketing.length

                  ? '¡Excelente! Has completado correctamente el taller.'

                  : `Has respondido correctamente ${respuestasCorrectasCount} de ${variablesMarketing.length} preguntas.`}

              </p>

              {respuestasCorrectasCount < variablesMarketing.length && (

                <p className="text-sm text-gray-700">

                  Revisa las respuestas incorrectas y vuelve a intentar.

                </p>

              )}

            </div>

          )}

{/* Reflexión final */}

          {mostrarReflexion && (

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-600 p-5 rounded-r-lg">

              <p className="text-neutral-800 font-semibold mb-2">Reflexión final:</p>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                Cuando conoces tu negocio por dentro y por fuera, defines con claridad hacia dónde quieres ir y aplicas estrategias de comercialización coherentes, tu emprendimiento no solo vende: crece, inspira y se convierte en una marca que deja huella.

              </p>

            </div>

          )}

{/* Botón Siguiente */}

          <div className="flex justify-end mt-6">

            <Button

              onClick={handleCompleteStep}

              disabled={!validado || respuestasCorrectasCount < variablesMarketing.length}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!validado || respuestasCorrectasCount < variablesMarketing.length ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        </motion.div>

      </div>

{/* Back button */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/unidad3/desarrollo')}

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

export default Unidad3TallerPage;


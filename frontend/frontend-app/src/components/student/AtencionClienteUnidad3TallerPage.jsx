import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, ChevronDown, LogOut, X } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const tiposClientes = [

  {

    id: 'exigente',

    nombre: 'Cliente exigente',

    solucionCorrecta: 'solucion_exigente'

  },

  {

    id: 'indeciso',

    nombre: 'Cliente indeciso',

    solucionCorrecta: 'solucion_indeciso'

  },

  {

    id: 'perfeccionista',

    nombre: 'Cliente perfeccionista',

    solucionCorrecta: 'solucion_perfeccionista'

  },

  {

    id: 'insatisfecho_recurrente',

    nombre: 'Cliente insatisfecho recurrente',

    solucionCorrecta: 'solucion_insatisfecho_recurrente'

  },

  {

    id: 'silencioso',

    nombre: 'Cliente silencioso o poco expresivo',

    solucionCorrecta: 'solucion_silencioso'

  }

];

const solucionesDisponibles = [

  {

    id: 'solucion_exigente',

    texto: 'Se escuchó con atención y se dio una respuesta rápida y clara para dejarlo satisfecho.'

  },

  {

    id: 'solucion_indeciso',

    texto: 'Se le explicó con palabras simples, se hicieron preguntas cortas y se confirmó varias veces lo que quería.'

  },

  {

    id: 'solucion_perfeccionista',

    texto: 'Se agradeció su cuidado en los detalles y se ofreció una nueva solución para que quedara conforme.'

  },

  {

    id: 'solucion_insatisfecho_recurrente',

    texto: 'Se revisaron sus quejas anteriores, se mostraron mejoras reales y se le dio un trato especial.'

  },

  {

    id: 'solucion_silencioso',

    texto: 'Se hicieron preguntas abiertas, se explicó paso a paso la solución y se le dio confianza para hablar.'

  }

];

const AtencionClienteUnidad3TallerPage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('ac_u3_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [solucionesDisponiblesState, setSolucionesDisponiblesState] = useState(() => {

    const saved = localStorage.getItem('ac_u3_taller_disponibles');

    if (saved) {

      const savedIds = JSON.parse(saved);

      return [...new Set(savedIds)];

    }

    return [...new Set(solucionesDisponibles.map(s => s.id))];

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('ac_u3_taller_validado');

    return saved === 'true';

  });

  const [mostrarReflexion, setmostrarReflexion] = useState(validado);

  const [draggedSolucion, setDraggedSolucion] = useState(null);

  const [dragOver, setDragOver] = useState(null);

  const [resultadoValidacion, setResultadoValidacion] = useState(null);

  const [mostrarValidacion, setmostrarValidacion] = useState(false);

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

          const newIsScrolled = scrollPosition > 100;

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

    localStorage.setItem('ac_u3_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('ac_u3_taller_disponibles', JSON.stringify(solucionesDisponiblesState));

  }, [solucionesDisponiblesState]);

useEffect(() => {

    localStorage.setItem('ac_u3_taller_validado', validado.toString());

    if (validado) {

      setmostrarReflexion(true);

    }

  }, [validado]);

const handleDragStart = (e, solucionId) => {

    setDraggedSolucion(solucionId);

    e.dataTransfer.effectAllowed = 'move';

  };

const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, tipoClienteId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(tipoClienteId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, tipoClienteId) => {

    e.preventDefault();

    if (draggedSolucion) {

      const solucion = solucionesDisponibles.find(s => s.id === draggedSolucion);

      if (solucion) {

        // Remover del tipo de cliente anterior si existe

        const nuevaRespuestas = { ...respuestas };

        Object.keys(nuevaRespuestas).forEach(key => {

          if (nuevaRespuestas[key] === draggedSolucion) {

            delete nuevaRespuestas[key];

          }

        });

// Agregar al nuevo tipo de cliente

        nuevaRespuestas[tipoClienteId] = draggedSolucion;

        setRespuestas(nuevaRespuestas);

// Remover de disponibles

        setSolucionesDisponiblesState(prev => prev.filter(id => id !== draggedSolucion));

      }

    }

    setDraggedSolucion(null);

    setDragOver(null);

  };

const handleRemove = (tipoClienteId) => {

    const solucionId = respuestas[tipoClienteId];

    if (solucionId) {

      const nuevaRespuestas = { ...respuestas };

      delete nuevaRespuestas[tipoClienteId];

      setRespuestas(nuevaRespuestas);

      setSolucionesDisponiblesState([...solucionesDisponiblesState, solucionId]);

    }

  };

const validarRespuestas = () => {

    const resultados = {};

    let todasCorrectas = true;

tiposClientes.forEach(tipoCliente => {

      const solucionId = respuestas[tipoCliente.id];

      if (solucionId) {

        const esCorrecta = solucionId === tipoCliente.solucionCorrecta;

        resultados[tipoCliente.id] = esCorrecta;

        if (!esCorrecta) {

          todasCorrectas = false;

        }

      } else {

        todasCorrectas = false;

        resultados[tipoCliente.id] = false;

      }

    });

setResultadoValidacion(resultados);

    setmostrarValidacion(true);

if (todasCorrectas) {

      setValidado(true);

      setmostrarReflexion(true);

    }

  };

const reiniciar = () => {

    setRespuestas({});

    setSolucionesDisponiblesState([...new Set(solucionesDisponibles.map(s => s.id))]);

    setValidado(false);

    setmostrarReflexion(false);

    setResultadoValidacion(null);

    setmostrarValidacion(false);

    localStorage.removeItem('ac_u3_taller_respuestas');

    localStorage.removeItem('ac_u3_taller_disponibles');

    localStorage.removeItem('ac_u3_taller_validado');

  };

const allTiposCompletos = () => {

    return tiposClientes.every(tipoCliente => respuestas[tipoCliente.id]);

  };

const handleCompleteStep = async () => {

    if (!validado) {

      if (!allTiposCompletos()) {

        alert('Por favor completa todos los tipos de clientes antes de continuar.');

        return;

      }

      validarRespuestas();

      return;

    }

try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Atención al Cliente y Resolución de Conflictos',

          paso_nombre: 'Unidad 3: Taller',

          curso_nombre: 'Atención al Cliente'

        })

      });

      navigate('/student/atencion-cliente/unidad3/cierre');

    } catch (error) {

      navigate('/student/atencion-cliente/unidad3/cierre');

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

                      Atención al Cliente

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

              Resolución de Conflictos

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

              MÓDULO: Atención al Cliente y Resolución de Conflictos

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

              Taller: solucionando las objeciones de clientes difíciles

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

{/* Main Content */}

      <div className="max-w-7xl mx-auto px-8 py-6">

        {/* Introducción */}

        <div className="mb-6">

          <p className="text-neutral-700 text-base leading-relaxed mb-4">

            Vamos a poner en práctica los conocimientos adquiridos en esta unidad final del modulo Atención al Cliente y Resolución de Conflictos.

          </p>

        </div>

{/* Instrucciones */}

        <div className="mb-6">

          <h3 className="text-lg font-semibold text-neutral-900 mb-3">Instrucción del taller:</h3>

          <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 mb-3">

            <p className="text-neutral-700 text-sm md:text-base mb-2">

              En la primera actividad deberás arrastrar los elementos de la derecha, que representan la solución a una objeción de un tipo de cliente difícil, hacia la columna de la izquierda.

            </p>

          </div>

        </div>

{/* Tabla de Drag and Drop */}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Columna Izquierda - Tipos de Clientes */}

            <div className="bg-gray-100 p-4">

              <h4 className="text-lg font-bold mb-4 text-center text-neutral-900">Tipo de cliente difícil</h4>

              <div className="space-y-3">

                {tiposClientes.map((tipoCliente) => {

                  const solucionId = respuestas[tipoCliente.id];

                  const solucion = solucionId ? solucionesDisponibles.find(s => s.id === solucionId) : null;

                  const isDragOver = dragOver === tipoCliente.id;

                  const esCorrecta = mostrarValidacion && resultadoValidacion && resultadoValidacion[tipoCliente.id];

                  const esIncorrecta = mostrarValidacion && resultadoValidacion && !resultadoValidacion[tipoCliente.id] && solucion;

return (

                    <div

                      key={tipoCliente.id}

                      onDragOver={(e) => handleDragOver(e, tipoCliente.id)}

                      onDragLeave={handleDragLeave}

                      onDrop={(e) => handleDrop(e, tipoCliente.id)}

                      className={`min-h-[100px] p-3 rounded border-2 border-dashed transition-all ${esCorrecta

                        ? 'border-green-500 bg-green-50'

                        : esIncorrecta

                          ? 'border-red-500 bg-red-50'

                          : isDragOver

                            ? 'border-yellow-400 bg-yellow-50'

                            : solucion

                              ? 'border-gray-300 bg-white'

                              : 'border-gray-300 bg-white'

                        }`}

                    >

                      <div className={`font-semibold mb-2 ${esCorrecta ? 'text-green-700' : esIncorrecta ? 'text-red-700' : 'text-neutral-900'}`}>

                        {tipoCliente.nombre}

                        {esCorrecta && (

                          <span className="ml-2 text-green-600">✓</span>

                        )}

                        {esIncorrecta && (

                          <span className="ml-2 text-red-600">✗</span>

                        )}

                      </div>

                      {solucion ? (

                        <div className={`rounded p-2 flex items-start justify-between gap-2 ${esCorrecta

                          ? 'bg-green-100 border border-green-300'

                          : esIncorrecta

                            ? 'bg-red-100 border border-red-300'

                            : 'bg-gray-50 border border-gray-200'

                          }`}>

                          <p className={`text-sm flex-1 ${esCorrecta ? 'text-green-800' : esIncorrecta ? 'text-red-800' : 'text-neutral-700'

                            }`}>{solucion.texto}</p>

                          <button

                            onClick={() => handleRemove(tipoCliente.id)}

                            className={`transition-colors flex-shrink-0 ${esCorrecta || esIncorrecta

                              ? 'text-gray-500 hover:text-gray-700'

                              : 'text-gray-500 hover:text-red-500'

                              }`}

                            title="Remover"

                            disabled={!mostrarValidacion || esCorrecta}

                          >

                            <X className="w-4 h-4" />

                          </button>

                        </div>

                      ) : (

                        <p className="text-sm text-gray-500 italic">Arrastra una solución aquí</p>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

{/* Columna Derecha - Soluciones Disponibles */}

            <div className="bg-gray-50 p-4">

              <h4 className="text-lg font-bold mb-4 text-center text-neutral-900">Soluciones</h4>

              <div className="space-y-3">

                {solucionesDisponibles

                  .filter(solucion => solucionesDisponiblesState.includes(solucion.id))

                  .map((solucion) => (

                    <div

                      key={solucion.id}

                      draggable

                      onDragStart={(e) => handleDragStart(e, solucion.id)}

                      onContextMenu={handleContextMenu}

                      className="bg-white border-2 border-gray-300 rounded p-3 cursor-move hover:border-[#AA27B9] hover:shadow-md transition-all"

                    >

                      <p className="text-sm text-neutral-700">{solucion.texto}</p>

                    </div>

                  ))}

                {solucionesDisponiblesState.length === 0 && (

                  <div className="text-center text-gray-500 py-8">

                    <p className="text-sm">Todas las soluciones han sido asignadas</p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

{/* Mensaje de éxito */}

        {validado && (

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.5 }}

            className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6"

          >

            <p className="text-green-800 text-base md:text-lg font-semibold text-center">

              ¡Excelente! Has completado correctamente el taller.

            </p>

          </motion.div>

        )}

{/* Reflexión Final */}

        {mostrarReflexion && (

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.5 }}

            className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 mb-6"

          >

            <p className="text-neutral-700 text-sm md:text-base font-semibold mb-2">

              Esta sería la reflexión final que la aparece al participante una vez culminado el taller:

            </p>

            <p className="text-neutral-800 text-base md:text-lg italic">

              "Cada cliente difícil representa un reto que nos invita a crecer y a mejorar nuestros procesos. Si aprendemos a escucharlos, a responder con claridad y a ofrecer soluciones adecuadas, convertimos la inconformidad en confianza y la exigencia en oportunidades de aprendizaje."

            </p>

          </motion.div>

        )}

{/* Botones de acción */}

        <div className="flex justify-end gap-4 mt-8">

          {mostrarValidacion && !validado && (

            <Button

              onClick={() => {

                setmostrarValidacion(false);

                setResultadoValidacion(null);

              }}

              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"

            >

              Corregir

            </Button>

          )}

          {!validado && (

            <Button

              onClick={reiniciar}

              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-2"

            >

              Reiniciar

            </Button>

          )}

          <Button

            onClick={handleCompleteStep}

            disabled={!allTiposCompletos() || (mostrarValidacion && !validado)}

            className={`px-8 py-4 flex items-center gap-2 ${!allTiposCompletos() || (mostrarValidacion && !validado)

              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'

              : validado

                ? 'bg-[#AA27B9] hover:bg-[#9d24ab] text-white'

                : 'bg-blue-600 hover:bg-blue-700 text-white'

              }`}

          >

            {validado ? 'Continuar a Evaluación' : allTiposCompletos() ? 'Verificar respuestas' : 'Completa todos los tipos de clientes'}

            {!validado && allTiposCompletos() && !mostrarValidacion && (

              <ChevronRight className="w-5 h-5" />

            )}

          </Button>

        </div>

      </div>

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/atencion-cliente/unidad3/desarrollo');

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

export default AtencionClienteUnidad3TallerPage;


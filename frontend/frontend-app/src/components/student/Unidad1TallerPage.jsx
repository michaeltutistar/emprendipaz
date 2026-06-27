import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, ChevronDown, LogOut, X } from 'lucide-react';

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

// Elementos DOFA

const elementosDofa = [

  { id: 'fortaleza', nombre: 'Fortaleza' },

  { id: 'debilidad', nombre: 'Debilidad' },

  { id: 'oportunidad', nombre: 'Oportunidad' },

  { id: 'amenaza', nombre: 'Amenaza' }

];

// Opciones para arrastrar (se aleatorizarán al cargar)

const opcionesIniciales = [

  {

    id: 'competencia-precios',

    texto: 'Competencia con precios más bajos',

    respuestaCorrecta: 'amenaza'

  },

  {

    id: 'aumento-demanda',

    texto: 'Aumento de demanda de productos caseros en redes sociales',

    respuestaCorrecta: 'oportunidad'

  },

  {

    id: 'poca-presencia',

    texto: 'Poca presencia en redes sociales',

    respuestaCorrecta: 'debilidad'

  },

  {

    id: 'recetas-exclusivas',

    texto: 'Recetas exclusivas en la región con clientela fiel',

    respuestaCorrecta: 'fortaleza'

  }

];

const Unidad1TallerPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const [opcionesAleatorias, setOpcionesAleatorias] = useState(() => {

    const saved = localStorage.getItem('unidad1_taller_opciones');

    if (saved) {

      return JSON.parse(saved);

    }

    return shuffleArray(opcionesIniciales);

  });

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('unidad1_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [opcionesDisponibles, setOpcionesDisponibles] = useState(() => {

    const saved = localStorage.getItem('unidad1_taller_disponibles');

    if (saved) {

      return JSON.parse(saved);

    }

    return opcionesAleatorias.map(o => o.id);

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('unidad1_taller_validado');

    return saved === 'true';

  });

  const [draggedOpcion, setDraggedOpcion] = useState(null);

  const [dragOver, setDragOver] = useState(null);

  const [mostrarReflexion, setmostrarReflexion] = useState(false);

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

useEffect(() => {

    localStorage.setItem('unidad1_taller_opciones', JSON.stringify(opcionesAleatorias));

  }, [opcionesAleatorias]);

useEffect(() => {

    localStorage.setItem('unidad1_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('unidad1_taller_disponibles', JSON.stringify(opcionesDisponibles));

  }, [opcionesDisponibles]);

useEffect(() => {

    localStorage.setItem('unidad1_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, opcionId) => {

    setDraggedOpcion(opcionId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, elementoId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(elementoId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, elementoId) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedOpcion) return;

// Si se cambia una respuesta después de validar, resetear validado

    if (validado) {

      setValidado(false);

      setmostrarReflexion(false);

    }

// Si ya hay una respuesta en está elemento, devolverla a disponibles

    if (respuestas[elementoId]) {

      setOpcionesDisponibles(prev => [...prev, respuestas[elementoId]]);

    }

setRespuestas(prev => ({

      ...prev,

      [elementoId]: draggedOpcion

    }));

setOpcionesDisponibles(prev => prev.filter(id => id !== draggedOpcion));

    setDraggedOpcion(null);

  };

const handleRemoveAnswer = (elementoId) => {

    const opcionId = respuestas[elementoId];

    if (opcionId) {

      setOpcionesDisponibles(prev => [...prev, opcionId]);

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[elementoId];

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

    setOpcionesDisponibles(opcionesAleatorias.map(o => o.id));

    setValidado(false);

    setmostrarReflexion(false);

    localStorage.removeItem('unidad1_taller_respuestas');

    localStorage.removeItem('unidad1_taller_disponibles');

    localStorage.removeItem('unidad1_taller_validado');

  };

const todasRespondidas = Object.keys(respuestas).length === elementosDofa.length;

  const respuestasCorrectasCount = elementosDofa.filter(e => {

    const opcionId = respuestas[e.id];

    const opcion = opcionesAleatorias.find(o => o.id === opcionId);

    return opcion && opcion.respuestaCorrecta === e.id;

  }).length;

const esRespuestaCorrecta = (elementoId) => {

    if (!validado) return false;

    const opcionId = respuestas[elementoId];

    const opcion = opcionesAleatorias.find(o => o.id === opcionId);

    return opcion && opcion.respuestaCorrecta === elementoId;

  };

const esRespuestaIncorrecta = (elementoId) => {

    if (!validado) return false;

    const opcionId = respuestas[elementoId];

    if (!opcionId) return false;

    const opcion = opcionesAleatorias.find(o => o.id === opcionId);

    return opcion && opcion.respuestaCorrecta !== elementoId;

  };

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing y Comercialización',

          paso_nombre: 'Unidad 1: Taller',

          curso_nombre: 'Marketing y Comercialización'

        })

      });

      navigate('/student/unidad1/evaluacion');

    } catch (error) {

      navigate('/student/unidad1/evaluacion');

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

                      Unidad 1 · Taller DOFA

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

              onClick={() => navigate('/student/presentacion-modulo')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Marketing y Comercialización

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#006837] font-semibold">

              Unidad 1 · Taller DOFA

            </span>

          </div>

        </div>

      </motion.div>

{/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] pt-8 pb-16 px-8">

        <div className="absolute inset-0 overflow-hidden">

          <motion.div

            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"

            style={{ background: 'radial-gradient(circle, #FFEB3B 0%, transparent 70%)' }}

            animate={{ scale: [1, 1.2, 1] }}

            transition={{ duration: 15, repeat: Infinity }}

          />

        </div>

<div className="max-w-7xl mx-auto relative z-10">

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

                onClick={() => navigate('/student/presentacion-modulo')}

                className="hover:text-white transition-colors"

              >

                Marketing y Comercialización

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 1 · Taller Matriz DOFA</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-2">

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

              Taller: matriz DOFA

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base">

              Identifica los elementos de la matriz DOFA para un negocio de postres artesanales de Tumaco.

            </p>

          </motion.div>

        </div>

<div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path

              d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z"

              fill="white"

            />

          </svg>

        </div>

      </section>

{/* PASOS - STICKY */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-4 sm:px-8">

          <div className="flex items-center justify-between relative">

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-300 z-0"

              initial={{ width: 0 }}

              animate={{ width: '66.66%' }}

              transition={{ duration: 1 }}

            />

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-400 text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                1

              </div>

              <p className="text-[10px] text-gray-500">Presentación</p>

            </div>

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-400 text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                2

              </div>

              <p className="text-[10px] text-gray-500">Fundamentación</p>

            </div>

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: 'spring', stiffness: 200 }}

                className="bg-gradient-to-br from-emerald-500 to-emerald-400 text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                3

              </motion.div>

              <p className="text-[10px] text-emerald-700 font-bold">Taller</p>

            </div>

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

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          {/* Introducción */}

          <div className="mb-8">

            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Taller: matriz DOFA</h2>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg mb-6">

              <p className="text-neutral-800 font-semibold mb-2">Definición:</p>

              <p className="text-neutral-700 mb-4 text-sm md:text-base">

                La matriz DOFA (también conocida como FODA) es una herramienta de planificación estratégica utilizada para evaluar Fortalezas (F) y Debilidades (D) como factores internos, así como Oportunidades (O) y Amenazas (A) como factores externos.

              </p>

              <p className="text-neutral-800 font-semibold mb-2">Ejemplo breve:</p>

              <ul className="list-disc list-inside space-y-1 text-neutral-700 text-sm md:text-base">

                <li><strong>Fortalezas:</strong> Buen servicio al cliente.</li>

                <li><strong>Debilidades:</strong> Poco capital de inversión.</li>

                <li><strong>Oportunidades:</strong> Crecimiento del mercado digital.</li>

                <li><strong>Amenazas:</strong> Competencia con grandes empresas.</li>

              </ul>

            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-r-lg">

              <p className="text-neutral-800 font-semibold mb-2">Instrucción del taller:</p>

              <p className="text-neutral-700 text-sm md:text-base">

                Ayuda a un negocio de postres artesanales de Tumaco a desarrollar su matriz DOFA. Arrastra las opciones de la columna derecha hacia los elementos DOFA de la columna izquierda para identificar si cada opción es una Fortaleza, Debilidad, Oportunidad o Amenaza.

              </p>

            </div>

          </div>

{/* Grid de Drag and Drop */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Columna izquierda: Elementos DOFA */}

            <div className="space-y-4">

              <h4 className="font-semibold text-neutral-900 mb-3">Elemento DOFA</h4>

              {elementosDofa.map((elemento) => {

                const opcionId = respuestas[elemento.id];

                const opcion = opcionId ? opcionesAleatorias.find(o => o.id === opcionId) : null;

                const esCorrecta = esRespuestaCorrecta(elemento.id);

                const esIncorrecta = esRespuestaIncorrecta(elemento.id);

return (

                  <div

                    key={elemento.id}

                    onDragOver={(e) => handleDragOver(e, elemento.id)}

                    onDragLeave={handleDragLeave}

                    onDrop={(e) => handleDrop(e, elemento.id)}

                    onContextMenu={handleContextMenu}

                    className={`min-h-[100px] p-4 rounded-lg border-2 transition-all select-none ${dragOver === elemento.id

                      ? 'border-neutral-900 bg-neutral-100 border-dashed'

                      : opcionId

                        ? esCorrecta

                          ? 'border-green-500 bg-green-50'

                          : esIncorrecta

                            ? 'border-red-500 bg-red-50'

                            : 'border-neutral-300 bg-neutral-50'

                        : 'border-neutral-200 bg-white border-dashed'

                      }`}

                  >

                    <p className="text-sm font-semibold text-neutral-900 mb-3">{elemento.nombre}</p>

                    {opcionId ? (

                      <div className="flex items-center justify-between">

                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${esCorrecta

                          ? 'bg-green-100 text-green-800'

                          : esIncorrecta

                            ? 'bg-red-100 text-red-800'

                            : 'bg-neutral-200 text-neutral-700'

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

                          <span className="text-sm">{opcion.texto}</span>

                        </div>

                        {!validado && (

                          <button

                            onClick={() => handleRemoveAnswer(elemento.id)}

                            className="text-xs text-neutral-500 hover:text-neutral-700 underline"

                          >

                            Quitar

                          </button>

                        )}

                        {validado && esIncorrecta && (

                          <button

                            onClick={() => handleRemoveAnswer(elemento.id)}

                            className="text-xs text-red-600 hover:text-red-800 underline"

                          >

                            Quitar

                          </button>

                        )}

                      </div>

                    ) : (

                      <p className="text-xs text-neutral-400 italic">Arrastra una opción aquí</p>

                    )}

                  </div>

                );

              })}

            </div>

{/* Columna derecha: Opciones disponibles */}

            <div className="space-y-4">

              <h4 className="font-semibold text-neutral-900 mb-3">Opciones</h4>

              <div className="space-y-3">

                {opcionesAleatorias.map((opcion) => {

                  const estaDisponible = opcionesDisponibles.includes(opcion.id);

                  const estaAsignada = Object.values(respuestas).includes(opcion.id);

if (!estaDisponible && estaAsignada) {

                    return null;

                  }

return (

                    <div

                      key={opcion.id}

                      draggable={estaDisponible}

                      onDragStart={estaDisponible ? (e) => handleDragStart(e, opcion.id) : undefined}

                      onContextMenu={handleContextMenu}

                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-move select-none ${estaDisponible

                        ? 'bg-white border-neutral-300 hover:border-neutral-900 hover:shadow-md active:opacity-70'

                        : 'bg-neutral-100 border-neutral-200 opacity-50 cursor-not-allowed'

                        }`}

                    >

                      <span className="text-sm text-neutral-900">{opcion.texto}</span>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>

{/* Botones de acción */}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">

            <Button

              onClick={handleValidate}

              disabled={!todasRespondidas}

              className={`bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 ${!todasRespondidas ? 'opacity-50 cursor-not-allowed' : ''

                }`}

            >

              Validar respuestas

            </Button>

            <Button

              onClick={handleReset}

              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4"

            >

              Reiniciar

            </Button>

          </div>

{/* Mensaje de reflexión */}

          {mostrarReflexion && (

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-5 rounded-r-lg mb-6">

              <p className="text-neutral-800 font-semibold mb-2">Reflexión final:</p>

              <p className="text-neutral-700 text-sm md:text-base leading-relaxed">

                Es importante que al realizar el diagnóstico DOFA, el emprendedor reconozca aspectos internos de su negocio (fortalezas y debilidades), al másmo tiempo que su entorno (oportunidades y amenazas), con está puede diseñar estrategias para diferenciarse de la competencia, así tener mejores herramientas para identificar al negocio y cliente.

              </p>

            </div>

          )}

{/* Botón Continuar */}

          {validado && respuestasCorrectasCount === elementosDofa.length && (

            <div className="flex justify-end">

              <Button

                onClick={handleCompleteStep}

                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 flex items-center gap-2"

              >

                Continuar

                <ChevronRight className="w-5 h-5" />

              </Button>

            </div>

          )}

        </div>

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/unidad1/desarrollo')}

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

export default Unidad1TallerPage;


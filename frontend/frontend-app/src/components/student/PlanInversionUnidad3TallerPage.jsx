import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, ChevronDown, LogOut, Check, X, RotateCcw } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Datos del ejercicio

const categorias = [

  { id: 'documentacion', texto: 'Documentación del plan', respuestaCorrecta: 'elemento4' },

  { id: 'implementacion', texto: 'Implementación', respuestaCorrecta: 'elemento3' },

  { id: 'seguimiento', texto: 'Seguimiento', respuestaCorrecta: 'elemento1' },

  { id: 'ajustes', texto: 'Ajustes', respuestaCorrecta: 'elemento2' }

];

const elementos = [

  { id: 'elemento1', texto: 'Indicadores mensuales' },

  { id: 'elemento2', texto: 'Plan B' },

  { id: 'elemento3', texto: 'Cronograma' },

  { id: 'elemento4', texto: 'Portada' }

];

const PlanInversionUnidad3TallerPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('plan_inversion_u3_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

const [elementosDisponibles, setElementosDisponibles] = useState(() => {

    const saved = localStorage.getItem('plan_inversion_u3_taller_disponibles');

    return saved ? JSON.parse(saved) : elementos.map(e => e.id);

  });

const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('plan_inversion_u3_taller_validado');

    return saved === 'true';

  });

const [completado, setCompletado] = useState(false);

  const [draggedElemento, setDraggedElemento] = useState(null);

  const [dragOver, setDragOver] = useState(null);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 100);

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

const handleLogout = async () => {

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

  };

useEffect(() => {

    localStorage.setItem('plan_inversion_u3_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('plan_inversion_u3_taller_disponibles', JSON.stringify(elementosDisponibles));

  }, [elementosDisponibles]);

useEffect(() => {

    localStorage.setItem('plan_inversion_u3_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, elementoId) => {

    setDraggedElemento(elementoId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, categoriaId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(categoriaId);

  };

const handleDrop = (e, categoriaId) => {

    e.preventDefault();

    setDragOver(null);

    if (!draggedElemento) return;

if (respuestas[categoriaId]) {

      setElementosDisponibles(prev => [...prev, respuestas[categoriaId]]);

    }

setRespuestas(prev => ({

      ...prev,

      [categoriaId]: draggedElemento

    }));

setElementosDisponibles(prev => prev.filter(id => id !== draggedElemento));

    setDraggedElemento(null);

    setValidado(false);

  };

const handleRemoveAnswer = (categoriaId) => {

    const elementoId = respuestas[categoriaId];

    if (elementoId) {

      setElementosDisponibles(prev => [...prev, elementoId]);

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[categoriaId];

        return newRespuestas;

      });

      setValidado(false);

    }

  };

const esCorrecta = (categoriaId) => {
    const respuesta = respuestas[categoriaId];
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria && respuesta === categoria.respuestaCorrecta;
  };

const handleValidate = () => {

    const todasRespondidas = categorias.every(c => respuestas[c.id]);

    if (!todasRespondidas) {

      alert('Por favor completa todas las respuestas antes de verificar.');

      return;

    }

    setValidado(true);

const todasCorrectas = categorias.every(c => esCorrecta(c.id));

    if (todasCorrectas) {

      setCompletado(true);

    } else {

      setCompletado(false);

    }

  };

const handleReset = () => {

    setRespuestas({});

    setElementosDisponibles(elementos.map(e => e.id));

    setValidado(false);

    setCompletado(false);

    localStorage.removeItem('plan_inversion_u3_taller_respuestas');

    localStorage.removeItem('plan_inversion_u3_taller_disponibles');

    localStorage.removeItem('plan_inversion_u3_taller_validado');

  };

const todasRespondidas = categorias.every(c => respuestas[c.id]);

  const respuestasCorrectas = categorias.filter(c => esCorrecta(c.id)).length;

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Plan de Inversión',

          paso_nombre: 'Unidad 3: Taller',

          curso_nombre: 'Plan de Inversión'

        })

      });

      navigate('/student/plan-inversion/unidad3/cierre');

    } catch (error) {

      console.error("Error al registrar progreso o navegar:", error);

      navigate('/student/plan-inversion/unidad3/cierre');

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

                    src="/formacion.png"

                    alt="Formación Logo"

                    onClick={() => navigate(`/student/dashboard`)}

                    className="h-10 w-auto object-contain drop-shadow-2xl cursor-pointer hover:opacity-80"

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

                      Plan de Inversión

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

                        alt={userName}

                        className="w-10 h-10 rounded-full border-2 border-white object-cover"

                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}

                      />

                    ) : (

                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">

                        <span className="text-white font-semibold text-sm">

                          {userName ? userName.charAt(0).toUpperCase() : 'U'}

                        </span>

                      </div>

                    )}

                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />

                  </button>

{userMenuOpen && (

                    <motion.div

                      initial={{ opacity: 0, y: -10 }}

                      animate={{ opacity: 1, y: 0 }}

                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[10001]"

                    >

                      <button

                        onClick={() => {

                          setUserMenuOpen(false);

                          navigate('/student/perfil');

                        }}

                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"

                      >

                        <span className="text-gray-700">Mi perfil</span>

                      </button>

                      <button

                        onClick={handleLogout}

                        className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"

                      >

                        <LogOut className="w-4 h-4" />

                        <span>Cerrar sesión</span>

                      </button>

                    </motion.div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </motion.header>

      </div>

{/* BREADCRUMB STICKY */}

      <motion.div

        className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

        initial={{ opacity: 0, y: -10 }}

        animate={{ opacity: 1, y: 0 }}

      >

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">

          <div className="flex items-center gap-2 text-sm">

            <button

              onClick={() => navigate('/student/dashboard')}

              className="text-gray-600 hover:text-[#59D22E] transition-colors flex items-center gap-1"

            >

              <Home className="w-3.5 h-3.5" />

              Inicio

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/modulos')}

              className="text-gray-600 hover:text-[#59D22E] transition-colors"

            >

              Modulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/plan-inversion')}

              className="text-gray-600 hover:text-[#59D22E] transition-colors"

            >

              Plan de Inversión

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#59D22E] font-semibold">

              Unidad 3 · Taller

            </span>

          </div>

        </div>

      </motion.div>

{/* Hero Section - MORADO */}

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

              MÓDULO: Plan de Inversión

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

              Gestión y Evaluación de Proyectos de Inversión

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

              animate={{ width: '66.66%' }}

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

      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* Título del Paso e Instrucciones - AL LADO */}

        <div className="flex items-start gap-4 mb-8">

          <h2

            className="text-[#006837] shrink-0"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: '2.25rem',

              fontWeight: 700,

            }}

          >

            Paso 3: Taller

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Arrastra la opción correcta de la columna Elemento hacia el espacio correspondiente en la columna Categoría.

            </p>

          </div>

        </div>

<motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100"

        >

          <div className="mb-8">

            <p className="text-base md:text-lg text-gray-700 mb-6">

              Realizaremos el siguiente taller para reforzar conocimientos de la unidad final de este módulo de plan de inversión.

            </p>

<div className="bg-gradient-to-r from-[#59D22E]/10 to-[#A5E811]/10 border-l-4 border-[#59D22E] rounded-xl p-4 mb-8">

              <p className="text-gray-700 text-sm md:text-base">

                <strong>📌 Instrucción del taller:</strong> Arrastra la opción correcta de la columna Elemento hacia el espacio correspondiente en la columna Categoría.

              </p>

            </div>

{/* Tabla de drag and drop */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* Columna Categoría */}

              <div>

                <h4 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white py-3 rounded-t-lg">Categoría</h4>

                <div className="space-y-3">

                  {categorias.map((categoria) => {

                    const respuesta = respuestas[categoria.id];
                    const esCorrectaRespuesta = validado && esCorrecta(categoria.id);
                    const esIncorrecta = validado && respuesta && !esCorrecta(categoria.id);
                    const elementoTexto = respuesta ? elementos.find(e => e.id === respuesta)?.texto : '';

return (

                      <div

                        key={categoria.id}

                        className={`rounded-lg p-4 min-h-[120px] border-2 transition-all ${dragOver === categoria.id

                          ? 'border-[#AA27B9] bg-[#AA27B9]/10 border-dashed'

                          : esCorrectaRespuesta

                            ? 'border-green-500 bg-green-50'

                            : esIncorrecta

                              ? 'border-red-500 bg-red-50'

                              : 'border-[#59D22E] bg-green-50'

                          }`}

                        onDragOver={(e) => handleDragOver(e, categoria.id)}

                        onDrop={(e) => handleDrop(e, categoria.id)}

                        onContextMenu={handleContextMenu}

                      >

                        <p className="text-sm font-semibold text-gray-900 mb-3">{categoria.texto}</p>

{respuesta ? (

                          <div className={`flex items-center justify-between px-3 py-2 rounded ${esCorrectaRespuesta

                            ? 'bg-green-100 border-2 border-green-500'

                            : esIncorrecta

                              ? 'bg-red-100 border-2 border-red-500'

                              : 'bg-white border-2 border-[#59D22E]'

                            }`}>

                            <span className="text-sm font-semibold text-gray-900 flex-1">{elementoTexto}</span>

                            <div className="flex items-center gap-2">

                              {esCorrectaRespuesta && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}

                              {esIncorrecta && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}

                              {(!validado || esIncorrecta) && (

                                <button

                                  onClick={() => handleRemoveAnswer(categoria.id)}

                                  className="text-red-600 hover:text-red-800 text-xs font-semibold"

                                >

                                  ✕

                                </button>

                              )}

                            </div>

                          </div>

                        ) : (

                          <div className="border-2 border-dashed border-gray-400 rounded p-3 text-center text-gray-500 text-sm">

                            Arrastra aquí la respuesta

                          </div>

                        )}

                      </div>

                    );

                  })}

                </div>

              </div>

{/* Columna Elemento */}

              <div>

                <h4 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white py-3 rounded-t-lg">Elemento</h4>

                <div className="space-y-3">

                  {elementos.map((elemento) => {

                    const estaUsado = !elementosDisponibles.includes(elemento.id);

return (

                      <div

                        key={elemento.id}

                        draggable={!estaUsado}

                        onDragStart={(e) => handleDragStart(e, elemento.id)}

                        onContextMenu={handleContextMenu}

                        className={`rounded-lg p-4 border-2 text-center cursor-move transition-all ${estaUsado

                          ? 'bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed'

                          : 'bg-white border-[#59D22E] hover:bg-[#59D22E]/5 hover:shadow-md'

                          }`}

                      >

                        <span className="text-sm font-semibold text-gray-900">{elemento.texto}</span>

                      </div>

                    );

                  })}

                </div>

              </div>

            </div>

{/* Botones de acción */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">

              {!validado && (

                <Button

                  onClick={handleValidate}

                  className="bg-[#59D22E] hover:bg-[#4fb320] text-white px-8 py-3"

                >

                  Verificar respuestas

                </Button>

              )}

{validado && (

                <Button

                  onClick={handleReset}

                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"

                >

                  Reiniciar

                </Button>

              )}

            </div>

{/* Mensaje de éxito */}

            {completado && (

              <div className="mb-8 bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">

                <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />

                <h3 className="text-xl font-bold text-green-900 mb-2">¡Excelente! Has completado correctamente el taller.</h3>

                <p className="text-green-800">Todas tus respuestas son correctas. Puedes continuar al siguiente paso.</p>

              </div>

            )}

{/* Reflexión final */}

            <div className="mt-8 bg-gradient-to-br from-[#59D22E]/10 to-[#A5E811]/10 border-l-4 border-[#59D22E] rounded-xl p-6">

              <p className="text-base md:text-lg text-gray-700 leading-relaxed">

                La ejecución disciplinada y el seguimiento constante convierten un plan de inversión en resultados reales. Documentar, implementar y ajustar a tiempo es la diferencia entre crecer de forma sostenible o fracasar en el intento.

              </p>

            </div>

          </div>

<div className="flex justify-end mt-8">

            <Button

              onClick={handleCompleteStep}

              disabled={!completado}

              className={`px-8 py-4 flex items-center gap-2 ${!completado

                ? 'bg-gray-400 cursor-not-allowed text-white'

                : 'bg-black hover:bg-neutral-800 text-white'

                }`}

            >

              Continuar a Evaluación

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        </motion.div>

      </div>

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/plan-inversion/unidad3/desarrollo');

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

export default PlanInversionUnidad3TallerPage;


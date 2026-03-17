import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, RotateCcw, Activity, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const elementosPlan = [

  { id: 'metas-claras', nombre: 'Metas claras' },

  { id: 'acciones-especificas', nombre: 'Acciones específicas' },

  { id: 'recursos', nombre: 'Recursos' },

  { id: 'tiempos', nombre: 'Tiempos' },

  { id: 'evaluación', nombre: 'Evaluación' }

];

const ejemplos = [

  {

    id: 'evaluar-satisfaccion',

    texto: 'Evaluar la satisfacción de los clientes mediante encuestas',

    respuestaCorrecta: 'evaluación'

  },

  {

    id: 'apoyo-companeros',

    texto: 'Apoyo de compañeros con habilidades en programación',

    respuestaCorrecta: 'recursos'

  },

  {

    id: 'practicas-profesionales',

    texto: 'Realizar prácticas profesionales en una empresa tecnológica de Nariño',

    respuestaCorrecta: 'metas-claras'

  },

  {

    id: 'inscribirse-curso',

    texto: 'Inscribirse en un curso de marketing digital',

    respuestaCorrecta: 'acciones-especificas'

  },

  {

    id: 'cronograma-tres-meses',

    texto: 'Definir un cronograma de tres meses para el desarrollo de un prototipo',

    respuestaCorrecta: 'tiempos'

  }

];

const ProyectoVidaUnidad3TallerPage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('pv_u3_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [ejemplosDisponibles, setEjemplosDisponibles] = useState(() => {

    const saved = localStorage.getItem('pv_u3_taller_disponibles');

    return saved ? JSON.parse(saved) : ejemplos.map(e => e.id);

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('pv_u3_taller_validado');

    return saved === 'true';

  });

  const [draggedEjemplo, setDraggedEjemplo] = useState(null);

  const [dragOver, setDragOver] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  // Evitar pantallas blancas por estados antiguos guardados (IDs que ya no existen)
  useEffect(() => {
    const ejemploIdsValidos = new Set(ejemplos.map((e) => e.id));

    // Sanear respuestas guardadas
    let savedRespuestas = {};
    try {
      const raw = localStorage.getItem('pv_u3_taller_respuestas');
      savedRespuestas = raw ? JSON.parse(raw) : {};
    } catch {
      savedRespuestas = {};
    }

    const respuestasSanitizadas = {};
    for (const [elementoId, ejemploId] of Object.entries(savedRespuestas || {})) {
      if (typeof ejemploId === 'string' && ejemploIdsValidos.has(ejemploId)) {
        respuestasSanitizadas[elementoId] = ejemploId;
      }
    }

    // Disponibles = todos - asignados
    const asignadas = new Set(Object.values(respuestasSanitizadas));
    const disponiblesSanitizadas = ejemplos
      .map((e) => e.id)
      .filter((id) => !asignadas.has(id));

    setRespuestas(respuestasSanitizadas);
    setEjemplosDisponibles(disponiblesSanitizadas);
    setValidado(false);
  }, []);

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

    localStorage.setItem('pv_u3_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('pv_u3_taller_disponibles', JSON.stringify(ejemplosDisponibles));

  }, [ejemplosDisponibles]);

useEffect(() => {

    localStorage.setItem('pv_u3_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, ejemploId) => {

    setDraggedEjemplo(ejemploId);

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

if (!draggedEjemplo) return;

// Si se cambia una respuesta después de validar, resetear validado para permitir validar de nuevo

    if (validado) {

      setValidado(false);

    }

if (respuestas[elementoId]) {

      setEjemplosDisponibles(prev => [...prev, respuestas[elementoId]]);

    }

setRespuestas(prev => ({

      ...prev,

      [elementoId]: draggedEjemplo

    }));

setEjemplosDisponibles(prev => prev.filter(id => id !== draggedEjemplo));

    setDraggedEjemplo(null);

  };

const handleRemoveAnswer = (elementoId) => {

    const ejemploId = respuestas[elementoId];

    if (ejemploId) {

      setEjemplosDisponibles(prev => [...prev, ejemploId]);

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[elementoId];

        return newRespuestas;

      });

      setValidado(false);

    }

  };

const handleValidate = () => {

    setValidado(true);

  };

const handleReset = () => {

    setRespuestas({});

    setEjemplosDisponibles(ejemplos.map(e => e.id));

    setValidado(false);

    localStorage.removeItem('pv_u3_taller_respuestas');

    localStorage.removeItem('pv_u3_taller_disponibles');

    localStorage.removeItem('pv_u3_taller_validado');

  };

const todasRespondidas = Object.keys(respuestas).length === elementosPlan.length;

  const respuestasCorrectas = elementosPlan.filter(e => {

    const ejemploId = respuestas[e.id];

    const ejemplo = ejemplos.find(ex => ex.id === ejemploId);

    return ejemplo && ejemplo.respuestaCorrecta === e.id;

  }).length;

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Proyecto de vida',

          paso_nombre: 'Unidad 3: Taller',

          curso_nombre: 'Proyecto de vida'

        })

      });

      localStorage.setItem('pv_unidad3_taller_completado', 'true');

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad3/cierre');

    } catch (error) {

      localStorage.setItem('pv_unidad3_taller_completado', 'true');

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad3/cierre');

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

              Plan de acción del proyecto de vida

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

              Plan de acción del proyecto de vida

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

              <strong>📌 Instrucciones:</strong> Arrastra cada opción de la derecha hacia las opciones de la izquierda para emparejar con la opción correcta.

            </p>

          </div>

        </div>

<motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100"

        >

          <div className="mb-8">

            <div className="flex items-center gap-3 mb-4">

              <Activity className="w-6 h-6 text-[#006837]" />

              <h3

                className="text-[#006837]"

                style={{

                  fontFamily: 'var(--font-heading)',

                  fontSize: '1.5rem',

                  fontWeight: 600,

                }}

              >

                Taller: identificando los elementos del plan de acción del proyecto de vida

              </h3>

            </div>

            <p className="text-gray-700 leading-relaxed mb-4">

              Vamos a poner en práctica los conocimientos que hemos adquirido en esta unidad final de nuestro modulo de proyecto de vida.

            </p>

            <p className="text-gray-700 leading-relaxed mb-4">

              Para este taller deberás emparejar los elementos de la derecha, que representan el ejemplo, con el elemento del plan de acción al que corresponde en la parte izquierda.

            </p>

          </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* Columna izquierda: Elementos del plan */}

            <div className="space-y-4">

              <h4 className="font-semibold text-gray-900 mb-3">Elementos del plan de acción</h4>

              {elementosPlan.map((elemento) => {

                const ejemploId = respuestas[elemento.id];

                const ejemplo = ejemplos.find(e => e.id === ejemploId);

                const esCorrecta = validado && ejemplo && ejemplo.respuestaCorrecta === elemento.id;

                const esIncorrecta = validado && ejemplo && ejemplo.respuestaCorrecta !== elemento.id;

return (

                  <div

                    key={elemento.id}

                    onDragOver={(e) => handleDragOver(e, elemento.id)}

                    onDragLeave={handleDragLeave}

                    onDrop={(e) => handleDrop(e, elemento.id)}

                    onContextMenu={handleContextMenu}

                    className={`min-h-[120px] p-4 rounded-lg border-2 transition-all select-none ${dragOver === elemento.id

                      ? 'border-gray-900 bg-gray-100 border-dashed'

                      : ejemploId

                        ? esCorrecta

                          ? 'border-green-500 bg-green-50'

                          : esIncorrecta

                            ? 'border-red-500 bg-red-50'

                            : 'border-gray-300 bg-gray-50'

                        : 'border-gray-200 bg-white border-dashed'

                      }`}

                  >

                    <p className="text-sm font-semibold text-gray-900 mb-3">{elemento.nombre}</p>

                    {ejemploId ? (

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

                          <span className="text-sm">{ejemplo?.texto ?? 'Ejemplo no disponible'}</span>

                        </div>

                        {(!validado || esIncorrecta) && (

                          <button

                            onClick={() => handleRemoveAnswer(elemento.id)}

                            className="text-xs text-gray-500 hover:text-gray-700 underline"

                          >

                            Quitar

                          </button>

                        )}

                      </div>

                    ) : (

                      <p className="text-xs text-gray-400 italic">Arrastra un ejemplo aquí</p>

                    )}

                  </div>

                );

              })}

            </div>

{/* Columna derecha: Ejemplos */}

            <div className="space-y-4">

              <h4 className="font-semibold text-gray-900 mb-3">Ejemplos</h4>

              <div className="space-y-3">

                {ejemplos.map((ejemplo) => {

                  const estaDisponible = ejemplosDisponibles.includes(ejemplo.id);

                  const estaAsignado = Object.values(respuestas).includes(ejemplo.id);

if (!estaDisponible && estaAsignado) {

                    return null;

                  }

return (

                    <div

                      key={ejemplo.id}

                      draggable={estaDisponible}

                      onDragStart={(e) => handleDragStart(e, ejemplo.id)}

                      onContextMenu={handleContextMenu}

                      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-move select-none ${estaDisponible

                        ? 'bg-white border-gray-300 hover:border-gray-900 hover:shadow-md active:opacity-70'

                        : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'

                        }`}

                    >

                      <span className="text-sm text-gray-900 select-none">{ejemplo?.texto ?? 'Ejemplo no disponible'}</span>

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

              disabled={!todasRespondidas}

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

            <div className={`mt-4 p-4 rounded-lg border-2 ${respuestasCorrectas === elementosPlan.length

              ? 'bg-green-50 border-green-500'

              : 'bg-amber-50 border-amber-500'

              }`}>

              <p className="font-semibold text-gray-900 mb-2">

                {respuestasCorrectas === elementosPlan.length

                  ? '¡Excelente! Has completado correctamente el taller.'

                  : `Has respondido correctamente ${respuestasCorrectas} de ${elementosPlan.length} preguntas.`}

              </p>

              {respuestasCorrectas === elementosPlan.length && (

                <p className="text-sm text-gray-700 mt-2">

                  <strong>Reflexión:</strong> Cuando tus metas tienen dirección y tus acciones un orden, tus sueños se vuelven alcanzables.

                </p>

              )}

              {respuestasCorrectas < elementosPlan.length && (

                <p className="text-sm text-gray-700">

                  Revisa las respuestas incorrectas y vuelve a intentar.

                </p>

              )}

            </div>

          )}

{/* Botón Siguiente */}

          <div className="flex justify-end mt-6">

            <Button

              onClick={handleCompleteStep}

              disabled={!validado || respuestasCorrectas < elementosPlan.length}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!validado || respuestasCorrectas < elementosPlan.length ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Siguiente Paso

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

            navigate('/student/proyecto-vida/unidad3/desarrollo');

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

export default ProyectoVidaUnidad3TallerPage;


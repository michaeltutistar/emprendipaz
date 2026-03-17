import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, RotateCcw, Activity, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const fortalezas = [

  { id: 'comunicacion', nombre: 'Comunicación' },

  { id: 'organizacion', nombre: 'Organización' },

  { id: 'creatividad', nombre: 'Creatividad' },

  { id: 'resiliencia', nombre: 'Resiliencia' },

  { id: 'liderazgo', nombre: 'Liderazgo' },

  { id: 'adaptabilidad', nombre: 'Adaptabilidad' }

];

// Actividades (ordenado diferente a fortalezas para evitar ventaja)

const actividades = [

  {

    id: 'grupo-trabajo',

    texto: 'Dirigir un grupo de trabajo en un emprendimiento local',

    respuestaCorrecta: 'liderazgo'

  },

  {

    id: 'plataformás',

    texto: 'Adaptar un negocio físico a plataformas digitales',

    respuestaCorrecta: 'adaptabilidad'

  },

  {

    id: 'representante',

    texto: 'Representante comercial de los productos',

    respuestaCorrecta: 'comunicacion'

  },

  {

    id: 'artesanias',

    texto: 'Desarrollo de artesanías con diseños originales',

    respuestaCorrecta: 'creatividad'

  },

  {

    id: 'inventarios',

    texto: 'Ordenar inventarios en una bodega de cosméticos',

    respuestaCorrecta: 'organizacion'

  },

  {

    id: 'restaurante',

    texto: 'Mantener un restaurante durante una época de crisis económica',

    respuestaCorrecta: 'resiliencia'

  }

];

const ProyectoVidaUnidad2TallerPage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('pv_u2_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [actividadesDisponibles, setActividadesDisponibles] = useState(() => {

    const saved = localStorage.getItem('pv_u2_taller_disponibles');

    return saved ? JSON.parse(saved) : actividades.map(a => a.id);

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('pv_u2_taller_validado');

    return saved === 'true';

  });

  const [draggedActividad, setDraggedActividad] = useState(null);

  const [dragOver, setDragOver] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  // Evitar pantallas blancas por estados antiguos guardados (IDs que ya no existen)
  useEffect(() => {
    const actividadIdsValidos = new Set(actividades.map((a) => a.id));

    // Sanear respuestas guardadas
    let savedRespuestas = {};
    try {
      const raw = localStorage.getItem('pv_u2_taller_respuestas');
      savedRespuestas = raw ? JSON.parse(raw) : {};
    } catch {
      savedRespuestas = {};
    }

    const respuestasSanitizadas = {};
    for (const [fortalezaId, actividadId] of Object.entries(savedRespuestas || {})) {
      if (typeof actividadId === 'string' && actividadIdsValidos.has(actividadId)) {
        respuestasSanitizadas[fortalezaId] = actividadId;
      }
    }

    // Disponibles = todas - asignadas
    const asignadas = new Set(Object.values(respuestasSanitizadas));
    const disponiblesSanitizadas = actividades
      .map((a) => a.id)
      .filter((id) => !asignadas.has(id));

    setRespuestas(respuestasSanitizadas);
    setActividadesDisponibles(disponiblesSanitizadas);
    // Si estaba validado pero se sanitizó, forzar a revalidar
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

    localStorage.setItem('pv_u2_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('pv_u2_taller_disponibles', JSON.stringify(actividadesDisponibles));

  }, [actividadesDisponibles]);

useEffect(() => {

    localStorage.setItem('pv_u2_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, actividadId) => {

    setDraggedActividad(actividadId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, fortalezaId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(fortalezaId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, fortalezaId) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedActividad) return;

if (respuestas[fortalezaId]) {

      setActividadesDisponibles(prev => [...prev, respuestas[fortalezaId]]);

    }

setRespuestas(prev => ({

      ...prev,

      [fortalezaId]: draggedActividad

    }));

setActividadesDisponibles(prev => prev.filter(id => id !== draggedActividad));

    setDraggedActividad(null);

  };

const handleRemoveAnswer = (fortalezaId) => {

    const actividadId = respuestas[fortalezaId];

    if (actividadId) {

      setActividadesDisponibles(prev => [...prev, actividadId]);

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[fortalezaId];

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

    setActividadesDisponibles(actividades.map(a => a.id));

    setValidado(false);

    localStorage.removeItem('pv_u2_taller_respuestas');

    localStorage.removeItem('pv_u2_taller_disponibles');

    localStorage.removeItem('pv_u2_taller_validado');

  };

const todasRespondidas = Object.keys(respuestas).length === fortalezas.length;

  const respuestasCorrectas = fortalezas.filter(f => {

    const actividadId = respuestas[f.id];

    const actividad = actividades.find(a => a.id === actividadId);

    return actividad && actividad.respuestaCorrecta === f.id;

  }).length;

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Proyecto de vida',

          paso_nombre: 'Unidad 2: Taller',

          curso_nombre: 'Proyecto de vida'

        })

      });

      localStorage.setItem('pv_unidad2_taller_completado', 'true');

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad2/cierre');

    } catch (error) {

      localStorage.setItem('pv_unidad2_taller_completado', 'true');

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/proyecto-vida/unidad2/cierre');

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

                      Unidad 2

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

              Fortalezas propias

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

              Fortalezas propias

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

              <strong>📌 Instrucciones:</strong> Empareja la actividad de la derecha con la fortaleza de la izquierda. Arrastra cada opción de la derecha hacia las opciones de la izquierda.

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

                Relaciona fortaleza con actividad

              </h3>

            </div>

            <p className="text-gray-700 leading-relaxed mb-4">

              Pongamos en práctica los conocimientos que hemos adquirido en esta segunda unidad, vamos a identificar la fortaleza propia que se requiere de acuerdo a la actividad del emprendimiento.

            </p>

          </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* Columna izquierda: Fortalezas */}

            <div className="space-y-4">

              <h4 className="font-semibold text-gray-900 mb-3">Fortalezas</h4>

              {fortalezas.map((fortaleza) => {

                const actividadId = respuestas[fortaleza.id];

                const actividad = actividades.find(a => a.id === actividadId);

                const esCorrecta = validado && actividad && actividad.respuestaCorrecta === fortaleza.id;

                const esIncorrecta = validado && actividad && actividad.respuestaCorrecta !== fortaleza.id;

return (

                  <div

                    key={fortaleza.id}

                    onDragOver={(e) => handleDragOver(e, fortaleza.id)}

                    onDragLeave={handleDragLeave}

                    onDrop={(e) => handleDrop(e, fortaleza.id)}

                    onContextMenu={handleContextMenu}

                    className={`min-h-[120px] p-4 rounded-lg border-2 transition-all select-none ${dragOver === fortaleza.id

                      ? 'border-gray-900 bg-gray-100 border-dashed'

                      : actividadId

                        ? esCorrecta

                          ? 'border-green-500 bg-green-50'

                          : esIncorrecta

                            ? 'border-red-500 bg-red-50'

                            : 'border-gray-300 bg-gray-50'

                        : 'border-gray-200 bg-white border-dashed'

                      }`}

                  >

                    <p className="text-sm font-semibold text-gray-900 mb-3">{fortaleza.nombre}</p>

                    {actividadId ? (

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

                          <span className="text-sm">{actividad?.texto ?? 'Actividad no disponible'}</span>

                        </div>

                        {!validado && (

                          <button

                            onClick={() => handleRemoveAnswer(fortaleza.id)}

                            className="text-xs text-gray-500 hover:text-gray-700 underline"

                          >

                            Quitar

                          </button>

                        )}

                      </div>

                    ) : (

                      <p className="text-xs text-gray-400 italic">Arrastra una actividad aquí</p>

                    )}

                  </div>

                );

              })}

            </div>

{/* Columna derecha: Actividades */}

            <div className="space-y-4">

              <h4 className="font-semibold text-gray-900 mb-3">Actividades</h4>

              <div className="space-y-3">

                {actividadesDisponibles.map((actividadId) => {

                  const actividad = actividades.find(a => a.id === actividadId);

                  if (!actividad) return null;

return (

                    <div

                      key={actividad.id}

                      draggable={true}

                      onDragStart={(e) => handleDragStart(e, actividad.id)}

                      onContextMenu={handleContextMenu}

                      className="px-4 py-3 rounded-lg border-2 transition-all cursor-move select-none bg-white border-gray-300 hover:border-gray-900 hover:shadow-md active:opacity-70"

                    >

                      <span className="text-sm text-gray-900">{actividad.texto}</span>

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

            <div className={`mt-4 p-4 rounded-lg border-2 ${respuestasCorrectas === fortalezas.length

              ? 'bg-green-50 border-green-500'

              : 'bg-amber-50 border-amber-500'

              }`}>

              <p className="font-semibold text-gray-900 mb-2">

                {respuestasCorrectas === fortalezas.length

                  ? '¡Excelente! Has completado correctamente el taller.'

                  : `Has respondido correctamente ${respuestasCorrectas} de ${fortalezas.length} preguntas.`}

              </p>

              {respuestasCorrectas === fortalezas.length && (

                <p className="text-sm text-gray-700 mt-2">

                  <strong>Reflexión:</strong> Siempre tendrás lugar en un emprendimiento, solo debes reconocer cuál es tu mayor fortaleza para encajar adecuadamente en el rompecabezas.

                </p>

              )}

              {respuestasCorrectas < fortalezas.length && (

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

              disabled={!validado || respuestasCorrectas < fortalezas.length}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!validado || respuestasCorrectas < fortalezas.length ? 'opacity-40 cursor-not-allowed' : ''

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

            navigate('/student/proyecto-vida/unidad2/desarrollo');

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

export default ProyectoVidaUnidad2TallerPage;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, XCircle, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Componentes de ingresos y costos

const componentes = [

  { id: 'fuente-ingresos', nombre: 'Fuente de ingresos' },

  { id: 'estrategia-precios', nombre: 'Estrategia de precios' },

  { id: 'costo-fijo', nombre: 'Costo fijo' },

  { id: 'costo-variable', nombre: 'Costo variable' },

  { id: 'punto-equilibrio', nombre: 'Punto de equilibrio' }

];

// Descripciones para arrastrar (ordenado diferente a componentes para evitar ventaja)

const descripciones = [

  {

    id: 'desc-5',

    texto: 'Nivel de ventas donde ingresos = costos',

    respuestaCorrecta: 'punto-equilibrio'

  },

  {

    id: 'desc-3',

    texto: 'Arriendo de la planta de producción',

    respuestaCorrecta: 'costo-fijo'

  },

  {

    id: 'desc-1',

    texto: 'Suscripción mensual de clientes en Bogotá',

    respuestaCorrecta: 'fuente-ingresos'

  },

  {

    id: 'desc-4',

    texto: 'Materias primas para la producción de café',

    respuestaCorrecta: 'costo-variable'

  },

  {

    id: 'desc-2',

    texto: 'Basada en valor por calidad orgánica',

    respuestaCorrecta: 'estrategia-precios'

  }

];

const ModeloNegociosUnidad3TallerPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('modelo_negocios_u3_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [descripcionesDisponibles, setDescripcionesDisponibles] = useState(() => {

    const saved = localStorage.getItem('modelo_negocios_u3_taller_disponibles');

    return saved ? JSON.parse(saved) : descripciones.map(d => d.id);

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('modelo_negocios_u3_taller_validado');

    return saved === 'true';

  });

  const [draggedDescripcion, setDraggedDescripcion] = useState(null);

  const [dragOver, setDragOver] = useState(null);

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

    localStorage.setItem('modelo_negocios_u3_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('modelo_negocios_u3_taller_disponibles', JSON.stringify(descripcionesDisponibles));

  }, [descripcionesDisponibles]);

useEffect(() => {

    localStorage.setItem('modelo_negocios_u3_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, descripcionId) => {

    setDraggedDescripcion(descripcionId);

    e.dataTransfer.effectAllowed = 'move';

  };

const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, componenteId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(componenteId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, componenteId) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedDescripcion) return;

// Si se cambia una respuesta después de validar, resetear validado para permitir validar de nuevo

    if (validado) {

      setValidado(false);

    }

if (respuestas[componenteId]) {

      setDescripcionesDisponibles(prev => [...prev, respuestas[componenteId]]);

    }

setRespuestas(prev => ({

      ...prev,

      [componenteId]: draggedDescripcion

    }));

setDescripcionesDisponibles(prev => prev.filter(id => id !== draggedDescripcion));

    setDraggedDescripcion(null);

  };

const handleRemoveAnswer = (componenteId) => {

    const descripcionId = respuestas[componenteId];

    if (descripcionId) {

      setDescripcionesDisponibles(prev => [...prev, descripcionId]);

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[componenteId];

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

    setDescripcionesDisponibles(descripciones.map(d => d.id));

    setValidado(false);

    localStorage.removeItem('modelo_negocios_u3_taller_respuestas');

    localStorage.removeItem('modelo_negocios_u3_taller_disponibles');

    localStorage.removeItem('modelo_negocios_u3_taller_validado');

  };

const todasRespondidas = Object.keys(respuestas).length === componentes.length;

  const respuestasCorrectasCount = componentes.filter(c => {

    const descripcionId = respuestas[c.id];

    const descripcion = descripciones.find(d => d.id === descripcionId);

    return descripcion && descripcion.respuestaCorrecta === c.id;

  }).length;

const esRespuestaCorrecta = (componenteId) => {

    if (!validado) return false;

    const descripcionId = respuestas[componenteId];

    const descripcion = descripciones.find(d => d.id === descripcionId);

    return descripcion && descripcion.respuestaCorrecta === componenteId;

  };

const esRespuestaIncorrecta = (componenteId) => {

    if (!validado) return false;

    const descripcionId = respuestas[componenteId];

    if (!descripcionId) return false;

    const descripcion = descripciones.find(d => d.id === descripcionId);

    return descripcion && descripcion.respuestaCorrecta !== componenteId;

  };

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Modelo de Negocios',

          paso_nombre: 'Unidad 3: Taller',

          curso_nombre: 'Modelo de Negocios'

        })

      });

      navigate('/student/modelo-negocios/unidad3/cierre');

    } catch (error) {

      navigate('/student/modelo-negocios/unidad3/cierre');

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

                      Modelo de Negocios

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

            <button onClick={() => navigate('/student/modelo-negocios')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Modelo de Negocios

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Ingresos y Costos · Taller

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

              MÓDULO: Modelo de Negocios

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

              Ingresos y Costos

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

{/* Content */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="space-y-8">

          {/* Título e Instrucciones */}

          <div>

            <h2

              className="text-[#006837] mb-4"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '2.25rem',

                fontWeight: 700,

              }}

            >

              Taller: Ingresos y Costos

            </h2>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Realizaremos el siguiente taller para reforzar conocimientos sobre ingresos y costos. Vas a reconocer a qué componente de los conceptos estudiados corresponde una descripción específica.

            </p>

            <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 mb-6">

              <p className="text-gray-700 leading-snug text-xs">

                <strong>📌 Instrucción del taller:</strong> Arrastra cada descripción de la derecha hacia el componente correcto en la izquierda.

              </p>

            </div>

          </div>

{/* Ejercicio de Drag and Drop */}

          <div className="bg-white border-2 border-neutral-300 rounded-lg overflow-hidden shadow-lg">

            <div className="bg-gradient-to-r from-[#AA27B9] to-[#d946ef] text-white p-4">

              <h3 className="text-lg font-bold text-center">Ejercicio de Identificación</h3>

            </div>

<div className="p-6">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Columna Izquierda: Componentes */}

                <div>

                  <h4 className="font-semibold text-neutral-900 mb-4 text-center">Componente (arrastrar aquí)</h4>

                  <div className="space-y-3">

                    {componentes.map((componente) => {

                      const descripcionId = respuestas[componente.id];

                      const descripcion = descripcionId ? descripciones.find(d => d.id === descripcionId) : null;

                      const esCorrecta = esRespuestaCorrecta(componente.id);

                      const esIncorrecta = esRespuestaIncorrecta(componente.id);

return (

                        <div

                          key={componente.id}

                          onDragOver={(e) => handleDragOver(e, componente.id)}

                          onDragLeave={handleDragLeave}

                          onDrop={(e) => handleDrop(e, componente.id)}

                          className={`

                            min-h-[80px] p-4 rounded-lg border-2 transition-all

                            ${dragOver === componente.id ? 'border-[#AA27B9] bg-[#AA27B9]/10' : 'border-neutral-300'}

                            ${esCorrecta ? 'border-green-500 bg-green-50' : ''}

                            ${esIncorrecta ? 'border-red-500 bg-red-50' : ''}

                            ${!descripcion ? 'bg-neutral-50' : 'bg-white'}

                          `}

                        >

                          <div className="flex items-start justify-between gap-2">

                            <div className="flex-1">

                              <p className="font-semibold text-neutral-900 mb-2">{componente.nombre}</p>

                              {descripcion && (

                                <div className="flex items-center gap-2">

                                  <p className={`text-sm ${esCorrecta ? 'text-green-700' : esIncorrecta ? 'text-red-700' : 'text-neutral-700'}`}>

                                    {descripcion.texto}

                                  </p>

                                  {validado && esIncorrecta && (

                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />

                                  )}

                                </div>

                              )}

                            </div>

                            {descripcion && (

                              <button

                                onClick={() => handleRemoveAnswer(componente.id)}

                                className="text-red-500 hover:text-red-700 flex-shrink-0"

                                title="Quitar"

                              >

                                <XCircle className="w-5 h-5" />

                              </button>

                            )}

                          </div>

                        </div>

                      );

                    })}

                  </div>

                </div>

{/* Columna Derecha: Descripciones Disponibles */}

                <div>

                  <h4 className="font-semibold text-neutral-900 mb-4 text-center">Descripción</h4>

                  <div className="space-y-3">

                    {descripciones

                      .filter(d => descripcionesDisponibles.includes(d.id))

                      .map((descripcion) => (

                        <div

                          key={descripcion.id}

                          draggable

                          onDragStart={(e) => handleDragStart(e, descripcion.id)}

                          onContextMenu={handleContextMenu}

                          className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 cursor-move hover:bg-blue-100 hover:border-blue-400 transition-all"

                        >

                          <p className="text-sm text-neutral-700">{descripcion.texto}</p>

                        </div>

                      ))}

                  </div>

                </div>

              </div>

{/* Botones de Acción */}

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">

                <Button

                  onClick={handleReset}

                  className="bg-neutral-500 hover:bg-neutral-600 text-white px-6 py-2"

                >

                  Reiniciar

                </Button>

                <div className="flex gap-4 items-center">

                  {validado && (

                    <div className="text-sm text-neutral-700">

                      <span className="font-semibold">Resultado:</span> {respuestasCorrectasCount} de {componentes.length} correctas

                    </div>

                  )}

                  <Button

                    onClick={handleValidate}

                    disabled={!todasRespondidas}

                    className="bg-[#AA27B9] hover:bg-[#9d24ab] text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"

                  >

                    Validar

                  </Button>

                  {validado && respuestasCorrectasCount === componentes.length && (

                    <Button

                      onClick={handleCompleteStep}

                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2"

                    >

                      Continuar

                      <ChevronRight className="w-4 h-4" />

                    </Button>

                  )}

                </div>

              </div>

            </div>

          </div>

{/* Texto Final */}

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-600 p-6 rounded-lg">

            <p className="text-neutral-700 text-center text-base md:text-lg italic">

              Un negocio sostenible no solo vende, también administra con inteligencia sus recursos.

            </p>

          </div>

        </div>

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/modelo-negocios/unidad3/desarrollo');

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

export default ModeloNegociosUnidad3TallerPage;


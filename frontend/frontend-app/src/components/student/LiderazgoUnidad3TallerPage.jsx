import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, RotateCcw, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Ejercicio 1: Ordenar los pasos

const pasosOrden = [

  { id: 'paso1', nombre: 'Detectar el problema', ordenCorrecto: 1 },

  { id: 'paso2', nombre: 'Pensar opciones', ordenCorrecto: 2 },

  { id: 'paso3', nombre: 'Comparar y elegir', ordenCorrecto: 3 },

  { id: 'paso4', nombre: 'Actuar y revisar', ordenCorrecto: 4 }

];

// Ejercicio 2: Emparejar pasos con orientaciones

const pasos = [

  { id: 'detectar', nombre: 'Detectar el problema' },

  { id: 'pensar', nombre: 'Pensar opciones' },

  { id: 'comparar', nombre: 'Comparar y elegir' },

  { id: 'actuar', nombre: 'Actuar y revisar' }

];

const orientaciones = [

  {

    id: 'orientacion1',

    texto: '¿Qué está pasando que necesita solución?',

    respuestaCorrecta: 'detectar'

  },

  {

    id: 'orientacion2',

    texto: '¿Qué cosas puedo hacer para resolverlo?',

    respuestaCorrecta: 'pensar'

  },

  {

    id: 'orientacion3',

    texto: '¿Cuál opción es mejor para todos?',

    respuestaCorrecta: 'comparar'

  },

  {

    id: 'orientacion4',

    texto: '¿Funcionó lo que decidí? ¿Qué aprendí?',

    respuestaCorrecta: 'actuar'

  }

];

// Función para mezclar array aleatoriamente

const shuffleArray = (array) => {

  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

  }

  return shuffled;

};

const LiderazgoUnidad3TallerPage = () => {

  const navigate = useNavigate();

// Estado para ejercicio 1: Ordenar pasos

  // Inicializar con orden incorrecto para que el usuario tenga que ordenarlo

  const [ordenPasos, setOrdenPasos] = useState(() => {

    const saved = localStorage.getItem('liderazgo_u3_taller_orden');

    if (saved) {

      return JSON.parse(saved);

    }

    // Orden inicial incorrecto: [3, 1, 4, 2] para que el usuario tenga que ordenarlo

    return ['paso3', 'paso1', 'paso4', 'paso2'];

  });

  const [ejercicio1Validado, setEjercicio1Validado] = useState(() => {

    return localStorage.getItem('liderazgo_u3_taller_ej1_validado') === 'true';

  });

  const [draggedPaso, setDraggedPaso] = useState(null);

  const [dragOverIndex, setDragOverIndex] = useState(null);

// Estado para ejercicio 2: Emparejar

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('liderazgo_u3_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [orientacionesDisponibles, setOrientacionesDisponibles] = useState(() => {

    const saved = localStorage.getItem('liderazgo_u3_taller_disponibles');

    return saved ? JSON.parse(saved) : shuffleArray(orientaciones.map(o => o.id));

  });

  const [ejercicio2Validado, setEjercicio2Validado] = useState(() => {

    return localStorage.getItem('liderazgo_u3_taller_ej2_validado') === 'true';

  });

  const [draggedOrientacion, setDraggedOrientacion] = useState(null);

  const [dragOverPaso, setDragOverPaso] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

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

    localStorage.setItem('liderazgo_u3_taller_orden', JSON.stringify(ordenPasos));

  }, [ordenPasos]);

useEffect(() => {

    localStorage.setItem('liderazgo_u3_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('liderazgo_u3_taller_disponibles', JSON.stringify(orientacionesDisponibles));

  }, [orientacionesDisponibles]);

// Ejercicio 1: Drag handlers

  const handleDragStartOrden = (e, pasoId) => {

    setDraggedPaso(pasoId);

    e.dataTransfer.effectAllowed = 'move';

    e.dataTransfer.setData('text/plain', pasoId);

  };

const handleDragOverOrden = (e, index) => {

    e.preventDefault();

    e.stopPropagation();

    e.dataTransfer.dropEffect = 'move';

    setDragOverIndex(index);

  };

const handleDragLeaveOrden = () => {

    setDragOverIndex(null);

  };

const handleDropOrden = (e, targetIndex) => {

    e.preventDefault();

    e.stopPropagation();

    if (draggedPaso === null) return;

const newOrden = [...ordenPasos];

    const draggedIndex = newOrden.indexOf(draggedPaso);

// Solo reordenar si el índice es diferente

    if (draggedIndex !== targetIndex) {

      newOrden.splice(draggedIndex, 1);

      newOrden.splice(targetIndex, 0, draggedPaso);

      setOrdenPasos(newOrden);

    }

setDraggedPaso(null);

    setDragOverIndex(null);

  };

const validarEjercicio1 = () => {

    // Verificar que cada paso está en la posición correcta

    // El orden correcto debe ser: paso1 (Detectar), paso2 (Pensar), paso3 (Comparar), paso4 (Actuar)

    const ordenEsperado = ['paso1', 'paso2', 'paso3', 'paso4'];

    const ordenCorrecto = ordenPasos.length === ordenEsperado.length &&

      ordenPasos.every((pasoId, index) => pasoId === ordenEsperado[index]);

setEjercicio1Validado(ordenCorrecto);

    localStorage.setItem('liderazgo_u3_taller_ej1_validado', ordenCorrecto.toString());

if (ordenCorrecto) {

      alert('¡Correcto! El orden de los pasos es el adecuado.');

    } else {

      alert('El orden no es correcto. Revisa la ruta para decidir e intenta nuevamente.');

    }

return ordenCorrecto;

  };

const resetEjercicio1 = () => {

    // Restablecer al orden inicial incorrecto

    setOrdenPasos(['paso3', 'paso1', 'paso4', 'paso2']);

    setEjercicio1Validado(false);

    localStorage.removeItem('liderazgo_u3_taller_ej1_validado');

    localStorage.removeItem('liderazgo_u3_taller_orden');

  };

// Ejercicio 2: Drag handlers

  const handleDragStartOrientacion = (e, orientacionId) => {

    setDraggedOrientacion(orientacionId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOverPaso = (e, pasoId) => {

    e.preventDefault();

    setDragOverPaso(pasoId);

  };

const handleDropOrientacion = (e, pasoId) => {

    e.preventDefault();

    if (!draggedOrientacion) return;

// Si se cambia una respuesta después de validar, resetear validado para permitir validar de nuevo

    if (ejercicio2Validado && respuestas[pasoId]) {

      setEjercicio2Validado(false);

    }

// Si ya hay una respuesta en este paso, devolver la anterior a disponibles

    if (respuestas[pasoId]) {

      setOrientacionesDisponibles([...orientacionesDisponibles, respuestas[pasoId]]);

    }

// Asignar la nueva orientación

    setRespuestas({ ...respuestas, [pasoId]: draggedOrientacion });

    setOrientacionesDisponibles(orientacionesDisponibles.filter(id => id !== draggedOrientacion));

    setDraggedOrientacion(null);

    setDragOverPaso(null);

  };

const removerOrientacion = (pasoId) => {

    if (respuestas[pasoId]) {

      setOrientacionesDisponibles([...orientacionesDisponibles, respuestas[pasoId]]);

      const nuevasRespuestas = { ...respuestas };

      delete nuevasRespuestas[pasoId];

      setRespuestas(nuevasRespuestas);

      setEjercicio2Validado(false);

    }

  };

const validarEjercicio2 = () => {

    setEjercicio2Validado(true);

    localStorage.setItem('liderazgo_u3_taller_ej2_validado', 'true');

const todasCorrectas = pasos.every(paso => {
      const respuesta = respuestas[paso.id];
      const orientacion = orientaciones.find(o => o.id === respuesta);
      return orientacion && orientacion.respuestaCorrecta === paso.id;
    });

    return todasCorrectas;

  };

const resetEjercicio2 = () => {

    setRespuestas({});

    setOrientacionesDisponibles(shuffleArray(orientaciones.map(o => o.id)));

    setEjercicio2Validado(false);

    localStorage.removeItem('liderazgo_u3_taller_ej2_validado');

  };

const handleCompleteStep = async () => {

    if (!ejercicio1Validado || !ejercicio2Validado) {

      alert('Por favor, completa y valida ambos ejercicios antes de continuar.');

      return;

    }

try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Liderazgo',

          paso_nombre: 'Unidad 3: Taller',

          curso_nombre: 'Liderazgo'

        })

      });

      localStorage.setItem('liderazgo_u3_taller_completado', 'true');

      navigate('/student/liderazgo/unidad3/cierre');

    } catch (error) {

      localStorage.setItem('liderazgo_u3_taller_completado', 'true');

      navigate('/student/liderazgo/unidad3/cierre');

    }

  };

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* Header con scroll dinámico */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-8 overflow-hidden min-h-[60px]"

          animate={{

            minHeight: '60px',

            paddingTop: '0.5rem',

            paddingBottom: '0.5rem',

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

{/* Menú de usuario - Derecha */}

              <div className="flex justify-end">

                <div className="relative">

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

                    <div className="absolute right-full mr-2 top-0 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] border">

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

            <button onClick={() => navigate('/student/liderazgo')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Liderazgo

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Unidad 3 · Taller

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

              MÓDULO: Liderazgo

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

              Toma de Decisiones

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

              <p className="text-[10px] text-gray-500">Cierre</p>

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

            Paso 3: Taller

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Vamos a poner en práctica los conocimientos que hemos adquirido en esta unidad final de nuestro modulo de liderazgo. Completa los dos ejercicios siguientes.

            </p>

          </div>

        </div>

<div className="bg-white rounded-lg shadow-md p-6 md:p-8">

{/* Ejercicio 1: Ordenar los pasos */}

          <div className="mb-12">

            <h3

              className="text-[#006837] mb-4"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '1.5rem',

                fontWeight: 700,

              }}

            >

              Ejercicio 1: Ordena los pasos para tomar decisiones

            </h3>

            <p className="text-gray-700 mb-4 leading-relaxed">

              Arrastra los elementos para poner en orden los 4 pasos para tomar decisiones según la ruta para decidir:

            </p>

<div className="space-y-3 mb-6">

              {ordenPasos.map((pasoId, index) => {

                const paso = pasosOrden.find(p => p.id === pasoId);

                const isDragging = draggedPaso === pasoId;

                return (

                  <div

                    key={pasoId}

                    draggable={!ejercicio1Validado}

                    onDragStart={(e) => {

                      if (!ejercicio1Validado) {

                        handleDragStartOrden(e, pasoId);

                      }

                    }}

                    onDragOver={(e) => {

                      if (!ejercicio1Validado && draggedPaso && draggedPaso !== pasoId) {

                        handleDragOverOrden(e, index);

                      }

                    }}

                    onDragLeave={handleDragLeaveOrden}

                    onDrop={(e) => {

                      if (!ejercicio1Validado && draggedPaso && draggedPaso !== pasoId) {

                        handleDropOrden(e, index);

                      }

                    }}

                    onDragEnd={() => {

                      setDraggedPaso(null);

                      setDragOverIndex(null);

                    }}

                    onContextMenu={handleContextMenu}

                    className={`p-4 rounded-lg border-2 transition-all select-none ${ejercicio1Validado

                        ? 'border-green-500 bg-green-50 cursor-default'

                        : isDragging

                          ? 'opacity-50 cursor-move'

                          : dragOverIndex === index

                            ? 'border-[#AA27B9] bg-purple-50 scale-105 cursor-move'

                            : 'border-gray-200 bg-white hover:border-gray-400 cursor-move'

                      }`}

                  >

                    <div className="flex items-center gap-3">

                      <span className="text-gray-900 font-medium flex-1">{paso?.nombre}</span>

                      {!ejercicio1Validado && (

                        <span className="text-xs text-gray-500">↕️ Arrastra</span>

                      )}

                    </div>

                  </div>

                );

              })}

            </div>

<div className="flex gap-4 mb-4">

              <Button

                onClick={validarEjercicio1}

                className="bg-[#AA27B9] hover:bg-[#9d24ab] text-white"

              >

                Validar Orden

              </Button>

              <Button

                onClick={resetEjercicio1}

                variant="outline"

                className="border-gray-300 text-gray-700 hover:bg-gray-50"

              >

                <RotateCcw className="w-4 h-4 mr-2" />

                Reiniciar

              </Button>

            </div>

{ejercicio1Validado && (

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">

                <p className="text-green-800 text-sm md:text-base">

                  <strong>¡Bien!</strong> Tomar decisiones es un proceso, no una reacción. El orden importa para decidir con claridad.

                </p>

              </div>

            )}

          </div>

{/* Ejercicio 2: Emparejar pasos con orientaciones */}

          <div className="mb-8">

            <h3

              className="text-[#006837] mb-4"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '1.5rem',

                fontWeight: 700,

              }}

            >

              Ejercicio 2: Empareja cada paso con su orientación

            </h3>

            <p className="text-gray-700 mb-4 leading-relaxed">

              Arrastra las orientaciones de la derecha hacia cada paso de la izquierda para formar la respuesta correcta:

            </p>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Pasos (izquierda) */}

              <div className="space-y-4">

                <h4 className="font-semibold text-neutral-900 mb-3">Pasos</h4>

                {pasos.map((paso) => {

                  const orientacionAsignada = respuestas[paso.id];

                  const orientacionObj = orientaciones.find(o => o.id === orientacionAsignada);

                  const esCorrecta = ejercicio2Validado && orientacionObj && orientacionObj.respuestaCorrecta === paso.id;

                  const esIncorrecta = ejercicio2Validado && orientacionObj && orientacionObj.respuestaCorrecta !== paso.id;

return (

                    <div

                      key={paso.id}

                      onDragOver={(e) => handleDragOverPaso(e, paso.id)}

                      onDrop={(e) => handleDropOrientacion(e, paso.id)}

                      onDragLeave={() => setDragOverPaso(null)}

                      onContextMenu={handleContextMenu}

                      className={`p-4 rounded-lg border-2 min-h-[100px] transition-all select-none ${dragOverPaso === paso.id

                          ? 'border-[#AA27B9] bg-purple-50 scale-105'

                          : orientacionAsignada

                            ? esCorrecta

                              ? 'border-green-500 bg-green-50'

                              : esIncorrecta

                                ? 'border-red-500 bg-red-50'

                                : 'border-gray-200 bg-white'

                            : 'border-dashed border-gray-200 bg-gray-50'

                        }`}

                    >

                      <div className="font-semibold text-gray-900 mb-2">{paso.nombre}</div>

                      {orientacionAsignada ? (

                        <div className="flex items-center justify-between">

                          <span className={`text-sm ${esCorrecta ? 'text-green-700' : esIncorrecta ? 'text-red-700' : 'text-gray-700'}`}>

                            {orientacionObj?.texto}

                          </span>

                          {(!ejercicio2Validado || esIncorrecta) && (

                            <button

                              onClick={() => removerOrientacion(paso.id)}

                              className="text-red-600 hover:text-red-800 ml-2"

                            >

                              ×

                            </button>

                          )}

                        </div>

                      ) : (

                        <p className="text-xs text-gray-500 italic">Arrastra una orientación aquí</p>

                      )}

                    </div>

                  );

                })}

              </div>

{/* Orientaciones disponibles (derecha) */}

              <div className="space-y-4">

                <h4 className="font-semibold text-neutral-900 mb-3">Orientaciones</h4>

                {orientacionesDisponibles.map((orientacionId) => {

                  const orientacion = orientaciones.find(o => o.id === orientacionId);

                  if (!orientacion) return null;

return (

                    <div

                      key={orientacionId}

                      draggable

                      onDragStart={(e) => handleDragStartOrientacion(e, orientacionId)}

                      onDragEnd={() => setDraggedOrientacion(null)}

                      onContextMenu={handleContextMenu}

                      className="p-4 rounded-lg border-2 border-gray-200 bg-white cursor-move hover:border-gray-400 hover:shadow-md transition-all select-none"

                    >

                      <span className="text-gray-700">{orientacion.texto}</span>

                    </div>

                  );

                })}

              </div>

            </div>

<div className="flex gap-4 mt-6 mb-4">

              <Button

                onClick={validarEjercicio2}

                className="bg-[#AA27B9] hover:bg-[#9d24ab] text-white"

              >

                Validar Emparejamiento

              </Button>

              <Button

                onClick={resetEjercicio2}

                variant="outline"

                className="border-gray-300 text-gray-700 hover:bg-gray-50"

              >

                <RotateCcw className="w-4 h-4 mr-2" />

                Reiniciar

              </Button>

            </div>

{ejercicio2Validado && (

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">

                <p className="text-green-800 text-sm md:text-base">

                  <strong>¡Excelente!</strong> Decidir es liderar. Y liderar es asumir, aprender y avanzar. No temás equivocarte: teme no decidir.

                </p>

              </div>

            )}

          </div>

{/* Navigation */}

          <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200">

            <Button

              onClick={handleCompleteStep}

              disabled={!ejercicio1Validado || !ejercicio2Validado}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!(ejercicio1Validado && ejercicio2Validado) ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Continuar a Evaluación

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        </div>

      </div>

<Footer />

    </div>

  );

};

export default LiderazgoUnidad3TallerPage;


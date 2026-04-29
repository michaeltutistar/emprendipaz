import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, CheckCircle, X, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const actividades = [

  {

    id: 'actividad1',

    texto: 'Proponer ideas',

    funcionCorrecta: 'creativas'

  },

  {

    id: 'actividad2',

    texto: 'Manejar las redes sociales',

    funcionCorrecta: 'comerciales'

  },

  {

    id: 'actividad3',

    texto: 'Producir el producto',

    funcionCorrecta: 'operativas'

  },

  {

    id: 'actividad4',

    texto: 'Tomar decisiones clave',

    funcionCorrecta: 'estratégicas'

  },

  {

    id: 'actividad5',

    texto: 'Realizar pagos',

    funcionCorrecta: 'administrativas'

  }

];

const funciones = [

  { id: 'operativas', nombre: 'Operativas' },

  { id: 'administrativas', nombre: 'Administrativas' },

  { id: 'comerciales', nombre: 'Comerciales' },

  { id: 'creativas', nombre: 'Creativas' },

  { id: 'estratégicas', nombre: 'Estratégicas' }

];

const ACTIVIDAD_IDS = actividades.map((actividad) => actividad.id);

function readStoredJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

function sanitizeRespuestas(rawRespuestas = {}) {
  const respuestasNormalizadas = {};
  const actividadesAsignadas = new Set();

  funciones.forEach((funcion) => {
    const actividadId = rawRespuestas?.[funcion.id];

    if (!ACTIVIDAD_IDS.includes(actividadId) || actividadesAsignadas.has(actividadId)) {
      return;
    }

    respuestasNormalizadas[funcion.id] = actividadId;
    actividadesAsignadas.add(actividadId);
  });

  return respuestasNormalizadas;
}

function areRespuestasCorrect(respuestas = {}) {
  return funciones.every((funcion) => {
    const actividadId = respuestas[funcion.id];
    const actividad = actividades.find((item) => item.id === actividadId);
    return actividad && actividad.funcionCorrecta === funcion.id;
  });
}

const TrabajoEquipoUnidad1TallerPage = () => {

  const navigate = useNavigate();
  const initialRespuestasRef = useRef(
    sanitizeRespuestas(readStoredJson('te_u1_taller_respuestas', {}))
  );

  const [respuestas, setRespuestas] = useState(initialRespuestasRef.current);

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('te_u1_taller_validado');

    return saved === 'true' && areRespuestasCorrect(initialRespuestasRef.current);

  });

  const [draggedActividad, setDraggedActividad] = useState(null);

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

    localStorage.setItem('te_u1_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    localStorage.setItem('te_u1_taller_validado', validado.toString());

  }, [validado]);

useEffect(() => {

    localStorage.removeItem('te_u1_taller_disponibles');

  }, []);

const handleDragStart = (e, actividadId) => {

    setDraggedActividad(actividadId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, funcionId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(funcionId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, funcionId) => {

    e.preventDefault();

    if (draggedActividad) {

      const actividad = actividades.find(a => a.id === draggedActividad);

      if (actividad) {
        setRespuestas((prev) => {
          const nuevaRespuestas = { ...prev };

          Object.keys(nuevaRespuestas).forEach((key) => {
            if (nuevaRespuestas[key] === draggedActividad) {
              delete nuevaRespuestas[key];
            }
          });

          nuevaRespuestas[funcionId] = draggedActividad;

          return nuevaRespuestas;
        });
        setValidado(false);

      }

    }

    setDraggedActividad(null);

    setDragOver(null);

  };

const handleRemove = (funcionId) => {

    const actividadId = respuestas[funcionId];

    if (actividadId) {

      const nuevaRespuestas = { ...respuestas };

      delete nuevaRespuestas[funcionId];

      setRespuestas(nuevaRespuestas);
      setValidado(false);

    }

  };

const validarRespuestas = () => {
    if (areRespuestasCorrect(respuestas)) {

      setValidado(true);

    } else {

      alert('Algunas respuestas no son correctas. Por favor revisa y corrige.');

    }

  };

  const actividadesDisponibles = actividades
    .filter((actividad) => !Object.values(respuestas).includes(actividad.id))
    .map((actividad) => actividad.id);

  const handleResetActivity = () => {

    setRespuestas({});
    setValidado(false);
    setDraggedActividad(null);
    setDragOver(null);
    localStorage.removeItem('te_u1_taller_respuestas');
    localStorage.removeItem('te_u1_taller_validado');
    localStorage.removeItem('te_u1_taller_disponibles');

  };

const handleCompleteStep = async () => {

    if (!validado) {

      validarRespuestas();

      return;

    }

try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Trabajo en Equipo',

          paso_nombre: 'Unidad 1: Taller',

          curso_nombre: 'Trabajo en Equipo'

        })

      });

      navigate('/student/trabajo-equipo/unidad1/cierre');

    } catch (error) {

      navigate('/student/trabajo-equipo/unidad1/cierre');

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

                      Trabajo en Equipo

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

                Módulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button

                onClick={() => navigate('/student/trabajo-equipo')}

                className="text-gray-600 hover:text-[#006837] transition-colors"

              >

                Trabajo en Equipo

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Conformación del Equipo · Taller

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

<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">

            <div className="flex-1">

              <p className="text-white/70 uppercase text-sm tracking-wider mb-3">MÓDULO: Trabajo en Equipo</p>

              <h1

                className="text-white mb-3"

                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}

              >

                Conformación del Equipo de Trabajo

              </h1>

              <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

                Empareja la acción de la derecha con la función de la izquierda para identificar a qué función corresponde cada actividad.

              </p>

            </div>

            <div className="bg-white/10 backdrop-blur-sm border-l-3 border-white/50 rounded-lg p-3 flex-1 max-w-md">

              <p className="text-white/90 text-sm leading-snug">

                <strong>📌 Instrucciones Paso 3:</strong> Arrastra las actividades hacia las funciones correspondientes. Valida tus respuestas antes de continuar.

              </p>

            </div>

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

{/* Progress Steps */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#006837] to-[#59D22E] z-0"

              initial={{ width: 0 }}

              animate={{ width: '75%' }}

              transition={{ duration: 1 }}

            ></motion.div>

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#006837] to-[#59D22E] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                1

              </div>

              <p className="text-[10px] text-gray-500">Presentación</p>

            </div>

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#006837] to-[#59D22E] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                2

              </div>

              <p className="text-[10px] text-gray-500">Fundamentación</p>

            </div>

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: "spring", stiffness: 200 }}

                className="bg-gradient-to-br from-[#006837] to-[#59D22E] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                3

              </motion.div>

              <p className="text-[10px] text-[#AA27B9] font-bold">Taller</p>

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

<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-6">

            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Taller: Identificando funciones</h2>

            <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded">

              <p className="text-neutral-700 text-sm md:text-base mb-2">

                <strong>📌 Instrucciones:</strong> Empareja la acción de la derecha con la función de la izquierda para identificar 

                a qué función corresponde cada actividad. Arrastra las actividades hacia las funciones correspondientes.

              </p>

            </div>

          </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* Funciones (izquierda) */}

            <div>

              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Funciones</h3>

              <div className="space-y-3">

                {funciones.map((funcion) => {

                  const actividadId = respuestas[funcion.id];

                  const actividad = actividadId ? actividades.find(a => a.id === actividadId) : null;

                  const isCorrect = actividad && actividad.funcionCorrecta === funcion.id;

return (

                    <div

                      key={funcion.id}

                      onDragOver={(e) => handleDragOver(e, funcion.id)}

                      onDragLeave={handleDragLeave}

                      onDrop={(e) => handleDrop(e, funcion.id)}

                      onContextMenu={handleContextMenu}

                      className={`min-h-[80px] p-4 rounded-lg border-2 transition-all select-none ${

                        dragOver === funcion.id

                          ? 'border-blue-500 bg-blue-50'

                          : actividad

                            ? isCorrect

                              ? 'border-green-500 bg-green-50'

                              : 'border-red-500 bg-red-50'

                            : 'border-neutral-300 bg-neutral-50'

                      }`}

                    >

                      <div className="flex items-center justify-between mb-2">

                        <span className="font-semibold text-neutral-900">{funcion.nombre}</span>

                        {actividad && (

                          <button

                            onClick={() => handleRemove(funcion.id)}

                            className="text-red-600 hover:text-red-800"

                          >

                            <X className="w-4 h-4" />

                          </button>

                        )}

                      </div>

                      {actividad && (

                        <div className={`mt-2 p-2 rounded ${

                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

                        }`}>

                          <p className="text-sm font-medium">{actividad.texto}</p>

                        </div>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

{/* Actividades (derecha) */}

            <div>

              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Actividades</h3>

              <div className="space-y-3">

                {actividadesDisponibles.map((actividadId) => {

                  const actividad = actividades.find(a => a.id === actividadId);

                  if (!actividad) return null;

return (

                    <div

                      key={actividad.id}

                      draggable

                      onDragStart={(e) => handleDragStart(e, actividad.id)}

                      onContextMenu={handleContextMenu}

                      className="bg-white border-2 border-neutral-300 p-4 rounded-lg cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all select-none"

                    >

                      <p className="text-sm md:text-base text-neutral-700">{actividad.texto}</p>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>

{validado && (

            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-6">

              <p className="text-green-800 text-sm md:text-base font-semibold">

                "Conocer a tu equipo es el primer paso para liderar con claridad. Un rol bien definido es una tarea bien encaminada."

              </p>

            </div>

          )}

<div className="flex flex-col sm:flex-row justify-end gap-3">

            <Button

              onClick={handleResetActivity}
              type="button"

              className="bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 px-8 py-4"

            >

              Reiniciar actividad

            </Button>

            <Button

              onClick={handleCompleteStep}

              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2"

            >

              {validado ? 'Continuar a Evaluación' : 'Validar Respuestas'}

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        </div>

      </div>

<div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/trabajo-equipo/unidad1')}

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

export default TrabajoEquipoUnidad1TallerPage;


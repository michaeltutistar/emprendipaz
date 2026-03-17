import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const preguntas = [

  {

    id: 1,

    pregunta: 'Una propuesta de valor sólida debe incluir:',

    opciones: [

      { id: 'a', texto: 'Solo el producto ofrecido' },

      { id: 'b', texto: 'Problema que resuelve + beneficio + diferencia' },

      { id: 'c', texto: 'Precio más bajo que la competencia' }

    ],

    respuestaCorrecta: 'b'

  },

  {

    id: 2,

    pregunta: '¿Qué aspecto genera mayor confianza en un producto?',

    opciones: [

      { id: 'a', texto: 'Diseño innovador' },

      { id: 'b', texto: 'Garantía o respaldo ofrecido' },

      { id: 'c', texto: 'Precio accesible' }

    ],

    respuestaCorrecta: 'b'

  },

  {

    id: 3,

    pregunta: '"Orgullo de consumir algo único/local" corresponde a:',

    opciones: [

      { id: 'a', texto: 'Diferenciación' },

      { id: 'b', texto: 'Generador de confianza' },

      { id: 'c', texto: 'Valor emocional' }

    ],

    respuestaCorrecta: 'c'

  },

  {

    id: 4,

    pregunta: '¿Qué compromiso adicional refuerza una propuesta de valor?',

    opciones: [

      { id: 'a', texto: 'Solo reducción de costos' },

      { id: 'b', texto: 'Atención personalizada' },

      { id: 'c', texto: 'Ninguno' }

    ],

    respuestaCorrecta: 'b'

  },

  {

    id: 5,

    pregunta: 'Una propuesta de valor débil se caracteriza por:',

    opciones: [

      { id: 'a', texto: 'Resolver necesidades reales del cliente' },

      { id: 'b', texto: 'Incluir sostenibilidad y calidad' },

      { id: 'c', texto: 'Ser genérica y no diferenciarse' }

    ],

    respuestaCorrecta: 'c'

  }

];

const ResultadoModal = ({ resultado, onClose }) => {

  const todoCorrecto = resultado.correctas === resultado.total;

return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">

        <div className={`py-6 px-8 rounded-t-2xl ${todoCorrecto ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`}>

          <div className="flex items-center justify-center gap-3 text-white">

            {todoCorrecto ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}

            <div>

              <h2 className="text-[24px] font-bold">

                {todoCorrecto ? '¡Excelente!' : 'Puedes mejorar'}

              </h2>

              <p className="text-sm opacity-90">

                {resultado.correctas} de {resultado.total} respuestas correctas

              </p>

            </div>

          </div>

        </div>

        <div className="p-6">

          <p className="text-neutral-700 mb-4">

            {todoCorrecto 

              ? 'Has completado éxitosamente la evaluación. ¡Felicidades!'

              : 'Revisa los temás y vuelve a intentar. Las siguientes preguntas necesitan corrección:'}

          </p>

          {!todoCorrecto && resultado.preguntasIncorrectas && resultado.preguntasIncorrectas.length > 0 && (

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">

              <ul className="space-y-2">

                {resultado.preguntasIncorrectas.map((pregunta) => (

                  <li key={pregunta.id} className="text-sm text-red-700">

                    • Pregunta {pregunta.id}: {pregunta.pregunta}

                  </li>

                ))}

              </ul>

            </div>

          )}

          <div className="flex justify-end">

            <Button onClick={onClose} className="bg-neutral-900 hover:bg-neutral-800 text-white">

              Continuar

            </Button>

          </div>

        </div>

      </div>

    </div>

  );

};

const ModeloNegociosUnidad2CierrePage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState({});

  const [mostrarResultado, setmostrarResultado] = useState(false);

  const [resultado, setResultado] = useState(null);

  const enviandoIntentoRef = useRef(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const [evaluaciónCompleta, setEvaluaciónCompleta] = useState(false);

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Modelo de Negocios', 'Unidad 2: Evaluación');

  const evaluaciónBloqueada = pasoCompletado || evaluaciónCompleta;

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

// Sincronizar con progreso ya guardado en backend

  useEffect(() => {

    if (pasoCompletado) {

      setEvaluaciónCompleta(true);

    }

  }, [pasoCompletado]);

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

const handleEvaluaciónSubmit = async (e) => {

    e.preventDefault();

    if (enviandoIntentoRef.current || evaluaciónBloqueada) return;

    enviandoIntentoRef.current = true;

const correctas = preguntas.filter(p => respuestas[p.id] === p.respuestaCorrecta).length;

    const preguntasIncorrectas = preguntas.filter(p => respuestas[p.id] && respuestas[p.id] !== p.respuestaCorrecta).map(p => ({

      id: p.id,

      pregunta: p.pregunta

    }));

const todasCorrectas = correctas === preguntas.length;

setResultado({

      correctas,

      total: preguntas.length,

      preguntasIncorrectas

    });

    setmostrarResultado(true);

// Registrar intento de evaluación

    try {

      const token = getAuthToken();

      const apiUrl = import.meta.env.MODE === 'production'

        ? `${API_BASE_URL}/registrar-intento-evaluacion`

        : `${API_BASE_URL}/registrar-intento-evaluacion`;

await fetch(apiUrl, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Modelo de Negocios',

          unidad_nombre: 'Unidad 2',

          paso_nombre: 'Unidad 2: Evaluación',

          todas_correctas: todasCorrectas

        })

      });

    } catch (error) {

      console.error('Error al registrar intento de evaluación:', error);

    } finally {

      enviandoIntentoRef.current = false;

    }

// Si todas las respuestas son correctas, marcar la unidad como completada

    if (todasCorrectas) {

      setEvaluaciónCompleta(true);

      window.dispatchEvent(new Event('progreso-actualizado'));

    }

  };

const handleFinalizar = async () => {

    if (!evaluaciónCompleta) return;

    sessionStorage.setItem('scrollToComencemás', 'true');

    // Registrar progreso en backend vía hook

    await registrarProgreso();

    navigate('/student/modelo-negocios');

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

                Propuesta de Valor · Evaluación

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

              Propuesta de Valor

            </h1>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z" fill="white"/>

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

              animate={{ width: '100%' }}

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

{/* Step 3 - Completado */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                3

              </div>

              <p className="text-[10px] text-gray-500">Taller</p>

            </div>

{/* Step 4 - Active */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: "spring", stiffness: 200 }}

                className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                4

              </motion.div>

              <p className="text-[10px] text-[#AA27B9] font-bold">Evaluación</p>

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

              Cuestionario de cierre de unidad

            </h2>

            <p className="text-neutral-700 mb-4 text-sm md:text-base leading-relaxed">

              Para cerrar la Unidad 2: "Propuesta de valor", realiza el siguiente cuestionario y pon a prueba tus conocimientos.

            </p>

            <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 mb-6">

              <p className="text-gray-700 leading-snug text-xs">

                <strong>📌 Instrucciones:</strong> Responde las siguientes 5 preguntas de selección múltiple sobre Propuesta de valor.

              </p>

            </div>

{evaluaciónBloqueada && (

              <div className="mb-4 bg-green-50 border border-green-200 text-green-900 rounded-xl p-3">

                <p className="font-semibold text-sm">

                  Evaluación ya completada

                </p>

                <p className="text-xs mt-1">

                  Esta evaluación ya fue aprobada correctamente para este usuario. No se permiten más intentos en este modulo.

                </p>

              </div>

            )}

          </div>

<form onSubmit={handleEvaluaciónSubmit} className="space-y-6">

            {preguntas.map((pregunta) => (

              <div key={pregunta.id} className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-6">

                <div className="mb-4">

                  <span className="text-neutral-900 font-bold">Pregunta {pregunta.id}</span>

                  <p className="text-neutral-700 mt-2 leading-relaxed text-sm md:text-base">{pregunta.pregunta}</p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  {pregunta.opciones.map((opcion) => {

                    const isSelected = respuestas[pregunta.id] === opcion.id;

                    const isCorrect = mostrarResultado && resultado && pregunta.respuestaCorrecta === opcion.id && isSelected;

                    const isIncorrect = mostrarResultado && resultado && isSelected && pregunta.respuestaCorrecta !== opcion.id;

                    const isCorrectAnswer = mostrarResultado && resultado && pregunta.respuestaCorrecta === opcion.id;

return (

                      <button

                        key={opcion.id}

                        type="button"

                        onClick={() => {

                          if (!mostrarResultado && !evaluaciónBloqueada) {

                            setRespuestas({...respuestas, [pregunta.id]: opcion.id});

                          }

                        }}

                        className={`text-left border-2 rounded-lg px-4 py-3 text-sm md:text-base transition-all ${

                          isCorrect

                            ? 'bg-green-500 text-white border-green-600'

                            : isIncorrect

                            ? 'bg-red-500 text-white border-red-600'

                            : isCorrectAnswer

                            ? 'bg-green-100 text-green-800 border-green-400'

                            : isSelected

                            ? 'bg-neutral-900 text-white border-neutral-900'

                            : 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900'

                        } ${evaluaciónBloqueada ? 'opacity-60 cursor-not-allowed' : ''}`}

                      >

                        <span className="font-semibold mr-2">{opcion.id}.</span>

                        {opcion.texto}

                      </button>

                    );

                  })}

                </div>

              </div>

            ))}

<div className="flex justify-end">

              <Button

                type="submit"

                disabled={Object.keys(respuestas).length < preguntas.length || mostrarResultado || evaluaciónBloqueada}

                className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"

              >

                Enviar Respuestas

                <ChevronRight className="w-5 h-5" />

              </Button>

            </div>

          </form>

        </div>

      </div>

{mostrarResultado && resultado && (

        <ResultadoModal 

          resultado={resultado} 

          onClose={() => {

            setmostrarResultado(false);

            if (resultado.correctas === resultado.total) {

              handleFinalizar();

            }

          }} 

        />

      )}

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/modelo-negocios/unidad2/taller');

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

export default ModeloNegociosUnidad2CierrePage;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, CheckCircle, XCircle, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const preguntas = [

  {

    id: 1,

    pregunta: '¿Qué documento permite visualizar ingresos y egresos futuros de un negocio?',

    opciones: [

      { id: 'a', texto: 'Plan de negocios' },

      { id: 'b', texto: 'Flujo de caja' },

      { id: 'c', texto: 'Balance general' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: {

      incorrectas: {

        a: 'El plan de negocios describe la estrategia, pero no visualiza ingresos y egresos futuros de manera específica.',

        c: 'El balance general muestra la situación financiera en un momento determinado, no proyecciones futuras.'

      }

    }

  },

  {

    id: 2,

    pregunta: '¿Cuál fuente de financiamiento no genera deuda pero suele ser limitada?',

    opciones: [

      { id: 'a', texto: 'Capital propio' },

      { id: 'b', texto: 'Crédito bancario' },

      { id: 'c', texto: 'Microcrédito' }

    ],

    respuestaCorrecta: 'a',

    retroalimentacion: {

      incorrectas: {

        b: 'El crédito bancario genera deuda y requiere pago de intereses.',

        c: 'El microcrédito también genera deuda, aunque sea más accesible.'

      }

    }

  },

  {

    id: 3,

    pregunta: '¿Qué indicador muestra en cuánto tiempo se recupera la inversión?',

    opciones: [

      { id: 'a', texto: 'VAN' },

      { id: 'b', texto: 'Período de retorno' },

      { id: 'c', texto: 'Punto de equilibrio' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: {

      incorrectas: {

        a: 'El VAN (Valor Actual Neto) mide la riqueza adicional generada, no el tiempo de recuperación.',

        c: 'El punto de equilibrio indica el nivel mínimo de ventas para cubrir costos, no el tiempo de recuperación.'

      }

    }

  },

  {

    id: 4,

    pregunta: 'Si el VAN de una inversión es negativo, ¿qué significa?',

    opciones: [

      { id: 'a', texto: 'La inversión destruye valor' },

      { id: 'b', texto: 'La inversión es neutral' },

      { id: 'c', texto: 'La inversión genera riqueza' }

    ],

    respuestaCorrecta: 'a',

    retroalimentacion: {

      incorrectas: {

        b: 'Un VAN negativo no es neutral; indica pérdida de valor.',

        c: 'Un VAN negativo significa que no genera riqueza, por el contrario, destruye valor.'

      }

    }

  },

  {

    id: 5,

    pregunta: '¿Por qué es importante analizar escenarios optimistas, base y pesimista?',

    opciones: [

      { id: 'a', texto: 'Para anticipar riesgos y tomar decisiones informadas' },

      { id: 'b', texto: 'Para eliminar toda incertidumbre' },

      { id: 'c', texto: 'Para reducir costos fijos' }

    ],

    respuestaCorrecta: 'a',

    retroalimentacion: {

      incorrectas: {

        b: 'No es posible eliminar toda incertidumbre, pero sí se puede anticipar y gestionar.',

        c: 'El análisis de escenarios no está directamente relacionado con la reducción de costos fijos.'

      }

    }

  }

];

const ResultadoModal = ({ resultado, onClose, onFinalizar }) => {

  const todoCorrecto = resultado.incorrectas.length === 0;

const handleContinuar = () => {

    if (todoCorrecto && onFinalizar) {

      onFinalizar();

    } else {

      onClose();

    }

  };

return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">

        <div className={`py-6 px-8 rounded-t-2xl ${todoCorrecto ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`}>

          <div className="flex items-center justify-center gap-3 text-white">

            {todoCorrecto ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}

            <div>

              <h2 className="text-[24px] font-bold">

                {todoCorrecto ? '¡Excelente!' : 'Revisa tus respuestas'}

              </h2>

              <p className="text-sm">

                {todoCorrecto ? 'Has completado la evaluación correctamente.' : 'Algunas respuestas necesitan corrección.'}

              </p>

            </div>

          </div>

        </div>

        <div className="p-8 space-y-4">

          <div className="flex items-center justify-between">

            <span className="text-neutral-700">Respuestas correctas:</span>

            <span className="font-bold text-green-600 text-[24px]">{resultado.correctas}/5</span>

          </div>

          {!todoCorrecto && (

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">

              <p className="font-bold text-red-900 mb-2">Preguntas con errores:</p>

              <ul className="space-y-2 text-sm text-red-700">

                {resultado.incorrectas.map((error) => (

                  <li key={error.pregunta}>

                    • Pregunta {error.pregunta}: seleccionaste la opción {error.respuesta}

                  </li>

                ))}

              </ul>

            </div>

          )}

          {todoCorrecto && (

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800">

              ¡Felicitaciones! Has completado la Unidad 2 de Plan de Inversión.

            </div>

          )}

          <Button

            onClick={handleContinuar}

            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3"

          >

            {todoCorrecto ? 'Continuar' : 'Revisar respuestas'}

          </Button>

        </div>

      </div>

    </div>

  );

};

const PlanInversionUnidad2CierrePage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState({});

  const [preguntasValidadas, setPreguntasValidadas] = useState(new Set());

  const [resultado, setResultado] = useState(null);

  const [mostrarRetroalimentacion, setmostrarRetroalimentacion] = useState(false);

  const [mostrarResultado, setmostrarResultado] = useState(false);

  const [unidadCompletada, setUnidadCompletada] = useState(false);

  const [enviandoIntento, setEnviandoIntento] = useState(false);

  const enviandoIntentoRef = useRef(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Plan de Inversión', 'Unidad 2: Evaluación');

  const evaluaciónBloqueada = unidadCompletada || pasoCompletado;

useEffect(() => {

    window.scrollTo(0, 0);

    const savedRespuestas = localStorage.getItem('plan_inversion_unidad2_evaluación_respuestas');

    if (savedRespuestas) {

      setRespuestas(JSON.parse(savedRespuestas));

    }

  }, []);

// Sincronizar la UI con el progreso guardado en el backend

  useEffect(() => {

    if (pasoCompletado) {

      setUnidadCompletada(true);

    }

  }, [pasoCompletado]);

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

const handleRespuesta = (preguntaId, opcionId) => {

    if (evaluaciónBloqueada) return;

    setRespuestas(prev => {

      const nuevasRespuestas = {

        ...prev,

        [preguntaId]: opcionId

      };

      localStorage.setItem('plan_inversion_unidad2_evaluación_respuestas', JSON.stringify(nuevasRespuestas));

// Si ya se había validado, resetear estados para permitir nueva validación

      if (mostrarRetroalimentacion || mostrarResultado) {

        setmostrarRetroalimentacion(false);

        setmostrarResultado(false);

        setResultado(null);

        setPreguntasValidadas(new Set());

      }

return nuevasRespuestas;

    });

  };

const evaluarRespuestas = async () => {

    if (evaluaciónBloqueada) return;

    if (enviandoIntentoRef.current) return;

    enviandoIntentoRef.current = true;

// Validar todas las preguntas y marcar las incorrectas para mostrar retroalimentación

    const nuevasValidadas = new Set();

    preguntas.forEach(p => {

      if (respuestas[p.id] && respuestas[p.id] !== p.respuestaCorrecta) {

        nuevasValidadas.add(p.id);

      }

    });

    setPreguntasValidadas(nuevasValidadas);

    setmostrarRetroalimentacion(true);

// Calcular el resultado para el modal

    const correctas = preguntas.filter(p => respuestas[p.id] === p.respuestaCorrecta).length;

    const incorrectas = preguntas

      .filter(p => respuestas[p.id] && respuestas[p.id] !== p.respuestaCorrecta)

      .map(p => ({

        pregunta: p.id,

        respuesta: respuestas[p.id]

      }));

const resultadoEvaluación = {

      correctas,

      incorrectas,

      total: preguntas.length

    };

const todasCorrectas = incorrectas.length === 0;

// Registrar intento de evaluación

    try {

      setEnviandoIntento(true);

      const token = getAuthToken();

      const apiUrl = `${API_BASE_URL}/registrar-intento-evaluacion`;

      await fetch(apiUrl, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Plan de Inversión',

          unidad_nombre: 'Unidad 2',

          paso_nombre: 'Unidad 2: Evaluación',

          todas_correctas: todasCorrectas

        })

      });

    } catch (error) {

      console.error('Error al registrar intento de evaluación:', error);

    } finally {

      setEnviandoIntento(false);

      enviandoIntentoRef.current = false;

    }

setResultado(resultadoEvaluación);

    setmostrarResultado(true);

if (todasCorrectas) {

      setUnidadCompletada(true);

      // Registrar progreso cuando se completa correctamente

      try {

        await registrarProgreso();

      } catch (error) {

        console.error('Error al registrar progreso:', error);

      }

    }

  };

const handleCerrarModal = async () => {

    setmostrarResultado(false);

// Si todas son correctas, registrar progreso y navegar

    if (resultado && resultado.incorrectas.length === 0) {

      try {

        const token = getAuthToken();

        const apiUrl = `${API_BASE_URL}/registrar-progreso-modulo`;

        await fetch(apiUrl, {

          method: 'POST',

          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

          body: JSON.stringify({

            modulo_nombre: 'Plan de Inversión',

            paso_nombre: 'Unidad 2: Evaluación',

            curso_nombre: 'Plan de Inversión'

          })

        });

        window.dispatchEvent(new Event('progreso-actualizado'));

        navigate('/student/plan-inversion');

      } catch (e) {

        window.dispatchEvent(new Event('progreso-actualizado'));

        navigate('/student/plan-inversion');

      }

    }

  };

const allAnswered = Object.keys(respuestas).length === preguntas.length;

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

                      Plan de Inversión

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

                        onClick={handleLogout}

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

            <button onClick={() => navigate('/student/plan-inversion')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Plan de Inversión

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Análisis y Estructura Financiera del Plan de Inversión

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

              Análisis y Estructura Financiera del Plan de Inversión

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

            Paso 4: Evaluación

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Responde las siguientes preguntas para verificar tu comprensión de los conceptos fundamentales.

            </p>

          </div>

        </div>

<motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100"

        >

          <div className="mb-8">

            <h3

              className="text-[#006837] mb-4"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '1.5rem',

                fontWeight: 600,

              }}

            >

              Evaluación de Conocimientos

            </h3>

            <p className="text-gray-700 leading-relaxed">

              Para cerrar la Unidad 2: "Análisis y Estructura Financiera del Plan de Inversión", realiza el siguiente cuestionario y pon a prueba tus conocimientos.

            </p>

          </div>

{/* Banner de evaluación ya completada */}

          {evaluaciónBloqueada && (

            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">

              <div className="flex items-center gap-2">

                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />

                <p className="text-green-800 font-semibold">

                  Evaluación ya completada. No se permiten más intentos.

                </p>

              </div>

            </div>

          )}

{/* Preguntas */}

          <div className="space-y-6 mb-8">

            {preguntas.map((p) => {

              const esCorrecta = respuestas[p.id] === p.respuestaCorrecta;

              const estaValidada = preguntasValidadas.has(p.id);

              const mostrarRetro = mostrarRetroalimentacion && estaValidada && !esCorrecta;

return (

                <div key={p.id} className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-6">

                  <div className="mb-4">

                    <span className="text-neutral-900 font-bold">Pregunta {p.id}</span>

                    <p className="text-neutral-700 mt-2 leading-relaxed">{p.pregunta}</p>

                  </div>

<div className="flex gap-4 flex-wrap">

                    {p.opciones.map((op) => (

                      <button

                        key={op.id}

                        onClick={() => !evaluaciónBloqueada && handleRespuesta(p.id, op.id)}

                        disabled={evaluaciónBloqueada}

                        className={`flex-1 min-w-[200px] py-3 px-6 rounded-lg border-2 transition-all ${evaluaciónBloqueada ? 'opacity-50 cursor-not-allowed' : ''

                          } ${mostrarRetroalimentacion && respuestas[p.id] === op.id

                            ? (op.id === p.respuestaCorrecta

                              ? 'bg-green-100 border-green-600 text-green-800'

                              : 'bg-red-100 border-red-600 text-red-800')

                            : respuestas[p.id] === op.id

                              ? 'bg-neutral-900 text-white border-neutral-900'

                              : 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900'

                          }`}

                      >

                        {op.id}. {op.texto}

                      </button>

                    ))}

                  </div>

{mostrarRetro && (

                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">

                      <p className="font-bold mb-1">Retroalimentación:</p>

                      <p>

                        {p.retroalimentacion.incorrectas[respuestas[p.id]] || 'Revisa la fundamentación para entender mejor.'}

                      </p>

                    </div>

                  )}

                  {mostrarRetroalimentacion && esCorrecta && (

                    <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">

                      <p className="font-bold mb-1">✓ Respuesta Correcta</p>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

{/* Botones */}

          <div className="flex justify-end items-center gap-4">

            <Button

              onClick={evaluarRespuestas}

              disabled={!allAnswered || enviandoIntento || evaluaciónBloqueada}

              className={`bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 ${(!allAnswered || enviandoIntento || evaluaciónBloqueada) ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              {allAnswered ? 'Enviar Respuestas' : 'Responde todas las preguntas para continuar'}

            </Button>

          </div>

        </motion.div>

      </div>

{/* Modal de Resultado */}

      {mostrarResultado && resultado && (

        <ResultadoModal

          resultado={resultado}

          onClose={handleCerrarModal}

          onFinalizar={handleCerrarModal}

        />

      )}

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/plan-inversion/unidad2/taller');

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

export default PlanInversionUnidad2CierrePage;


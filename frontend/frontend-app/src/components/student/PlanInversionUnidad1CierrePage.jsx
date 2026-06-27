import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, CheckCircle, XCircle, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { clearLocalSession, getAuthToken } from '@/utils/auth-storage'

const preguntas = [

  {

    id: 1,

    pregunta: '¿Cuál es la diferencia principal entre un plan de negocios y un plan de inversión?',

    opciones: [

      { id: 'a', texto: 'El plan de negocios describe la estrategia; el plan de inversión específica activos y costos' },

      { id: 'b', texto: 'Ambos son idénticos' },

      { id: 'c', texto: 'El plan de inversión solo aplica a empresas formalizadas' }

    ],

    respuestaCorrecta: 'a'

  },

  {

    id: 2,

    pregunta: '¿Cuál de los siguientes es un ejemplo de capital de trabajo?',

    opciones: [

      { id: 'a', texto: 'Compra de un horno industrial' },

      { id: 'b', texto: 'Dinero para adquirir materia prima inicial' },

      { id: 'c', texto: 'Registro de marca' }

    ],

    respuestaCorrecta: 'b'

  },

  {

    id: 3,

    pregunta: '¿Qué componente permite demostrar la viabilidad financiera de una inversión?',

    opciones: [

      { id: 'a', texto: 'Cronograma de ejecución' },

      { id: 'b', texto: 'Proyecciones de resultados' },

      { id: 'c', texto: 'Especificación técnica del activo' }

    ],

    respuestaCorrecta: 'b'

  },

  {

    id: 4,

    pregunta: '¿Cuál es la principal ventaja de contar con un plan de inversión formal?',

    opciones: [

      { id: 'a', texto: 'Garantiza decisiones informadas y acceso a financiamiento.' },

      { id: 'b', texto: 'Elimina todos los riesgos de inversión.' },

      { id: 'c', texto: 'Sustituye la necesidad de un plan de negocios.' }

    ],

    respuestaCorrecta: 'a'

  },

  {

    id: 5,

    pregunta: '¿Qué tipo de inversión corresponde a la capacitación de empleados en servicio al cliente?',

    opciones: [

      { id: 'a', texto: 'Activo fijo' },

      { id: 'b', texto: 'Capital de trabajo' },

      { id: 'c', texto: 'Inversión intangible' }

    ],

    respuestaCorrecta: 'c'

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

      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

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

              <p className="font-semibold mb-2">¡Felicitaciones!</p>

              <p className="text-sm">

                Has completado la Unidad 1: Fundamentación Teórica del Plan de Inversión.

                Recuerda: invertir sin plan es especular. Invertir con plan es estrategia.

              </p>

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

const PlanInversionUnidad1CierrePage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState({});

  const [resultado, setResultado] = useState(null);

  const [mostrarResultado, setmostrarResultado] = useState(false);

  const [unidadCompletada, setUnidadCompletada] = useState(false);

  const [enviandoIntento, setEnviandoIntento] = useState(false);

  const enviandoIntentoRef = useRef(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Plan de Inversión', 'Unidad 1: Evaluación');

  const evaluaciónBloqueada = unidadCompletada || pasoCompletado;

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

// Sincronizar la UI con el progreso guardado en el backend

  useEffect(() => {

    if (pasoCompletado) {

      setUnidadCompletada(true);

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

    let ticking = false;

    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          setIsScrolled(window.scrollY > 70);

          ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

const handleLogout = () => {
    clearLocalSession();
    localStorage.removeItem('userData');
    navigate('/login');

  };

const handleRespuesta = (preguntaId, opcionId) => {

    if (evaluaciónBloqueada) return;

    setRespuestas(prev => ({

      ...prev,

      [preguntaId]: opcionId

    }));

  };

const evaluarRespuestas = async () => {

    if (evaluaciónBloqueada) return;

    if (enviandoIntentoRef.current) return;

    enviandoIntentoRef.current = true;

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

setResultado(resultadoEvaluación);

    setmostrarResultado(true);

const todasCorrectas = correctas === preguntas.length;

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

          unidad_nombre: 'Unidad 1',

          paso_nombre: 'Unidad 1: Evaluación',

          todas_correctas: todasCorrectas

        })

      });

    } catch (error) {

      console.error('Error al registrar intento de evaluación:', error);

    } finally {

      setEnviandoIntento(false);

      enviandoIntentoRef.current = false;

    }

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

const handleFinalizar = async () => {

    sessionStorage.setItem('scrollToComencemas', 'true');

    try {

      const token = getAuthToken();

      const apiUrl = `${API_BASE_URL}/registrar-progreso-modulo`;

      await fetch(apiUrl, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Plan de Inversión',

          paso_nombre: 'Unidad 1: Evaluación',

          curso_nombre: 'Plan de Inversión'

        })

      });

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/plan-inversion');

    } catch (error) {

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/plan-inversion');

    }

  };

const todasRespondidas = Object.keys(respuestas).length === preguntas.length;

return (

    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">

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

{/* CAPA INTERMEDIA: Elementos flotantes ascendiendo en diagonal -48 grados */}

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

                      Unidad 1

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

                                        <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/student/perfil');
                      }}
                      className="max-w-[180px] truncate text-sm font-semibold text-white"
                    >
                      {userName || 'Usuario'}
                    </span>

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

              Módulos

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

              Unidad 1 · Evaluación

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

              Evaluación Final

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

<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-6">

            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Paso 4: Evaluación de Cierre</h2>

            <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded">

              <p className="text-neutral-700 text-sm md:text-base">

                <strong>📌 Instrucciones:</strong> Para cerrar la Unidad 1: "Fundamentación teórica del plan de inversión", realiza el siguiente cuestionario y pon a prueba tus conocimientos.

              </p>

            </div>

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

<div className="space-y-8">

            {preguntas.map((pregunta) => {

              const respuestaSeleccionada = respuestas[pregunta.id];

              const esCorrecta = respuestaSeleccionada === pregunta.respuestaCorrecta;

              const mostrarFeedback = resultado && respuestaSeleccionada;

return (

                <div

                  key={pregunta.id}

                  className={`border-2 rounded-lg p-6 ${mostrarFeedback

                    ? esCorrecta

                      ? 'border-green-500 bg-green-50'

                      : 'border-red-500 bg-red-50'

                    : 'border-neutral-200'

                    }`}

                >

                  <div className="flex items-start gap-3 mb-4">

                    <span className="bg-neutral-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">

                      {pregunta.id}

                    </span>

                    <p className="text-base md:text-lg font-semibold text-neutral-900 flex-1">

                      {pregunta.pregunta}

                    </p>

                  </div>

<div className="space-y-3 ml-11">

                    {pregunta.opciones.map((opcion) => {

                      const estaSeleccionada = respuestaSeleccionada === opcion.id;

                      const esLaCorrecta = opcion.id === pregunta.respuestaCorrecta;

                      const mostrarCorrecta = resultado && esLaCorrecta;

                      const mostrarIncorrecta = resultado && estaSeleccionada && !esCorrecta;

return (

                        <label

                          key={opcion.id}

                          className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${evaluaciónBloqueada ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

                            } ${estaSeleccionada

                              ? mostrarCorrecta

                                ? 'border-green-600 bg-green-100'

                                : mostrarIncorrecta

                                  ? 'border-red-600 bg-red-100'

                                  : 'border-green-600 bg-green-50'

                              : mostrarCorrecta

                                ? 'border-green-300 bg-green-50'

                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'

                            }`}

                        >

                          <input

                            type="radio"

                            name={`pregunta-${pregunta.id}`}

                            value={opcion.id}

                            checked={estaSeleccionada}

                            onChange={() => !evaluaciónBloqueada && handleRespuesta(pregunta.id, opcion.id)}

                            className="mt-1"

                            disabled={!!resultado || evaluaciónBloqueada}

                          />

                          <div className="flex-1">

                            <span className="font-semibold text-neutral-900 mr-2">{opcion.id}.</span>

                            <span className="text-neutral-700">{opcion.texto}</span>

                            {mostrarCorrecta && (

                              <div className="mt-2 flex items-center gap-2 text-green-700">

                                <CheckCircle className="w-4 h-4" />

                                <span className="text-sm font-semibold">Respuesta correcta</span>

                              </div>

                            )}

                            {mostrarIncorrecta && (

                              <div className="mt-2 flex items-center gap-2 text-red-700">

                                <XCircle className="w-4 h-4" />

                                <span className="text-sm font-semibold">Tu respuesta</span>

                              </div>

                            )}

                          </div>

                        </label>

                      );

                    })}

                  </div>

                </div>

              );

            })}

          </div>

<div className="flex justify-end mt-8">

            {!resultado ? (

              <Button

                onClick={evaluarRespuestas}

                disabled={!todasRespondidas || enviandoIntento || evaluaciónBloqueada}

                className={`px-8 py-4 text-base ${(!todasRespondidas || enviandoIntento || evaluaciónBloqueada)

                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'

                  : 'bg-green-800 hover:bg-green-900 text-white'

                  }`}

              >

                {todasRespondidas ? 'Evaluar Respuestas' : 'Responde todas las preguntas para continuar'}

              </Button>

            ) : (

              <Button

                onClick={() => setmostrarResultado(true)}

                className="px-8 py-4 text-base bg-neutral-900 hover:bg-neutral-800 text-white"

              >

                Ver Resultados

              </Button>

            )}

          </div>

        </div>

      </div>

{mostrarResultado && resultado && (

        <ResultadoModal

          resultado={resultado}

          onClose={() => {

            // Si aún hay errores, permitir un nuevo intento limpiando el estado de resultado

            if (resultado.incorrectas.length > 0) {

              setmostrarResultado(false);

              setResultado(null);

            } else {

              setmostrarResultado(false);

            }

          }}

          onFinalizar={handleFinalizar}

        />

      )}

<div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/plan-inversion/unidad1')}

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

export default PlanInversionUnidad1CierrePage;


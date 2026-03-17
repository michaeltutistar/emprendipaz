import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const preguntas = [

  {

    id: 1,

    pregunta: 'Tu equipo de trabajo comete un error grave. ¿Qué haces?',

    opciones: [

      { id: 'a', texto: 'Reasigno tareas y doy instrucciones claras.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Convoco una reunión para decidir juntos.', estilo: 'Democrático' },

      { id: 'c', texto: 'Escucho cómo se sienten y los apoyo.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Les pregunto qué aprendieron y cómo mejorarían.', estilo: 'Coaching' },

      { id: 'e', texto: 'Corrijo el rumbo y superviso que se cumpla.', estilo: 'Timonel' }

    ]

  },

  {

    id: 2,

    pregunta: '¿Cómo defines tu papel como líder en tu emprendimiento?',

    opciones: [

      { id: 'a', texto: 'Tomar decisiones rápidas y firmás.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Facilitar el diálogo y la participación.', estilo: 'Democrático' },

      { id: 'c', texto: 'Cuidar el bienestar emocional del equipo.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Acompañar el desarrollo personal y profesional.', estilo: 'Coaching' },

      { id: 'e', texto: 'Guiar el trabajo hacia metas claras.', estilo: 'Timonel' }

    ]

  },

  {

    id: 3,

    pregunta: '¿Qué valoras más en tu equipo de trabajo?',

    opciones: [

      { id: 'a', texto: 'Obediencia y disciplina.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Opiniones diversas.', estilo: 'Democrático' },

      { id: 'c', texto: 'Empatía y cohesión.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Autonomía y aprendizaje.', estilo: 'Coaching' },

      { id: 'e', texto: 'Eficiencia y cumplimiento.', estilo: 'Timonel' }

    ]

  },

  {

    id: 4,

    pregunta: '¿Cómo tomás decisiones en tu equipo de trabajo?',

    opciones: [

      { id: 'a', texto: 'Yo decido y comunico.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Las tomamás entre todos.', estilo: 'Democrático' },

      { id: 'c', texto: 'Primero escucho cómo se sienten.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Les hago preguntas para que reflexionen.', estilo: 'Coaching' },

      { id: 'e', texto: 'Defino el rumbo y ajusto según resultados.', estilo: 'Timonel' }

    ]

  },

  {

    id: 5,

    pregunta: '¿Qué haces ante un conflicto interno en tu emprendimiento?',

    opciones: [

      { id: 'a', texto: 'Intervengo y marco límites.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Promuevo el diálogo grupal.', estilo: 'Democrático' },

      { id: 'c', texto: 'Escucho a cada persona por separado.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Facilito que ellos mismos encuentren soluciones.', estilo: 'Coaching' },

      { id: 'e', texto: 'Tomo decisiones para evitar que afecte el trabajo.', estilo: 'Timonel' }

    ]

  },

  {

    id: 6,

    pregunta: '¿Cómo gestionas el seguimiento de tareas asignadas a tu equipo de trabajo?',

    opciones: [

      { id: 'a', texto: 'Superviso constantemente.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Confío en que el equipo se autorregule.', estilo: 'Democrático' },

      { id: 'c', texto: 'Estoy disponible para acompañar emocionalmente.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Establezco espacios de retroalimentación reflexiva.', estilo: 'Coaching' },

      { id: 'e', texto: 'Reviso avances y corrijo desviaciones.', estilo: 'Timonel' }

    ]

  },

  {

    id: 7,

    pregunta: '¿Cuál es tu reacción cuando alguien del equipo no cumple?',

    opciones: [

      { id: 'a', texto: 'Aplico sanciones o reasigno funciones.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Lo conversamás en grupo.', estilo: 'Democrático' },

      { id: 'c', texto: 'Indago si hay algo personal afectando.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Lo acompaño para que identifique sus bloqueos.', estilo: 'Coaching' },

      { id: 'e', texto: 'Le doy instrucciones claras para corregir.', estilo: 'Timonel' }

    ]

  },

  {

    id: 8,

    pregunta: '¿Qué tipo de clima laboral prefieres en tu emprendimiento?',

    opciones: [

      { id: 'a', texto: 'Ordenado y disciplinado.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Participativo y horizontal.', estilo: 'Democrático' },

      { id: 'c', texto: 'Cercano y afectivo.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Reflexivo y motivador.', estilo: 'Coaching' },

      { id: 'e', texto: 'Enfocado y productivo.', estilo: 'Timonel' }

    ]

  },

  {

    id: 9,

    pregunta: '¿Cómo defines el éxito de tu liderazgo?',

    opciones: [

      { id: 'a', texto: 'Que se cumplan los objetivos sin desviaciones.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Que todos se sientan parte de las decisiones.', estilo: 'Democrático' },

      { id: 'c', texto: 'Que el equipo está emocionalmente estable.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Que cada persona crezca y se supere.', estilo: 'Coaching' },

      { id: 'e', texto: 'Que el trabajo avance con claridad y ritmo.', estilo: 'Timonel' }

    ]

  },

  {

    id: 10,

    pregunta: '¿Qué es lo primero que haces al iniciar un nuevo proyecto?',

    opciones: [

      { id: 'a', texto: 'Establezco reglas y asigno funciones.', estilo: 'Autoritario' },

      { id: 'b', texto: 'Escucho ideas y construimás juntos.', estilo: 'Democrático' },

      { id: 'c', texto: 'Me aseguro de que todos se sientan cómodos.', estilo: 'Afiliativo' },

      { id: 'd', texto: 'Planteo desafíos y acompaño el proceso.', estilo: 'Coaching' },

      { id: 'e', texto: 'Defino metas y organizo el plan.', estilo: 'Timonel' }

    ]

  }

];

const retroalimentacion = {

  'Autoritario': 'Eres un líder directivo, eficaz en situaciones críticas. Tu desafío es mantener la motivación del equipo y fomentar la participación.',

  'Democrático': 'Valoras la participación y el consenso. Tu reto es no perder el foco cuando se requiere dirección clara.',

  'Afiliativo': 'Priorizas el bienestar emocional. Ideal para momentos sensibles, pero necesitas equilibrar afecto con resultados.',

  'Timonel': 'Eres eficiente y orientado a metas. Tu desafío es desarrollar el talento humano y no limitarte a la ejecución.',

  'Coaching': 'Acompañas el crecimiento del equipo. Inspiras mejora continua y autonomía. Ideal para procesos sostenibles.'

};

const LiderazgoUnidad1TallerPage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('liderazgo_u1_taller_respuestas');

    return saved ? JSON.parse(saved) : {};

  });

  const [resultado, setResultado] = useState(null);

  const [mostrarResultado, setmostrarResultado] = useState(false);

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

    localStorage.setItem('liderazgo_u1_taller_respuestas', JSON.stringify(respuestas));

  }, [respuestas]);

useEffect(() => {

    let ticking = false;

    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          setIsScrolled(window.scrollY > 100);

          ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

const handleSeleccionar = (preguntaId, opcionId) => {

    setRespuestas(prev => ({ ...prev, [preguntaId]: opcionId }));

  };

const calcularResultado = () => {

    const puntuaciones = {

      'Autoritario': 0,

      'Democrático': 0,

      'Afiliativo': 0,

      'Coaching': 0,

      'Timonel': 0

    };

preguntas.forEach(pregunta => {

      const respuestaId = respuestas[pregunta.id];

      if (respuestaId) {

        const opcion = pregunta.opciones.find(o => o.id === respuestaId);

        if (opcion) {

          puntuaciones[opcion.estilo]++;

        }

      }

    });

const estiloGanador = Object.keys(puntuaciones).reduce((a, b) =>

      puntuaciones[a] > puntuaciones[b] ? a : b

    );

setResultado({

      estilo: estiloGanador,

      puntuaciones,

      mensaje: retroalimentacion[estiloGanador]

    });

    setmostrarResultado(true);

  };

const todasRespondidas = preguntas.every(p => respuestas[p.id]);

const handleFinalizar = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Liderazgo',

          paso_nombre: 'Unidad 1: Taller',

          curso_nombre: 'Liderazgo'

        })

      });

      navigate('/student/liderazgo/unidad1/cierre');

    } catch (error) {

      navigate('/student/liderazgo/unidad1/cierre');

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

                      Liderazgo

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

            <button onClick={() => navigate('/student/liderazgo')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Liderazgo

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Estilos de Liderazgo

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

              Estilos de Liderazgo

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

              <strong>📌 Instrucciones:</strong> Hemos estudiado 5 tipos de liderazgo, ahora es momento de que identifiques tu estilo de liderazgo predominante. Desarrolla el siguiente test seleccionando una única respuesta en cada pregunta.

            </p>

          </div>

        </div>

<div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-8">

            <h3

              className="text-[#006837] mb-4"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '1.75rem',

                fontWeight: 700,

              }}

            >
              1.2.3. Taller: Identifica tu Estilo de Liderazgo
            </h3>
            <p className="text-gray-700 mb-2 leading-relaxed">
              Hemos estudiado 5 tipos de liderazgo, ahora es momento de que identifiques tu estilo de liderazgo predominante.
              Desarrolla el siguiente test seleccionando una única respuesta en cada pregunta y descúbrelo.
              Intenta no pensar demasiado en tu respuesta, que sea lo más espontáneo posible.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cada pregunta tiene 5 opciones, cada una asociada a un estilo de liderazgo. El sistema suma puntos por estilo y al final muestra el resultado con mayor puntuación y su significado.

            </p>

          </div>

<div className="space-y-8">

            {preguntas.map((pregunta) => (

              <div key={pregunta.id} className="border-b border-gray-200 pb-6 last:border-b-0">

                <h4 className="text-lg font-semibold text-gray-900 mb-4">

                  Pregunta {pregunta.id}: {pregunta.pregunta}

                </h4>

                <div className="space-y-3">

                  {pregunta.opciones.map((opcion) => (

                    <button

                      key={opcion.id}

                      onClick={() => handleSeleccionar(pregunta.id, opcion.id)}

                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${respuestas[pregunta.id] === opcion.id

                        ? 'border-[#AA27B9] bg-purple-50'

                        : 'border-gray-200 hover:border-gray-400 bg-white'

                        }`}

                    >

                      <div className="flex items-start gap-3">

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${respuestas[pregunta.id] === opcion.id

                          ? 'border-[#AA27B9] bg-[#AA27B9]'

                          : 'border-gray-400'

                          }`}>

                          {respuestas[pregunta.id] === opcion.id && (

                            <div className="w-2 h-2 rounded-full bg-white"></div>

                          )}

                        </div>

                        <div className="flex-1">

                          <span className="font-medium text-gray-900">{opcion.id.toUpperCase()}) </span>

                          <span className="text-gray-700">{opcion.texto}</span>

                          <span className="text-gray-500 text-sm ml-2">→ {opcion.estilo}</span>

                        </div>

                      </div>

                    </button>

                  ))}

                </div>

              </div>

            ))}

          </div>

<div className="mt-8 flex flex-col gap-4">

            <Button

              onClick={calcularResultado}

              disabled={!todasRespondidas}

              className={`w-full py-4 ${todasRespondidas

                ? 'bg-[#AA27B9] hover:bg-[#9d24ab] text-white'

                : 'bg-gray-300 text-gray-500 cursor-not-allowed'

                }`}

            >

              Ver mi resultado

            </Button>

{mostrarResultado && resultado && (

              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-6">

                <h3 className="text-xl font-bold text-gray-900 mb-4">Tu Estilo de Liderazgo Predominante</h3>

                <div className="bg-white rounded-lg p-4 mb-4">

                  <h4 className="text-2xl font-bold text-green-800 mb-2">{resultado.estilo}</h4>

                  <p className="text-gray-700">{resultado.mensaje}</p>

                </div>

                <div className="bg-white rounded-lg p-4">

                  <h5 className="font-semibold text-gray-900 mb-2">Puntuación por estilo:</h5>

                  <div className="space-y-2">

                    {Object.entries(resultado.puntuaciones).map(([estilo, puntos]) => (

                      <div key={estilo} className="flex items-center justify-between">

                        <span className="text-gray-700">{estilo}:</span>

                        <span className={`font-bold ${estilo === resultado.estilo ? 'text-green-600' : 'text-gray-500'}`}>

                          {puntos} puntos

                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            )}

{mostrarResultado && (

              <Button

                onClick={handleFinalizar}

                className="w-full bg-green-800 hover:bg-green-900 text-white py-4"

              >

                Continuar a Evaluación

                <ChevronRight className="w-5 h-5 ml-2" />

              </Button>

            )}

          </div>

        </div>

      </div>

<Footer />

    </div>

  );

};

export default LiderazgoUnidad1TallerPage;


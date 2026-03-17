import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, RotateCcw, ClipboardList, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';
import useProgressTracking from '@/utils/useProgressTracking';

// Función para aleatorizar array

const shuffleArray = (array) => {

  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

  }

  return shuffled;

};

const etapasPlan = [

  { id: 'metas-claras', numero: 1, nombre: 'Metas claras' },

  { id: 'acciones-especificas', numero: 2, nombre: 'Acciones específicas' },

  { id: 'recursos', numero: 3, nombre: 'Recursos' },

  { id: 'tiempos', numero: 4, nombre: 'Tiempos' },

  { id: 'evaluación', numero: 5, nombre: 'Evaluación' }

];

const elementosIniciales = [

  {

    id: 'e1',

    texto: 'Lanzar una tienda virtual de artesanías con identidad cultural en 18 meses',

    respuestaCorrecta: 'metas-claras'

  },

  {

    id: 'e2',

    texto: 'Diseñar un catálogo digital, capacitarse en comercio electrónico y realizar campañas en Instagram',

    respuestaCorrecta: 'acciones-especificas'

  },

  {

    id: 'e3',

    texto: '$8.000.000 iniciales, 2 diseñadores gráficos, 1 community manager y proveedores locales de artesanías',

    respuestaCorrecta: 'recursos'

  },

  {

    id: 'e4',

    texto: 'Cronograma de diseño del catálogo (6 meses) y apertura de la tienda online (más 18)',

    respuestaCorrecta: 'tiempos'

  },

  {

    id: 'e5',

    texto: 'Revisar métricas de interacción y ventas cada trimestre para ajustar la estrategia',

    respuestaCorrecta: 'evaluación'

  }

];

const preguntas = [

  {

    id: 1,

    texto: '¿Cuál sería el valor que se debería cultivar desde el emprendimiento para generar confianza con los clientes?',

    opciones: [

      { id: 'a', texto: 'Creatividad' },

      { id: 'b', texto: 'Perseverancia' },

      { id: 'c', texto: 'Honestidad' }

    ],

    respuestaCorrecta: 'c',

    retroalimentacion: 'Recuerda que la honestidad es un valor que hace referencia a la franqueza en la gestión del negocio, fortaleciendo la credibilidad y la reputación del emprendimiento.'

  },

  {

    id: 2,

    texto: 'De acuerdo con la actividad que los jóvenes han seleccionado para emprender, ¿cuál sería el interés personal que más se acopla a su actividad comercial?',

    opciones: [

      { id: 'a', texto: 'Gastronomía' },

      { id: 'b', texto: 'Arte y creatividad' },

      { id: 'c', texto: 'Tecnología' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: 'Cuando hablamos de productos artesanales, el interés personal que más se ajusta a esa actividad comercial es el arte y la creatividad.'

  }

];

const PlanNegocioProyectoVidaPage = () => {

  const navigate = useNavigate();
  const completionSyncStartedRef = useRef(false);
  const { pasoCompletado, registrarProgreso } = useProgressTracking('Proyecto de vida', 'Plan de Negocio');

  const [elementosAleatorios, setElementosAleatorios] = useState(() => {

    const saved = localStorage.getItem('pn_pv_elementos');

    if (saved) {

      return JSON.parse(saved);

    }

    return shuffleArray(elementosIniciales);

  });

  const [respuestasDragDrop, setRespuestasDragDrop] = useState(() => {

    const saved = localStorage.getItem('pn_pv_respuestas_dd');

    return saved ? JSON.parse(saved) : {};

  });

  const [elementosDisponibles, setElementosDisponibles] = useState(() => {

    const saved = localStorage.getItem('pn_pv_disponibles');

    if (saved) {

      return JSON.parse(saved);

    }

    return elementosAleatorios.map(e => e.id);

  });

  const [validadoDragDrop, setValidadoDragDrop] = useState(() => {

    const saved = localStorage.getItem('pn_pv_validado_dd');

    return saved === 'true';

  });

  const [respuestasPreguntas, setRespuestasPreguntas] = useState(() => {

    const saved = localStorage.getItem('pn_pv_respuestas_preguntas');

    return saved ? JSON.parse(saved) : {};

  });

  const [mostrarRetroalimentacion, setmostrarRetroalimentacion] = useState(() => {

    const saved = localStorage.getItem('pn_pv_retroalimentacion');

    return saved ? JSON.parse(saved) : {};

  });

  const [draggedElemento, setDraggedElemento] = useState(null);

  const [dragOver, setDragOver] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const [mostrarReflexionFinal, setmostrarReflexionFinal] = useState(false);

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

    localStorage.setItem('pn_pv_elementos', JSON.stringify(elementosAleatorios));

  }, [elementosAleatorios]);

useEffect(() => {

    localStorage.setItem('pn_pv_respuestas_dd', JSON.stringify(respuestasDragDrop));

  }, [respuestasDragDrop]);

useEffect(() => {

    localStorage.setItem('pn_pv_disponibles', JSON.stringify(elementosDisponibles));

  }, [elementosDisponibles]);

useEffect(() => {

    localStorage.setItem('pn_pv_validado_dd', validadoDragDrop.toString());

  }, [validadoDragDrop]);

useEffect(() => {

    localStorage.setItem('pn_pv_respuestas_preguntas', JSON.stringify(respuestasPreguntas));

  }, [respuestasPreguntas]);

useEffect(() => {

    localStorage.setItem('pn_pv_retroalimentacion', JSON.stringify(mostrarRetroalimentacion));

  }, [mostrarRetroalimentacion]);

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

const handleDragStart = (e, elementoId) => {

    setDraggedElemento(elementoId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, etapaId) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(etapaId);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, etapaId) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedElemento) return;

if (validadoDragDrop) {

      setValidadoDragDrop(false);

      setmostrarReflexionFinal(false);

    }

if (respuestasDragDrop[etapaId]) {

      setElementosDisponibles(prev => [...prev, respuestasDragDrop[etapaId]]);

    }

setRespuestasDragDrop(prev => ({

      ...prev,

      [etapaId]: draggedElemento

    }));

setElementosDisponibles(prev => prev.filter(id => id !== draggedElemento));

setDraggedElemento(null);

  };

const handleRemoveAnswer = (etapaId) => {

    const elementoId = respuestasDragDrop[etapaId];

    if (elementoId) {

      setElementosDisponibles(prev => [...prev, elementoId]);

      setRespuestasDragDrop(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[etapaId];

        return newRespuestas;

      });

      setValidadoDragDrop(false);

      setmostrarReflexionFinal(false);

    }

  };

const handleValidateDragDrop = () => {

    setValidadoDragDrop(true);

    setmostrarReflexionFinal(true);

  };

const handleResetDragDrop = () => {

    setRespuestasDragDrop({});

    setElementosDisponibles(elementosAleatorios.map(e => e.id));

    setValidadoDragDrop(false);

    setmostrarReflexionFinal(false);

    localStorage.removeItem('pn_pv_respuestas_dd');

    localStorage.removeItem('pn_pv_disponibles');

    localStorage.removeItem('pn_pv_validado_dd');

  };

const handlePreguntaChange = (preguntaId, opcionId) => {

    setRespuestasPreguntas(prev => ({

      ...prev,

      [preguntaId]: opcionId

    }));

    setmostrarRetroalimentacion(prev => ({

      ...prev,

      [preguntaId]: true

    }));

  };

const esRespuestaCorrecta = (etapaId) => {

    if (!validadoDragDrop) return false;

    const elementoId = respuestasDragDrop[etapaId];

    const elemento = elementoId ? elementosAleatorios.find(e => e.id === elementoId) : null;

    return elemento && elemento.respuestaCorrecta === etapaId;

  };

const esRespuestaIncorrecta = (etapaId) => {

    if (!validadoDragDrop) return false;

    const elementoId = respuestasDragDrop[etapaId];

    if (!elementoId) return false;

    const elemento = elementosAleatorios.find(e => e.id === elementoId);

    return elemento && elemento.respuestaCorrecta !== etapaId;

  };

const todasRespondidasDragDrop = Object.keys(respuestasDragDrop).length === etapasPlan.length;

  const respuestasCorrectasCount = etapasPlan.filter(e => esRespuestaCorrecta(e.id)).length;

  const respuestasPreguntasCorrectasCount = preguntas.filter(
    (pregunta) => respuestasPreguntas[pregunta.id] === pregunta.respuestaCorrecta
  ).length;

  const planNegocioCompleto =
    validadoDragDrop &&
    respuestasCorrectasCount === etapasPlan.length &&
    respuestasPreguntasCorrectasCount === preguntas.length;

useEffect(() => {
    if (!planNegocioCompleto) {
      completionSyncStartedRef.current = false;
      return;
    }

    if (pasoCompletado || completionSyncStartedRef.current) return;

    completionSyncStartedRef.current = true;

    const completarPlanNegocio = async () => {
      const registrado = await registrarProgreso();

      if (registrado) {
        localStorage.setItem('proyecto_vida_plan_negocio_completado', 'true');
        return;
      }

      completionSyncStartedRef.current = false;
    };

    completarPlanNegocio();
  }, [planNegocioCompleto, pasoCompletado, registrarProgreso]);

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* HEADER */}

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

                      Plan de Negocio

                    </p>

                  </div>

                </motion.div>

              )}

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

{/* BREADCRUMB */}

      <motion.div

        className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

        initial={{ opacity: 0, y: -10 }}

        animate={{ opacity: 1, y: 0 }}

      >

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">

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

              Modulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/proyecto-vida')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Proyecto de vida

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#006837] font-bold text-base">

              Plan de Negocio

            </span>

          </div>

        </div>

      </motion.div>

{/* HERO SECTION */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#006837] via-[#00844a] to-[#59D22E] pt-8 pb-16 px-8">

        <div className="absolute inset-0 overflow-hidden">

          <motion.div

            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"

            style={{ background: 'radial-gradient(circle, #FFEB3B 0%, transparent 70%)' }}

            animate={{ scale: [1, 1.2, 1] }}

            transition={{ duration: 15, repeat: Infinity }}

          />

        </div>

<div className="max-w-7xl mx-auto relative z-10">

          {!isScrolled && (

            <motion.div

              initial={{ opacity: 0, y: -10 }}

              animate={{ opacity: 1, y: 0 }}

              className="flex items-center gap-2 text-white/80 mb-6 text-sm"

            >

              <button

                onClick={() => navigate('/student/dashboard')}

                className="hover:text-white transition-colors flex items-center gap-1"

              >

                <Home className="w-4 h-4" />

                Inicio

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/modulos')}

                className="hover:text-white transition-colors"

              >

                Modulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/proyecto-vida')}

                className="hover:text-white transition-colors"

              >

                Proyecto de vida

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Plan de Negocio</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Proyecto de vida

            </p>

            <h1

              className="text-white mb-3"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Actividad complementaria para el apartado de 'Plan de negocio'

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">
              En esta sección te enfrentarás a una actividad interactiva que conecta todo lo aprendido sobre el proyecto de vida con una situación real de negocio.
            </p>

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

{/* CONTENT */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 space-y-12"

        >

          {/* PARTE 1: LECTURA DEL CASO */}

          <section>

            <div className="flex items-center gap-3 mb-6">

              <ClipboardList className="w-6 h-6 text-[#006837]" />

              <h2

                className="text-[#006837]"

                style={{

                  fontFamily: 'var(--font-heading)',

                  fontSize: '1.5rem',

                  fontWeight: 600,

                }}

              >

                Parte 1. Lectura del caso

              </h2>

            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg space-y-4">

              <p className="text-gray-800 font-semibold text-lg">Cima y Raíces</p>

              <p className="text-gray-700 leading-relaxed">
                <strong>Cima y Raíces</strong> es un emprendimiento creado por tres jóvenes pastusos que buscan rescatar las tradiciones culturales y artesanales de la región, adaptándolas al mundo digital. Su idea es vender productos artesanales personalizados a través de canales digitales.
              </p>

              <p className="text-gray-700 leading-relaxed">

                A pesar de la pasión que tienen por el proyecto, estos jóvenes emprendedores enfrentan algunas dificultades:

              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">

                <li>Los clientes no confían en el emprendimiento.</li>

                <li>Sus fortalezas individuales no están bien organizadas.</li>

                <li>No cuentan con un plan de acción claramente definido.</li>

              </ul>

            </div>

          </section>

{/* PARTE 2: IDENTIFICACIÓN DE SOLUCIONES */}

          <section>

            <div className="flex items-center gap-3 mb-6">

              <ClipboardList className="w-6 h-6 text-[#006837]" />

              <h2

                className="text-[#006837]"

                style={{

                  fontFamily: 'var(--font-heading)',

                  fontSize: '1.5rem',

                  fontWeight: 600,

                }}

              >

                Parte 2. Identificación de soluciones

              </h2>

            </div>

            <p className="text-gray-700 mb-6">

              Identifica soluciones a las dificultades respondiendo las siguientes preguntas, seleccionando una sola respuesta para cada una.

            </p>

<div className="space-y-8">

              {preguntas.map((pregunta) => {

                const respuestaSeleccionada = respuestasPreguntas[pregunta.id];

                const esCorrecta = respuestaSeleccionada === pregunta.respuestaCorrecta;

                const mostrarRetro = mostrarRetroalimentacion[pregunta.id];

return (

                  <div key={pregunta.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">

                    <p className="text-gray-800 font-semibold mb-4">

                      {pregunta.id}. {pregunta.texto}

                    </p>

                    <div className="space-y-3">

                      {pregunta.opciones.map((opcion) => {
                        const estaSeleccionada = respuestaSeleccionada === opcion.id;
                        const esOpcionCorrecta = opcion.id === pregunta.respuestaCorrecta;
                        const mostrarFeedback = mostrarRetro && estaSeleccionada;

return (

                          <div key={opcion.id}>

                            <label

                              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${mostrarFeedback

                                ? esCorrecta

                                  ? 'bg-green-50 border-green-500'

                                  : 'bg-red-50 border-red-500'

                                : estaSeleccionada

                                  ? 'bg-blue-50 border-blue-500'

                                  : 'bg-white border-gray-300 hover:border-gray-400'

                                }`}

                            >

                              <input

                                type="radio"

                                name={`pregunta-${pregunta.id}`}

                                value={opcion.id}

                                checked={estaSeleccionada}

                                onChange={() => handlePreguntaChange(pregunta.id, opcion.id)}

                                className="w-4 h-4 text-[#006837] focus:ring-[#006837]"

                              />

                              <span className="text-gray-800">{opcion.id}) {opcion.texto}</span>

                              {mostrarFeedback && esCorrecta && (

                                <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />

                              )}

                              {mostrarFeedback && !esCorrecta && (

                                <XCircle className="w-5 h-5 text-red-600 ml-auto" />

                              )}

                            </label>

                            {mostrarFeedback && esOpcionCorrecta && !estaSeleccionada && (

                              <p className="mt-2 text-sm text-green-700 font-medium">

                                ✓ Respuesta correcta

                              </p>

                            )}

                          </div>

                        );

                      })}

                    </div>

                    {mostrarRetro && (

                      <div className={`mt-4 p-4 rounded-lg ${esCorrecta ? 'bg-green-50 border-l-4 border-green-600' : 'bg-yellow-50 border-l-4 border-yellow-600'

                        }`}>

                        <p className="text-sm text-gray-800 leading-relaxed">

                          {pregunta.retroalimentacion}

                        </p>

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </section>

{/* PARTE 3: PLAN DE ACCIÓN */}

          <section>

            <div className="flex items-center gap-3 mb-6">

              <ClipboardList className="w-6 h-6 text-[#006837]" />

              <h2

                className="text-[#006837]"

                style={{

                  fontFamily: 'var(--font-heading)',

                  fontSize: '1.5rem',

                  fontWeight: 600,

                }}

              >

                Parte 3. Plan de acción del proyecto de vida

              </h2>

            </div>

            <p className="text-gray-700 mb-4">

              Ayuda a los jóvenes emprendedores a diseñar el plan de acción de su proyecto de vida para mantener la coherencia y la organización en su emprendimiento.

            </p>

            <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-r-lg mb-6">

              <p className="text-gray-800 font-semibold mb-2">Instrucción del taller:</p>

              <p className="text-gray-700 text-sm md:text-base">

                Deberás arrastrar los elementos de la derecha hacia la etapa del plan de acción a la que corresponda, ubicada en la parte izquierda.

              </p>

            </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              {/* Columna izquierda: Etapas del plan de acción */}

              <div className="space-y-4">

                <h4 className="font-semibold text-gray-900 mb-3">Etapa del plan de acción</h4>

                {etapasPlan.map((etapa) => {

                  const elementoId = respuestasDragDrop[etapa.id];

                  const elemento = elementoId ? elementosAleatorios.find(e => e.id === elementoId) : null;

                  const esCorrecta = esRespuestaCorrecta(etapa.id);

                  const esIncorrecta = esRespuestaIncorrecta(etapa.id);

return (

                    <div

                      key={etapa.id}

                      onDragOver={(e) => handleDragOver(e, etapa.id)}

                      onDragLeave={handleDragLeave}

                      onDrop={(e) => handleDrop(e, etapa.id)}

                      onContextMenu={handleContextMenu}

                      className={`min-h-[100px] p-4 rounded-lg border-2 transition-all select-none ${dragOver === etapa.id

                        ? 'border-gray-900 bg-gray-100 border-dashed'

                        : elementoId

                          ? esCorrecta

                            ? 'border-green-500 bg-green-50'

                            : esIncorrecta

                              ? 'border-red-500 bg-red-50'

                              : 'border-gray-300 bg-gray-50'

                          : 'border-gray-200 bg-white border-dashed'

                        }`}

                    >

                      <p className="text-sm font-semibold text-gray-900 mb-3">{etapa.numero}. {etapa.nombre}</p>

                      {elementoId ? (

                        <div className="flex items-center justify-between">

                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${esCorrecta

                            ? 'bg-green-100 text-green-800'

                            : esIncorrecta

                              ? 'bg-red-100 text-red-800'

                              : 'bg-gray-200 text-gray-700'

                            }`}>

                            {validadoDragDrop && (

                              <>

                                {esCorrecta ? (

                                  <CheckCircle className="w-4 h-4" />

                                ) : (

                                  <XCircle className="w-4 h-4" />

                                )}

                              </>

                            )}

                            <span className="text-sm">{elemento.texto}</span>

                          </div>

                          {!validadoDragDrop && (

                            <button

                              onClick={() => handleRemoveAnswer(etapa.id)}

                              className="text-xs text-gray-500 hover:text-gray-700 underline"

                            >

                              Quitar

                            </button>

                          )}

                          {validadoDragDrop && esIncorrecta && (

                            <button

                              onClick={() => handleRemoveAnswer(etapa.id)}

                              className="text-xs text-red-600 hover:text-red-800 underline"

                            >

                              Quitar

                            </button>

                          )}

                        </div>

                      ) : (

                        <p className="text-xs text-gray-400 italic">Arrastra un elemento aquí</p>

                      )}

                    </div>

                  );

                })}

              </div>

{/* Columna derecha: Elementos disponibles */}

              <div className="space-y-4">

                <h4 className="font-semibold text-gray-900 mb-3">Elemento</h4>

                <div className="space-y-3">

                  {elementosAleatorios.map((elemento) => {

                    const estaDisponible = elementosDisponibles.includes(elemento.id);

                    const estaAsignada = Object.values(respuestasDragDrop).includes(elemento.id);

if (!estaDisponible && estaAsignada) {

                      return null;

                    }

return (

                      <div

                        key={elemento.id}

                        draggable={estaDisponible}

                        onDragStart={estaDisponible ? (e) => handleDragStart(e, elemento.id) : undefined}

                        onContextMenu={handleContextMenu}

                        className={`px-4 py-3 rounded-lg border-2 transition-all cursor-move select-none ${estaDisponible

                          ? 'bg-white border-gray-300 hover:border-gray-900 hover:shadow-md active:opacity-70'

                          : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'

                          }`}

                      >

                        <span className="text-sm text-gray-900">{elemento.texto}</span>

                      </div>

                    );

                  })}

                </div>

              </div>

            </div>

{/* Botones de acción */}

            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">

              <Button

                onClick={handleValidateDragDrop}

                disabled={!todasRespondidasDragDrop || validadoDragDrop}

                className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"

              >

                Verificar respuestas

              </Button>

              <Button

                onClick={handleResetDragDrop}

                variant="outline"

                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 flex items-center gap-2"

              >

                <RotateCcw className="w-4 h-4" />

                Reiniciar

              </Button>

            </div>

{/* Resultado */}

            {validadoDragDrop && (

              <div className={`mt-4 p-4 rounded-lg border-2 ${respuestasCorrectasCount === etapasPlan.length

                ? 'bg-green-50 border-green-500'

                : 'bg-amber-50 border-amber-500'

                }`}>

                <p className="font-semibold text-gray-900 mb-2">

                  {respuestasCorrectasCount === etapasPlan.length

                    ? '¡Excelente! Has completado correctamente el taller.'

                    : `Has respondido correctamente ${respuestasCorrectasCount} de ${etapasPlan.length} preguntas.`}

                </p>

                {respuestasCorrectasCount < etapasPlan.length && (

                  <p className="text-sm text-gray-700">

                    Revisa las respuestas incorrectas y vuelve a intentar.

                  </p>

                )}

              </div>

            )}

{/* Reflexión final */}

            {mostrarReflexionFinal && (

              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-600 p-5 rounded-r-lg">

                <p className="text-gray-800 font-semibold mb-2">Reflexión final:</p>

                <p className="text-gray-700 text-sm md:text-base leading-relaxed">

                  Cuando tus valores guían tus decisiones, tus intereses encienden la pasión, tus fortalezas sostienen el camino y tu plan de acción organiza cada paso, tu proyecto de vida se convierte en una ruta clara hacia un éxito auténtico y sostenible.

                </p>

              </div>

            )}

          </section>

        </motion.div>

      </div>

{/* BACK BUTTON */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/proyecto-vida')}

          className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </div>

<Footer />

    </div>

  );

};

export default PlanNegocioProyectoVidaPage;


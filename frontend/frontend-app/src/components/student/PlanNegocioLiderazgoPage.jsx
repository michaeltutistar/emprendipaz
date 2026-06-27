import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, RotateCcw, ClipboardList, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Función para aleatorizar array

const shuffleArray = (array) => {

  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

  }

  return shuffled;

};

// Orden correcto de los pasos

const ordenCorrecto = [

  'detectar-problema',

  'pensar-opciones',

  'comparar-elegir',

  'actuar-revisar'

];

// Tarjetas con imágenes (orden aleatorio inicial)

const tarjetasIniciales = [

  {

    id: 't1',

    pasoId: 'detectar-problema',

    nombre: 'Detectar el problema',

    imagen: '/Modulo10/tarjetas modulo 10/detectar el problema.jpeg',

    texto: 'El líder observa que las ventas han bajado y que el contenido en redes sociales no está generando interacción. El equipo está desmotivado.'

  },

  {

    id: 't2',

    pasoId: 'pensar-opciones',

    nombre: 'Pensar opciones',

    imagen: '/Modulo10/tarjetas modulo 10/pensar opciones.jpeg',

    texto: '• Rediseñar la imagen de marca\n• Contratar un influencer local o mejorar la narrativa de los productos.\n• Capacitar al equipo en marketing digital.'

  },

  {

    id: 't3',

    pasoId: 'comparar-elegir',

    nombre: 'Comparar y elegir',

    imagen: '/Modulo10/tarjetas modulo 10/comparar y elegir.jpeg',

    texto: 'Se elige capacitar al equipo y mejorar la narrativa de los productos, por ser opciones de bajo costo, sostenibles y alineadas con los valores del emprendimiento.'

  },

  {

    id: 't4',

    pasoId: 'actuar-revisar',

    nombre: 'Actuar y revisar',

    imagen: '/Modulo10/tarjetas modulo 10/actuar y revisar.jpeg',

    texto: 'Tras aplicar las mejoras, se incrementa la interacción en redes y el equipo se muestra más comprometido. El líder concluye que empoderar al equipo fue clave para recuperar la conexión con el cliente.'

  }

];

const preguntas = [

  {

    id: 1,

    texto: 'El mejor estilo de liderazgo para abordar la problemática será el liderazgo autoritario.',

    opciones: [

      { id: 'a', texto: 'Verdadero' },

      { id: 'b', texto: 'Falso' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: 'Recuerda que el liderazgo visionario inspira, moviliza y conecta al equipo con una visión clara; es ideal para una situación que requiere reactivar la marca.'

  },

  {

    id: 2,

    texto: '¿Qué decisión estratégica debería tomar el líder para mejorar el marketing digital?',

    opciones: [

      { id: 'a', texto: 'Cambiar el logo sin consultar al equipo' },

      { id: 'b', texto: 'Crear una visión compartida y alinear las acciones de marketing' },

      { id: 'c', texto: 'Delegar todo el contenido a un consultor externo' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: 'Recuerda que una visión compartida permite que el equipo se alinee, se motive y comunique con coherencia en los canales digitales.'

  },

  {

    id: 3,

    texto: 'La falta de visión en la estrategia de marketing digital genera acciones dispersas e incoherentes.',

    opciones: [

      { id: 'a', texto: 'Falso' },

      { id: 'b', texto: 'Verdadero' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: 'Recuerda que, sin una visión clara, las acciones de marketing no lograrán posicionar la marca de forma efectiva.'

  },

  {

    id: 4,

    texto: '¿Qué acción del líder puede fortalecer la motivación del equipo en medio de la crisis de marketing digital?',

    opciones: [

      { id: 'a', texto: 'Reconocer los logros individuales y fomentar la participación en las decisiones.' },

      { id: 'b', texto: 'Aumentar la carga de trabajo para acelerar resultados.' }

    ],

    respuestaCorrecta: 'a',

    retroalimentacion: 'Recuerda que reconocer los logros individuales y fomentar la participación en las decisiones fortalece la motivación del equipo, genera compromiso y permite que cada integrante se sienta parte activa de la estrategia de marketing digital.'

  }

];

const PlanNegocioLiderazgoPage = () => {

  const navigate = useNavigate();

  const [ordenTarjetas, setOrdenTarjetas] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_orden_tarjetas');

    if (saved) {

      return JSON.parse(saved);

    }

    return shuffleArray(tarjetasIniciales.map(t => t.id));

  });

  const [validadoDragDrop, setValidadoDragDrop] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_validado_dd');

    return saved === 'true';

  });

  const [respuestasPreguntas, setRespuestasPreguntas] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_respuestas_preguntas');

    return saved ? JSON.parse(saved) : {};

  });

  const [mostrarRetroalimentacion, setmostrarRetroalimentacion] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_retroalimentacion');

    return saved ? JSON.parse(saved) : {};

  });

  const [draggedTarjeta, setDraggedTarjeta] = useState(null); // índice de la tarjeta siendo arrastrada

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

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 100);

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_orden_tarjetas', JSON.stringify(ordenTarjetas));

  }, [ordenTarjetas]);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_validado_dd', validadoDragDrop.toString());

  }, [validadoDragDrop]);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_respuestas_preguntas', JSON.stringify(respuestasPreguntas));

  }, [respuestasPreguntas]);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_retroalimentacion', JSON.stringify(mostrarRetroalimentacion));

  }, [mostrarRetroalimentacion]);

const handleDragStart = (e, index) => {

    setDraggedTarjeta(index);

    e.dataTransfer.effectAllowed = 'move';

  };

const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, index) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(index);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, dropIndex) => {

    e.preventDefault();

    setDragOver(null);

if (draggedTarjeta === null || draggedTarjeta === dropIndex) {

      setDraggedTarjeta(null);

      return;

    }

if (validadoDragDrop) {

      setValidadoDragDrop(false);

      setmostrarReflexionFinal(false);

    }

const newOrden = [...ordenTarjetas];

    const [removed] = newOrden.splice(draggedTarjeta, 1);

    newOrden.splice(dropIndex, 0, removed);

    setOrdenTarjetas(newOrden);

    setDraggedTarjeta(null);

  };

const handleValidateDragDrop = async () => {

    setValidadoDragDrop(true);

    setmostrarReflexionFinal(true);

// Verificar si el orden es correcto

    const isCorrect = ordenTarjetas.every((tarjetaId, index) => {

      const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

      return tarjeta && tarjeta.pasoId === ordenCorrecto[index];

    });

if (isCorrect) {

      try {

        const token = getAuthToken();

// Registrar progreso para completar el módulo (100%)

        const apiUrl = import.meta.env.MODE === 'production'

          ? `${API_BASE_URL}/registrar-progreso-modulo`

          : `${API_BASE_URL}/registrar-progreso-modulo`;

await fetch(apiUrl, {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

            ...(token ? { 'Authorization': `Bearer ${token}` } : {})

          },

          body: JSON.stringify({

            modulo_nombre: 'Liderazgo',

            paso_nombre: 'Plan de Negocio',

            curso_nombre: 'Liderazgo'

          })

        });

console.log('Progreso de Liderazgo registrado (Plan de Negocio completado)');

        window.dispatchEvent(new Event('progreso-actualizado'));

} catch (error) {

        console.error("Error al registrar progreso de Liderazgo:", error);

      }

    }

  };

const handleResetDragDrop = () => {

    setOrdenTarjetas(shuffleArray(tarjetasIniciales.map(t => t.id)));

    setValidadoDragDrop(false);

    setmostrarReflexionFinal(false);

    localStorage.removeItem('pn_liderazgo_orden_tarjetas');

    localStorage.removeItem('pn_liderazgo_validado_dd');

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

const esOrdenCorrecto = () => {

    if (!validadoDragDrop) return false;

    return ordenTarjetas.every((tarjetaId, index) => {

      const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

      return tarjeta && tarjeta.pasoId === ordenCorrecto[index];

    });

  };

const esTarjetaCorrecta = (index) => {

    if (!validadoDragDrop) return false;

    const tarjetaId = ordenTarjetas[index];

    const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

    return tarjeta && tarjeta.pasoId === ordenCorrecto[index];

  };

const esTarjetaIncorrecta = (index) => {

    if (!validadoDragDrop) return false;

    const tarjetaId = ordenTarjetas[index];

    const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

    return tarjeta && tarjeta.pasoId !== ordenCorrecto[index];

  };

const handleFinalizarPlan = async () => {
    try {
      const token = getAuthToken();

      // Calcular puntos: si completa correctamente el ejercicio = 1 punto
      const ejercicioCompletado = esOrdenCorrecto();
      const puntosTotales = ejercicioCompletado ? 1 : 0;

      const respuestasConPuntos = [];

      // Construir descripción de las respuestas
      let descripcionFinal = `Ejercicio de liderazgo completado. Orden correcto: ${ejercicioCompletado ? 'Sí' : 'No'}`;
      if (descripcionFinal.length > 180) {
        descripcionFinal = descripcionFinal.substring(0, 177) + '...';
      }

      // Registrar puntos del plan de negocio
      if (puntosTotales > 0) {
        respuestasConPuntos.push({
          pregunta: 'ejercicio_liderazgo',
          respuesta: descripcionFinal,
          puntos: puntosTotales
        });

        await fetch(`${API_BASE_URL}/registrar-puntos-plan-negocio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            modulo_nombre: 'Liderazgo',
            estrategias: respuestasConPuntos.map(r => ({
              etapa: r.pregunta,
              estrategia: r.respuesta,
              puntos: r.puntos
            }))
          })
        });
      }

      // Guardar respuestas completas en el backend para persistencia
      await fetch(`${API_BASE_URL}/save-respuestas-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          modulo_nombre: 'Liderazgo',
          respuestas: {
            respuestasPreguntas,
            ordenTarjetas,
            ejercicioCompletado
          }
        })
      });

      // Registrar progreso del modulo
      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          modulo_nombre: 'Liderazgo',
          paso_nombre: 'Plan de Negocio',
          curso_nombre: 'Liderazgo'
        })
      });

      localStorage.setItem('liderazgo_plan_negocio_completado', 'true');
      window.dispatchEvent(new Event('progreso-actualizado'));
      alert('¡Plan de Negocio completado! El siguiente módulo ha sido desbloqueado.');
      navigate('/student/modulos');
    } catch (error) {
      console.error('Error al registrar progreso:', error);
      localStorage.setItem('liderazgo_plan_negocio_completado', 'true');
      window.dispatchEvent(new Event('progreso-actualizado'));
      navigate('/student/modulos');
    }
  };

const respuestasCorrectasCount = validadoDragDrop

    ? ordenTarjetas.filter((tarjetaId, index) => {

      const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

      return tarjeta && tarjeta.pasoId === ordenCorrecto[index];

    }).length

    : 0;

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

                      Liderazgo

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

                                        <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/student/perfil');
                      }}
                      className="max-w-[180px] truncate text-sm font-semibold text-white"
                    >
                      {userName || 'Usuario'}
                    </span>

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

              Módulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/liderazgo')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Liderazgo

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

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Liderazgo

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

              ¡Vamos a poner en acción tu liderazgo!

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Esta actividad interactiva conecta tu conocimiento sobre liderazgo con una situación real de marketing digital. Descubre cómo un liderazgo óptimo puede transformar los desafíos del emprendimiento en oportunidades de crecimiento.

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

              <p className="text-gray-800 leading-relaxed">

                Un emprendimiento ha perdido visibilidad en redes sociales. El equipo está desmotivado, no hay una visión clara y las decisiones de marketing se toman sin planificación. El líder no comunica el propósito de la marca ni involucra al equipo en las decisiones.

              </p>

              <p className="text-gray-700 font-semibold mt-4">

                Responde los interrogantes:

              </p>

            </div>

          </section>

{/* PARTE 1: PREGUNTAS */}

          <section>

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

{/* PARTE 2: ORDENAR LA RUTA */}

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

                Parte 2. Ordena la ruta para decidir

              </h2>

            </div>

            <p className="text-gray-700 mb-6">

              Para resolver el problema expuesto, el líder aplicará la ruta para decidir que estudiamos previamente en la unidad 3. A continuación, encontrarás cuatro tarjetas que corresponden a los pasos de dicha ruta; deberás arrastrarlas para generar el orden correcto.

            </p>

<div className="bg-white border-2 border-neutral-300 rounded-lg overflow-hidden shadow-lg">

              <div className="bg-gradient-to-r from-[#006837] to-[#59D22E] text-white p-4">

                <h3 className="text-lg font-bold text-center">Ejercicio de Ordenamiento</h3>

              </div>

<div className="p-6">

                <p className="text-gray-700 mb-6 text-center">

                  Arrastra las tarjetas para ordenarlas en la secuencia correcta de la ruta para decidir.

                </p>

{/* Lista de tarjetas ordenables en fila horizontal */}

                <div className="flex flex-row gap-3 overflow-x-auto pb-4">

                  {ordenTarjetas.map((tarjetaId, index) => {

                    const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

                    if (!tarjeta) return null;

const esCorrecta = esTarjetaCorrecta(index);

                    const esIncorrecta = esTarjetaIncorrecta(index);

                    const estaSiendoArrastrada = draggedTarjeta === index;

                    const esDropZone = dragOver === index;

return (

                      <div

                        key={tarjetaId}

                        draggable

                        onDragStart={(e) => handleDragStart(e, index)}

                        onDragOver={(e) => handleDragOver(e, index)}

                        onDragLeave={handleDragLeave}

                        onDrop={(e) => handleDrop(e, index)}

                        onContextMenu={handleContextMenu}

                        className={`

                          relative border-2 rounded-lg p-3 cursor-move transition-all flex-shrink-0

                          w-[280px] min-w-[280px] flex flex-col

                          ${estaSiendoArrastrada ? 'opacity-50' : ''}

                          ${esDropZone ? 'border-[#006837] bg-[#006837]/10 scale-105' : 'border-gray-300'}

                          ${esCorrecta ? 'border-green-500 bg-green-50' : ''}

                          ${esIncorrecta ? 'border-red-500 bg-red-50' : ''}

                          ${!validadoDragDrop ? 'bg-white hover:bg-gray-50 hover:border-gray-400' : ''}

                        `}

                      >

                        {/* Número de posición */}

                        <div className={`

                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 self-center

                          ${esCorrecta ? 'bg-green-500 text-white' : esIncorrecta ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}

                        `}>

                          {index + 1}

                        </div>

{/* Contenido de la tarjeta */}

                        <div className="flex-1 flex flex-col">

                          <h4 className="font-semibold text-neutral-900 mb-2 text-sm text-center">

                            {tarjeta.nombre}

                          </h4>

                          <img

                            src={tarjeta.imagen}

                            alt={tarjeta.nombre}

                            className="w-full h-auto rounded-lg mb-2 object-cover"

                          />

                          <p className={`text-xs whitespace-pre-line text-center leading-tight ${esCorrecta ? 'text-green-700' : esIncorrecta ? 'text-red-700' : 'text-neutral-700'

                            }`}>

                            {tarjeta.texto}

                          </p>

                        </div>

{/* Indicador de arrastre */}

                        {!validadoDragDrop && (

                          <div className="flex-shrink-0 text-gray-400 mt-2 self-center">

                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />

                            </svg>

                          </div>

                        )}

                      </div>

                    );

                  })}

                </div>

{/* Botones de Acción */}

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">

                  <Button

                    onClick={handleResetDragDrop}

                    className="bg-neutral-500 hover:bg-neutral-600 text-white px-6 py-2"

                  >

                    <RotateCcw className="w-4 h-4 mr-2" />

                    Reiniciar

                  </Button>

                  <div className="flex gap-4 items-center">

                    {validadoDragDrop && (

                      <div className="text-sm text-neutral-700">

                        <span className="font-semibold">Resultado:</span> {respuestasCorrectasCount} de {ordenCorrecto.length} correctas

                        {esOrdenCorrecto() && (

                          <span className="ml-2 text-green-600 font-bold">✓ Orden correcto</span>

                        )}

                      </div>

                    )}

                    <Button

                      onClick={handleValidateDragDrop}

                      className="bg-[#006837] hover:bg-[#00844a] text-white px-6 py-2"

                    >

                      Validar

                    </Button>

                  </div>

                </div>

{/* Retroalimentación Final */}

                {mostrarReflexionFinal && esOrdenCorrecto() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-600 p-6 rounded-lg"
                  >
                    <p className="text-gray-800 leading-relaxed text-center text-base md:text-lg mb-6">
                      Has recorrido tres unidades que te han permitido identificar tu estilo de liderazgo, comprender el poder de liderar con visión y aplicar una ruta para la toma de decisiones en contextos reales. Ahora, con esta actividad final, has integrado esos aprendizajes en un escenario de marketing digital, demostrando que el liderazgo no solo dirige, sino que transforma.
                    </p>

                    <div className="flex justify-center">
                      <Button
                        onClick={handleFinalizarPlan}
                        className="bg-[#AA27B9] hover:bg-[#9d24ab] text-white px-8 py-3 text-lg font-bold shadow-lg transform transition hover:scale-105"
                      >
                        Finalizar Plan de Negocio
                      </Button>
                    </div>
                  </motion.div>
                )}

              </div>

            </div>

          </section>

        </motion.div>

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/liderazgo');

          }}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          Atrás

        </Button>

      </div>

<Footer />

    </div >

  );

};

export default PlanNegocioLiderazgoPage;


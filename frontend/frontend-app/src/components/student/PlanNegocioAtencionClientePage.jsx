import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const PlanNegocioAtencionClientePage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const isScrolledRef = useRef(false);

  const [formData, setFormData] = useState(() => {

    const saved = localStorage.getItem('plan_negocio_atención_cliente');

    return saved ? JSON.parse(saved) : {

      pregunta1: '', // Primer contacto

      pregunta2: '', // Propuesta de solución

      pregunta3: '', // Prestación del servicio

      pregunta4: '', // Seguimiento

      pregunta5: ''  // Post servicio

    };

  });

  const [mostrarResultado, setmostrarResultado] = useState(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    localStorage.setItem('plan_negocio_atención_cliente', JSON.stringify(formData));

  }, [formData]);

// Sincronizar el ref con el estado

  useEffect(() => {

    isScrolledRef.current = isScrolled;

  }, [isScrolled]);

// Detectar scroll para animar el header

  useEffect(() => {

    let ticking = false;

const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          const scrollPosition = window.scrollY;

if (isScrolledRef.current) {

            if (scrollPosition < 30) {

              isScrolledRef.current = false;

              setIsScrolled(false);

            }

          } else {

            if (scrollPosition > 70) {

              isScrolledRef.current = true;

              setIsScrolled(true);

            }

          }

ticking = false;

        });

        ticking = true;

      }

    };

window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

const handleInputChange = (field, value) => {

    setFormData(prev => ({

      ...prev,

      [field]: value

    }));

  };

// Función para calcular puntos según las respuestas

  const calcularPuntos = () => {

    let puntosTotales = 0;

// Pregunta 1 (Primer contacto): a) 5, b) 5, c) 1, d) 2

    if (formData.pregunta1) {

      if (formData.pregunta1.includes('Respondes con amabilidad y rapidez')) {

        puntosTotales += 5;

      } else if (formData.pregunta1.includes('Ofreces información clara')) {

        puntosTotales += 5;

      } else if (formData.pregunta1.includes('Ignoras mensajes')) {

        puntosTotales += 1;

      } else if (formData.pregunta1.includes('Das información incompleta')) {

        puntosTotales += 2;

      }

    }

// Pregunta 2 (Propuesta de solución): a) 5, b) 4, c) 1, d) 2

    if (formData.pregunta2) {

      if (formData.pregunta2.includes('Escuchas la necesidad y proponer alternativas')) {

        puntosTotales += 5;

      } else if (formData.pregunta2.includes('Explicas beneficios y condiciones')) {

        puntosTotales += 4;

      } else if (formData.pregunta2.includes('Prometes cosas que no se pueden cumplir')) {

        puntosTotales += 1;

      } else if (formData.pregunta2.includes('Das respuestas genéricas')) {

        puntosTotales += 2;

      }

    }

// Pregunta 3 (Prestación del servicio): a) 5, b) 4, c) 1, d) 2

    if (formData.pregunta3) {

      if (formData.pregunta3.includes('Entregas el producto en el tiempo acordado')) {

        puntosTotales += 5;

      } else if (formData.pregunta3.includes('Ofreces opciones de compra')) {

        puntosTotales += 4;

      } else if (formData.pregunta3.includes('No cumples con los horarios')) {

        puntosTotales += 1;

      } else if (formData.pregunta3.includes('Entregas productos incompletos')) {

        puntosTotales += 2;

      }

    }

// Pregunta 4 (Seguimiento): a) 5, b) 4, c) 1, d) 2

    if (formData.pregunta4) {

      if (formData.pregunta4.includes('Envías guía de seguimiento') || formData.pregunta4.includes('confirmar entrega')) {

        puntosTotales += 5;

      } else if (formData.pregunta4.includes('Preguntas al cliente si quedó satisfecho')) {

        puntosTotales += 4;

        'No das respuesta después de la venta.',

          puntosTotales += 1;

      } else if (formData.pregunta4.includes('Evades reclamaciones')) {

        puntosTotales += 2;

      }

    }

// Pregunta 5 (Post servicio): a) 5, b) 4, c) 1, d) 2

    if (formData.pregunta5) {

      if (formData.pregunta5.includes('Agradeces al cliente y ofrecer soporte')) {

        puntosTotales += 5;

      } else if (formData.pregunta5.includes('Invitas al cliente a participar en promociones')) {

        puntosTotales += 4;

      } else if (formData.pregunta5.includes('Olvidas a la cliente')) {

        puntosTotales += 1;

      } else if (formData.pregunta5.includes('No atiendes reclamaciones o devoluciones')) {

        puntosTotales += 2;

      }

    }

return puntosTotales;

  };

const handleGenerar = () => {

    // Validar que todas las preguntas estén respondidas

    const preguntas = ['pregunta1', 'pregunta2', 'pregunta3', 'pregunta4', 'pregunta5'];

    const faltanRespuestas = preguntas.some(p => !formData[p] || formData[p].trim() === '');

if (faltanRespuestas) {

      alert('Por favor responde todas las preguntas antes de generar el resultado');

      return;

    }

setmostrarResultado(true);

  };

const preguntas = [

    {

      id: 'pregunta1',

      paso: '1. Primer contacto',

      texto: '¿Cómo se contacta el cliente o conoce la empresa?',

      opciones: [

        'Respondes con amabilidad y rapidez en redes sociales.',

        'Ofreces información clara en los canales digitales o en el punto de venta.',

        'Ignoras mensajes o llamadas de clientes.',

        'Das información incompleta o confusa.'

      ]

    },

    {

      id: 'pregunta2',

      paso: '2. Propuesta de solución',

      texto: '¿Cómo ofrece el emprendimiento soluciones al cliente?',

      opciones: [

        'Escuchas la necesidad y proponer alternativas adaptadas.',

        'Explicas beneficios y condiciones de manera transparente.',

        'Prometes cosas que no se pueden cumplir.',

        'Das respuestas genéricas sin atender la necesidad real.'

      ]

    },

    {

      id: 'pregunta3',

      paso: '3. Prestación del servicio',

      texto: '¿Cómo se prestá el servicio?',

      opciones: [

        'Entregas el producto en el tiempo acordado.',

        'Ofreces opciones de compra (directa, domicilio, punto de venta).',

        'No cumples con los horarios de entrega.',

        'Entregas productos incompletos o en mal estado.'

      ]

    },

    {

      id: 'pregunta4',

      paso: '4. Seguimiento',

      texto: '¿Cómo se verifica si el servicio se está cumpliendo?',

      opciones: [

        'Envías guía de seguimiento o confirmar entrega.',

        'Preguntas al cliente si quedó satisfecho.',

        'No das respuesta después de la venta.',

        'Evades reclamaciones o comentarios de clientes.'

      ]

    },

    {

      id: 'pregunta5',

      paso: '5. Post servicio',

      texto: '¿Qué acciones se realizan después de la venta?',

      opciones: [

        'Agradeces al cliente y ofrecer soporte adicional.',

        'Invitas al cliente a participar en promociones futuras.',

        'Olvidas a la cliente una vez realizada la venta.',

        'No atiendes reclamaciones o devoluciones.'

      ]

    }

  ];

// Datos para la tabla

  const tablaData = preguntas.map(pregunta => ({

    paso: pregunta.paso,

    accion: formData[pregunta.id] || ''

  })).filter(item => item.accion && item.accion.trim() !== '');

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

                    src="/formacion.png"

                    alt="Formación Logo"

                    onClick={() => navigate('/student/dashboard')}

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

                      Atención al Cliente

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Plan de Negocio

                    </p>

                  </div>

                </motion.div>

              )}

{/* Menú de usuario - Derecha */}

              <div className="flex justify-end">

                <button

                  onClick={() => navigate('/student/perfil')}

                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"

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

{/* Breadcrumb sticky cuando hay scroll */}

      {isScrolled && (

        <motion.div

          className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

          initial={{ opacity: 0, y: -10 }}

          animate={{ opacity: 1, y: 0 }}

        >

          <div className="max-w-7xl mx-auto px-8 py-3">

            <div className="flex items-center gap-2 text-sm">

              <button onClick={() => navigate('/student/dashboard')} className="text-gray-600 hover:text-[#AA27B9] transition-colors flex items-center gap-1">

                <Home className="w-3.5 h-3.5" />

                Inicio

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/modulos')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Módulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/atencion-cliente')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Atención al Cliente

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Plan de Negocio

              </span>

            </div>

          </div>

        </motion.div>

      )}

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

          {/* Breadcrumás - Solo visible cuando NO hay scroll */}

          {!isScrolled && (

            <motion.div

              initial={{ opacity: 0, y: -10 }}

              animate={{ opacity: 1, y: 0 }}

              className="flex items-center gap-2 text-white/80 mb-6"

            >

              <button onClick={() => navigate('/student/dashboard')} className="hover:text-white transition-colors flex items-center gap-1">

                <Home className="w-4 h-4" />

                Inicio

              </button>

              <ChevronRight className="w-4 h-4" />

              <button onClick={() => navigate('/student/modulos')} className="hover:text-white transition-colors">

                Módulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button onClick={() => navigate('/student/atencion-cliente')} className="hover:text-white transition-colors">

                Atención al Cliente

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Plan de Negocio</span>

            </motion.div>

          )}

{/* Title */}

          <motion.div

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.6 }}

          >

            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">

              <span className="text-white text-sm font-medium">MÓDULO 6</span>

            </div>

<h1

              className="text-white"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Plan de Negocio - Atención al Cliente y Resolución de Conflictos

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

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-8">

          {/* Contenido Introductorio */}

          <div className="space-y-6">

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">

              Atención al cliente y resolución de conflictos: "Ciclo del servicio"

            </h2>

<div className="prose max-w-none space-y-4">

              <p className="text-gray-700 text-base leading-relaxed">

                En esta sección complementaria de atención al cliente y resolución de conflictos, vamos a desarrollar una actividad que servirá como insumo o aporte a tu plan de negocio.

              </p>

              <p className="text-gray-700 text-base leading-relaxed font-semibold">

                Selecciona una respuesta de acuerdo con las acciones que realizas en tu emprendimiento en cada paso del ciclo del servicio.

              </p>

            </div>

          </div>

{/* Cuestionario */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Cuestionario del Ciclo del Servicio</h3>

<div className="space-y-6 mb-6">

              {preguntas.map((pregunta, index) => (

                <div key={pregunta.id} className="border border-gray-300 rounded-lg p-4">

                  <label className="block text-sm font-semibold text-gray-900 mb-3">

                    {pregunta.paso}: {pregunta.texto}

                  </label>

                  <div className="space-y-2">

                    {pregunta.opciones.map((opcion, idx) => (

                      <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">

                        <input

                          type="radio"

                          name={pregunta.id}

                          value={opcion}

                          checked={formData[pregunta.id] === opcion}

                          onChange={(e) => handleInputChange(pregunta.id, e.target.value)}

                          className="mt-1"

                        />

                        <span className="text-sm text-gray-700">{opcion}</span>

                      </label>

                    ))}

                  </div>

                </div>

              ))}

            </div>

          </div>

<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">

            <p className="text-blue-900 font-semibold mb-2">RESULTADO ESPERADO</p>

            <p className="text-blue-800 text-sm">Tabla con el ciclo del servicio y las acciones seleccionadas</p>

          </div>

<Button

            onClick={handleGenerar}

            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"

          >

            Generar Resultado

          </Button>

        </div>

{/* Resultado Esperado - Burbujas de Diálogo */}

        {mostrarResultado && tablaData.length > 0 && (

          <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Resultado Esperado</h3>

<div className="flex flex-nowrap justify-center gap-3 md:gap-4 items-end pb-8 overflow-x-auto">

              {tablaData.map((row, index) => {

                // Colores para cada burbuja: verde claro, azul claro, naranja, gris, amarillo

                const colors = [

                  { bg: 'bg-green-200', tail: 'bg-green-200' },

                  { bg: 'bg-blue-200', tail: 'bg-blue-200' },

                  { bg: 'bg-orange-200', tail: 'bg-orange-200' },

                  { bg: 'bg-gray-300', tail: 'bg-gray-300' },

                  { bg: 'bg-yellow-200', tail: 'bg-yellow-200' }

                ];

                const color = colors[index] || colors[0];

return (

                  <div key={index} className="flex-shrink-0 relative" style={{ width: '180px', minWidth: '180px' }}>

                    {/* Burbuja de diálogo */}

                    <div className={`${color.bg} rounded-xl p-3 relative`} style={{ minHeight: '220px' }}>

                      {/* Caja blanca interna */}

                      <div className="bg-white rounded-lg p-4 h-full flex items-center justify-center" style={{ minHeight: '190px' }}>

                        <p className="text-sm text-gray-900 text-center leading-relaxed break-words">

                          {row.accion}

                        </p>

                      </div>

                      {/* Cola de la burbuja - apuntando hacia abajo y ligeramente a la izquierda */}

                      <svg

                        className="absolute"

                        style={{

                          bottom: '-12px',

                          left: '15px',

                          width: '20px',

                          height: '15px'

                        }}

                        viewBox="0 0 20 15"

                      >

                        <path

                          d="M 0 0 L 8 0 L 12 15 L 0 15 Z"

                          fill={color.bg.includes('green') ? '#bbf7d0' : color.bg.includes('blue') ? '#bfdbfe' : color.bg.includes('orange') ? '#fed7aa' : color.bg.includes('gray') ? '#d1d5db' : '#fef08a'}

                          transform="rotate(-15 10 7.5)"

                        />

                      </svg>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        )}

{/* Botón para finalizar plan de negocio */}

        {mostrarResultado && (

          <div className="mt-8 text-center">

            <Button

              onClick={async () => {

                try {

                  const token = getAuthToken();

// Preparar respuestas con puntos para enviar al backend

                  const respuestasConPuntos = [];

// Pregunta 1: Primer contacto - a) 5, b) 5, c) 1, d) 2

                  if (formData.pregunta1) {

                    let puntos = 0;

                    if (formData.pregunta1.includes('Respondes con amabilidad y rapidez')) {

                      puntos = 5;

                    } else if (formData.pregunta1.includes('Ofreces información clara')) {

                      puntos = 5;

                    } else if (formData.pregunta1.includes('Ignoras mensajes')) {

                      puntos = 1;

                    } else if (formData.pregunta1.includes('Das información incompleta')) {

                      puntos = 2;

                    }

                    respuestasConPuntos.push({

                      pregunta: 'pregunta1',

                      respuesta: formData.pregunta1,

                      puntos: puntos

                    });

                  }

// Pregunta 2: Propuesta de solución - a) 5, b) 4, c) 1, d) 2

                  if (formData.pregunta2) {

                    let puntos = 0;

                    if (formData.pregunta2.includes('Escuchas la necesidad y proponer alternativas')) {

                      puntos = 5;

                    } else if (formData.pregunta2.includes('Explicas beneficios y condiciones')) {

                      puntos = 4;

                    } else if (formData.pregunta2.includes('Prometes cosas que no se pueden cumplir')) {

                      puntos = 1;

                    } else if (formData.pregunta2.includes('Das respuestas genéricas')) {

                      puntos = 2;

                    }

                    respuestasConPuntos.push({

                      pregunta: 'pregunta2',

                      respuesta: formData.pregunta2,

                      puntos: puntos

                    });

                  }

// Pregunta 3: Prestación del servicio - a) 5, b) 4, c) 1, d) 2

                  if (formData.pregunta3) {

                    let puntos = 0;

                    if (formData.pregunta3.includes('Entregas el producto en el tiempo acordado')) {

                      puntos = 5;

                    } else if (formData.pregunta3.includes('Ofreces opciones de compra')) {

                      puntos = 4;

                    } else if (formData.pregunta3.includes('No cumples con los horarios')) {

                      puntos = 1;

                    } else if (formData.pregunta3.includes('Entregas productos incompletos')) {

                      puntos = 2;

                    }

                    respuestasConPuntos.push({

                      pregunta: 'pregunta3',

                      respuesta: formData.pregunta3,

                      puntos: puntos

                    });

                  }

// Pregunta 4: Seguimiento - a) 5, b) 4, c) 1, d) 2

                  if (formData.pregunta4) {

                    let puntos = 0;

                    if (formData.pregunta4.includes('Envías guía de seguimiento') || formData.pregunta4.includes('confirmar entrega')) {

                      puntos = 5;

                    } else if (formData.pregunta4.includes('Preguntas al cliente si quedó satisfecho')) {

                      puntos = 4;

                    } else if (formData.pregunta4.includes('No das respuesta después de la venta')) {

                      puntos = 1;

                    } else if (formData.pregunta4.includes('Evades reclamaciones')) {

                      puntos = 2;

                    }

                    respuestasConPuntos.push({

                      pregunta: 'pregunta4',

                      respuesta: formData.pregunta4,

                      puntos: puntos

                    });

                  }

// Pregunta 5: Post servicio - a) 5, b) 4, c) 1, d) 2

                  if (formData.pregunta5) {

                    let puntos = 0;

                    if (formData.pregunta5.includes('Agradeces al cliente y ofrecer soporte')) {

                      puntos = 5;

                    } else if (formData.pregunta5.includes('Invitas al cliente a participar en promociones')) {

                      puntos = 4;

                    } else if (formData.pregunta5.includes('Olvidas a la cliente')) {

                      puntos = 1;

                    } else if (formData.pregunta5.includes('No atiendes reclamaciones o devoluciones')) {

                      puntos = 2;

                    }

                    respuestasConPuntos.push({

                      pregunta: 'pregunta5',

                      respuesta: formData.pregunta5,

                      puntos: puntos

                    });

                  }

// Registrar puntos del plan de negocio

                  if (respuestasConPuntos.length > 0) {

                    await fetch(`${API_BASE_URL}/registrar-puntos-plan-negocio`, {

                      method: 'POST',

                      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                      body: JSON.stringify({

                        modulo_nombre: 'Atención al Cliente',

                        estrategias: respuestasConPuntos.map(r => ({

                          etapa: r.pregunta,

                          estrategia: r.respuesta,

                          puntos: r.puntos

                        }))

                      })

                    });

                  }

// Registrar progreso del modulo

                  await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify({

                      modulo_nombre: 'Atención al Cliente',

                      paso_nombre: 'Plan de Negocio',

                      curso_nombre: 'Atención al Cliente'

                    })

                  });

// Persistir respuestas del plan de negocio en el backend

                  await fetch(`${API_BASE_URL}/save-respuestas-plan`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify({

                      modulo_nombre: 'Atención al Cliente',

                      respuestas: formData

                    })

                  });

localStorage.removeItem('plan_negocio_atención_cliente');

                  localStorage.setItem('atención_cliente_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  alert('¡Plan de Negocio completado! El siguiente módulo ha sido desbloqueado.');

                  navigate('/student/modulos');

                } catch (error) {

                  console.error('Error al registrar progreso:', error);

                  localStorage.removeItem('plan_negocio_atención_cliente');

                  localStorage.setItem('atención_cliente_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  navigate('/student/modulos');

                }

              }}

              className="bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] hover:from-[#FFEB3B] hover:to-[#AA27B9] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105"

            >

              Finalizar Plan de Negocio

            </Button>

          </div>

        )}

      </div>

<motion.div

        initial={{ opacity: 0, x: -20 }}

        animate={{ opacity: 1, x: 0 }}

        className="fixed bottom-8 left-8 z-40"

      >

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/atencion-cliente');

          }}

          className="bg-white hover:bg-gray-100 text-[#AA27B9] border-2 border-[#AA27B9] rounded-full px-6 py-3 flex items-center gap-2 shadow-2xl font-bold transition-all transform hover:scale-105"

        >

          <ArrowLeft className="w-5 h-5" />

          Atrás

        </Button>

      </motion.div>

<Footer />

    </div>

  );

};

export default PlanNegocioAtencionClientePage;


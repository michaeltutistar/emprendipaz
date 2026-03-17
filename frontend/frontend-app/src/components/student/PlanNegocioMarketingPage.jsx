import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const PlanNegocioMarketingPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const isScrolledRef = useRef(false);

  const [formData, setFormData] = useState(() => {

    const saved = localStorage.getItem('plan_negocio_marketing');

    return saved ? JSON.parse(saved) : {

      pregunta1: '', // Variable Producto

      pregunta2: '', // Variable Precio

      pregunta3: '', // Plaza (Distribución)

      pregunta4: '', // Promoción

      pregunta5: '', // Gestión administrativa

      pregunta6: ''  // Fidelización

    };

  });

  const [mostrarResultado, setmostrarResultado] = useState(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    localStorage.setItem('plan_negocio_marketing', JSON.stringify(formData));

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

// Pregunta 1 (Variable Producto): a) 5, b) 4, c) 3

    if (formData.pregunta1) {

      if (formData.pregunta1.startsWith('a)')) {

        puntosTotales += 5;

      } else if (formData.pregunta1.startsWith('b)')) {

        puntosTotales += 4;

      } else if (formData.pregunta1.startsWith('c)')) {

        puntosTotales += 3;

      }

    }

// Pregunta 2 (Variable Precio): a) 3, b) 5, c) 4

    if (formData.pregunta2) {

      if (formData.pregunta2.startsWith('a)')) {

        puntosTotales += 3;

      } else if (formData.pregunta2.startsWith('b)')) {

        puntosTotales += 5;

      } else if (formData.pregunta2.startsWith('c)')) {

        puntosTotales += 4;

      }

    }

// Pregunta 3 (Plaza): a) 3, b) 5, c) 4

    if (formData.pregunta3) {

      if (formData.pregunta3.startsWith('a)')) {

        puntosTotales += 3;

      } else if (formData.pregunta3.startsWith('b)')) {

        puntosTotales += 5;

      } else if (formData.pregunta3.startsWith('c)')) {

        puntosTotales += 4;

      }

    }

// Pregunta 4 (Promoción): a) 5, b) 3, c) 4

    if (formData.pregunta4) {

      if (formData.pregunta4.startsWith('a)')) {

        puntosTotales += 5;

      } else if (formData.pregunta4.startsWith('b)')) {

        puntosTotales += 3;

      } else if (formData.pregunta4.startsWith('c)')) {

        puntosTotales += 4;

      }

    }

// Pregunta 5 (Gestión administrativa): a) 5, b) 3, c) 4

    if (formData.pregunta5) {

      if (formData.pregunta5.startsWith('a)')) {

        puntosTotales += 5;

      } else if (formData.pregunta5.startsWith('b)')) {

        puntosTotales += 3;

      } else if (formData.pregunta5.startsWith('c)')) {

        puntosTotales += 4;

      }

    }

// Pregunta 6 (Fidelización): a) 3, b) 4, c) 5

    if (formData.pregunta6) {

      if (formData.pregunta6.startsWith('a)')) {

        puntosTotales += 3;

      } else if (formData.pregunta6.startsWith('b)')) {

        puntosTotales += 4;

      } else if (formData.pregunta6.startsWith('c)')) {

        puntosTotales += 5;

      }

    }

return puntosTotales;

  };

const handleGenerar = () => {

    // Validar que todas las preguntas estén respondidas

    const preguntas = ['pregunta1', 'pregunta2', 'pregunta3', 'pregunta4', 'pregunta5', 'pregunta6'];

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

      texto: 'Variable Producto: ¿Qué estrategia aplicarás para tu producto?',

      opciones: [

        'a) Innovar en diseño y calidad.',

        'b) Adaptar el producto a las necesidades locales.',

        'c) Ofrecer variedad de presentaciones.'

      ]

    },

    {

      id: 'pregunta2',

      texto: 'Variable Precio: ¿Qué estrategia aplicarás para el precio?',

      opciones: [

        'a) Competitivo (igual o menor que el de mi competencia).',

        'b) Premium (precio más alto por calidad diferenciada).',

        'c) Flexible (descuentos, promociones, combos).'

      ]

    },

    {

      id: 'pregunta3',

      texto: 'Plaza (Distribución): ¿Qué estrategia aplicarás para la distribución?',

      opciones: [

        'a) Venta directa en puntos físicos.',

        'b) Uso de plataformas digitales/e-commerce.',

        'c) Alianzas con distribuidores locales.'

      ]

    },

    {

      id: 'pregunta4',

      texto: 'Promoción: ¿Qué estrategia aplicarás para la promoción?',

      opciones: [

        'a) Publicidad en redes sociales.',

        'b) Promociones y descuentos especiales.',

        'c) Marketing boca a boca y referidos.'

      ]

    },

    {

      id: 'pregunta5',

      texto: 'Gestión administrativa / Organización interna: ¿Qué estrategia aplicarás para organizar tu emprendimiento?',

      opciones: [

        'a) Definir roles y responsabilidades claras.',

        'b) Usar herramientas simples de planificación (agenda, calendario, listas).',

        'c) Trabajar en equipo con reuniones periódicas.'

      ]

    },

    {

      id: 'pregunta6',

      texto: 'Fidelización de clientes: ¿Qué estrategia aplicarás para fidelizar a tus clientes?',

      opciones: [

        'a) Programas de recompensas o descuentos para clientes frecuentes.',

        'b) Comunicación constante y personalizada (mensajes, seguimiento postventa).',

        'c) Ofrecer experiencias positivas que generen confianza y recomendación.'

      ]

    }

  ];

// Datos para el diagrama

  const diagramaData = [

    {

      variable: 'Producto',

      estrategia: formData.pregunta1,

      color: 'blue',

      colorClass: 'bg-blue-500',

      colorArrow: '#3b82f6'

    },

    {

      variable: 'Precio',

      estrategia: formData.pregunta2,

      color: 'green',

      colorClass: 'bg-green-500',

      colorArrow: '#22c55e'

    },

    {

      variable: 'Plaza',

      estrategia: formData.pregunta3,

      color: 'orange',

      colorClass: 'bg-orange-500',

      colorArrow: '#f97316'

    },

    {

      variable: 'Promoción',

      estrategia: formData.pregunta4,

      color: 'purple',

      colorClass: 'bg-purple-400',

      colorArrow: '#a78bfa'

    },

    {

      variable: 'Administrativa',

      estrategia: formData.pregunta5,

      color: 'gray',

      colorClass: 'bg-gray-500',

      colorArrow: '#6b7280'

    }

  ].filter(item => item.estrategia && item.estrategia.trim() !== '');

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

                      Marketing y Comercialización

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

                Modulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/presentacion-modulo')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Marketing y Comercialización

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

                Modulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button onClick={() => navigate('/student/presentacion-modulo')} className="hover:text-white transition-colors">

                Marketing y Comercialización

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

              <span className="text-white text-sm font-medium">MÓDULO 1</span>

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

              Plan de Negocio - Marketing y Comercialización

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

              Marketing y comercialización: "Estrategias de marketing"

            </h2>

<div className="prose max-w-none space-y-4">

              <p className="text-gray-700 text-base leading-relaxed">

                Ahora que ya has culminado exitosamente el desarrollo de las 3 unidades del modulo de Marketing y Comercialización, es momento de elaborar el aporte de este modulo a tu plan de negocios.

              </p>

              <p className="text-gray-700 text-base leading-relaxed">

                Vas a seleccionar la estrategia que más se adecue a la realidad de tu emprendimiento para cada variable del mix de marketing, y adicionalmente una estrategia de tipo administrativa y otra de fidelización.

              </p>

              <p className="text-gray-700 text-base leading-relaxed font-semibold">

                Selecciona una estrategia en cada variable.

              </p>

            </div>

          </div>

{/* Cuestionario */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Cuestionario de Estrategias</h3>

<div className="space-y-6 mb-6">

              {preguntas.map((pregunta, index) => (

                <div key={pregunta.id} className="border border-gray-300 rounded-lg p-4">

                  <label className="block text-sm font-semibold text-gray-900 mb-3">

                    {index + 1}. {pregunta.texto}

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

<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">

            <p className="text-green-900 font-semibold mb-2">RESULTADO ESPERADO</p>

            <p className="text-green-800 text-sm">Tabla con las estrategias seleccionadas para cada variable del mix de marketing</p>

          </div>

<Button

            onClick={handleGenerar}

            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"

          >

            Generar Resultado

          </Button>

        </div>

{/* Resultado Esperado - Diagrama */}

        {mostrarResultado && diagramaData.length > 0 && (

          <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Resultado Esperado</h3>

<div className="flex justify-center gap-6 md:gap-10 items-start">

              {/* Columna Izquierda - Variables */}

              <div className="flex flex-col gap-4">

                {diagramaData.map((item, index) => {

                  return (

                    <div key={index} className="flex items-center" style={{ minHeight: '80px' }}>

                      {/* Bloque rectangular izquierdo */}

                      <div className={`${item.colorClass} text-white px-6 py-4 rounded-lg shadow-md w-[140px] text-center font-semibold`}>

                        {item.variable}

                      </div>

                    </div>

                  );

                })}

              </div>

{/* Flechas y Columna Derecha - Estrategias */}

              <div className="flex flex-col gap-4 relative">

                {diagramaData.map((item, index) => {

                  const estrategiaLimpia = item.estrategia.replace(/^[a-c]\)\s*/, '');

                  return (

                    <div key={index} className="flex items-center relative" style={{ minHeight: '80px' }}>

                      {/* Flecha horizontal */}

                      <svg

                        className="absolute"

                        style={{

                          width: '80px',

                          height: '4px',

                          left: '-80px',

                          top: '50%',

                          transform: 'translateY(-50%)'

                        }}

                      >

                        <line

                          x1="0"

                          y1="2"

                          x2="80"

                          y2="2"

                          stroke={item.colorArrow}

                          strokeWidth="4"

                        />

                        <polygon

                          points="75,0 80,2 75,4"

                          fill={item.colorArrow}

                        />

                      </svg>

{/* Bloque redondeado derecho */}

                      <div className={`${item.colorClass} text-white px-6 py-4 rounded-xl shadow-md w-[280px]`}>

                        <p className="text-sm leading-relaxed">{estrategiaLimpia}</p>

                      </div>

                    </div>

                  );

                })}

              </div>

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

// Pregunta 1: a) 5, b) 4, c) 3

                  if (formData.pregunta1) {

                    let puntos = 0;

                    if (formData.pregunta1.startsWith('a)')) puntos = 5;

                    else if (formData.pregunta1.startsWith('b)')) puntos = 4;

                    else if (formData.pregunta1.startsWith('c)')) puntos = 3;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta1',

                      respuesta: formData.pregunta1,

                      puntos: puntos

                    });

                  }

// Pregunta 2: a) 3, b) 5, c) 4

                  if (formData.pregunta2) {

                    let puntos = 0;

                    if (formData.pregunta2.startsWith('a)')) puntos = 3;

                    else if (formData.pregunta2.startsWith('b)')) puntos = 5;

                    else if (formData.pregunta2.startsWith('c)')) puntos = 4;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta2',

                      respuesta: formData.pregunta2,

                      puntos: puntos

                    });

                  }

// Pregunta 3: a) 3, b) 5, c) 4

                  if (formData.pregunta3) {

                    let puntos = 0;

                    if (formData.pregunta3.startsWith('a)')) puntos = 3;

                    else if (formData.pregunta3.startsWith('b)')) puntos = 5;

                    else if (formData.pregunta3.startsWith('c)')) puntos = 4;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta3',

                      respuesta: formData.pregunta3,

                      puntos: puntos

                    });

                  }

// Pregunta 4: a) 5, b) 3, c) 4

                  if (formData.pregunta4) {

                    let puntos = 0;

                    if (formData.pregunta4.startsWith('a)')) puntos = 5;

                    else if (formData.pregunta4.startsWith('b)')) puntos = 3;

                    else if (formData.pregunta4.startsWith('c)')) puntos = 4;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta4',

                      respuesta: formData.pregunta4,

                      puntos: puntos

                    });

                  }

// Pregunta 5: a) 5, b) 3, c) 4

                  if (formData.pregunta5) {

                    let puntos = 0;

                    if (formData.pregunta5.startsWith('a)')) puntos = 5;

                    else if (formData.pregunta5.startsWith('b)')) puntos = 3;

                    else if (formData.pregunta5.startsWith('c)')) puntos = 4;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta5',

                      respuesta: formData.pregunta5,

                      puntos: puntos

                    });

                  }

// Pregunta 6: a) 3, b) 4, c) 5

                  if (formData.pregunta6) {

                    let puntos = 0;

                    if (formData.pregunta6.startsWith('a)')) puntos = 3;

                    else if (formData.pregunta6.startsWith('b)')) puntos = 4;

                    else if (formData.pregunta6.startsWith('c)')) puntos = 5;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta6',

                      respuesta: formData.pregunta6,

                      puntos: puntos

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

                      modulo_nombre: 'Marketing y Comercialización',

                      respuestas: formData

                    })

                  });

// Registrar puntos del plan de negocio

                  if (respuestasConPuntos.length > 0) {

                    await fetch(`${API_BASE_URL}/registrar-puntos-plan-negocio`, {

                      method: 'POST',

                      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                      body: JSON.stringify({

                        modulo_nombre: 'Marketing y Comercialización',

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

                      modulo_nombre: 'Marketing y Comercialización',

                      paso_nombre: 'Plan de Negocio',

                      curso_nombre: 'Marketing y Comercialización'

                    })

                  });

// Limpiar datos locales exitosamente

                  localStorage.removeItem('plan_negocio_marketing');

                  localStorage.setItem('marketing_comercialización_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  alert('¡Plan de Negocio completado! El siguiente modulo ha sido desbloqueado.');

                  navigate('/student/modulos');

                } catch (error) {

                  console.error('Error al registrar progreso:', error);

                  // Incluso en caso de error de red, intentamás marcar como completado localmente para no bloquear al usuario

                  localStorage.setItem('marketing_comercialización_plan_negocio_completado', 'true');

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

            navigate('/student/presentacion-modulo');

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

export default PlanNegocioMarketingPage;


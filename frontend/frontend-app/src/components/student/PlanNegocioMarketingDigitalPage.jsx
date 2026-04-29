import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const PlanNegocioMarketingDigitalPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const isScrolledRef = useRef(false);

  const [formData, setFormData] = useState(() => {

    const saved = localStorage.getItem('plan_negocio_marketing_digital');

    return saved ? JSON.parse(saved) : {

      problema: '',

      objetivoSmart: '',

      estrategia1: '',

      estrategia2: '',

      recursosEstrategia1: [],

      recursosEstrategia2: [],

      tiempoEstrategia1: '',

      tiempoEstrategia1Otro: '',

      tiempoEstrategia2: '',

      tiempoEstrategia2Otro: '',

      indicadoresEstrategia1: [],

      indicadoresEstrategia2: []

    };

  });

  const [mostrarResultado, setmostrarResultado] = useState(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    localStorage.setItem('plan_negocio_marketing_digital', JSON.stringify(formData));

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

const handleCheckboxChange = (field, value, checked) => {

    setFormData(prev => {

      const currentArray = prev[field] || [];

      if (checked) {

        return { ...prev, [field]: [...currentArray, value] };

      } else {

        return { ...prev, [field]: currentArray.filter(item => item !== value) };

      }

    });

  };

const handleEstrategiaChange = (estrategia, checked) => {

    if (checked) {

      // Si ya hay 2 estrategias seleccionadas, no permitir más

      const estrategiasSeleccionadas = [formData.estrategia1, formData.estrategia2].filter(e => e);

      if (estrategiasSeleccionadas.length >= 2 && !formData.estrategia1.includes(estrategia) && !formData.estrategia2.includes(estrategia)) {

        alert('Solo puedes seleccionar 2 estrategias');

        return;

      }

// Asignar a estrategia1 o estrategia2

      if (!formData.estrategia1) {

        handleInputChange('estrategia1', estrategia);

      } else if (!formData.estrategia2 && formData.estrategia1 !== estrategia) {

        handleInputChange('estrategia2', estrategia);

      }

    } else {

      // Deseleccionar

      if (formData.estrategia1 === estrategia) {

        handleInputChange('estrategia1', '');

        // Limpiar datos de estrategia1

        handleInputChange('recursosEstrategia1', []);

        handleInputChange('tiempoEstrategia1', '');

        handleInputChange('tiempoEstrategia1Otro', '');

        handleInputChange('indicadoresEstrategia1', []);

      } else if (formData.estrategia2 === estrategia) {

        handleInputChange('estrategia2', '');

        // Limpiar datos de estrategia2

        handleInputChange('recursosEstrategia2', []);

        handleInputChange('tiempoEstrategia2', '');

        handleInputChange('tiempoEstrategia2Otro', '');

        handleInputChange('indicadoresEstrategia2', []);

      }

    }

  };

// Función para calcular puntos según las respuestas

  const calcularPuntos = () => {

    let puntosTotales = 0;

// Paso 1: cualquier opción = 1 punto

    if (formData.problema && formData.problema.trim() !== '') {

      puntosTotales += 1;

    }

// Paso 2: si diligencia objetivo SMART = 1 punto

    if (formData.objetivoSmart && formData.objetivoSmart.trim() !== '') {

      puntosTotales += 1;

    }

// Paso 3: estrategias seleccionadas

    const estrategiasSeleccionadas = [formData.estrategia1, formData.estrategia2].filter(e => e && e.trim() !== '');

    if (estrategiasSeleccionadas.length === 2) {

      puntosTotales += 2;

    } else if (estrategiasSeleccionadas.length === 1) {

      puntosTotales += 1;

    }

// Recursos primera estrategia: si elige opción = 1 punto

    if (formData.recursosEstrategia1 && formData.recursosEstrategia1.length > 0) {

      puntosTotales += 1;

    }

// Recursos segunda estrategia: si elige opción = 1 punto

    if (formData.recursosEstrategia2 && formData.recursosEstrategia2.length > 0) {

      puntosTotales += 1;

    }

// Tiempo primera estrategia: si elige opción = 1 punto

    if (formData.tiempoEstrategia1 && formData.tiempoEstrategia1.trim() !== '') {

      puntosTotales += 1;

    }

// Tiempo segunda estrategia: si elige opción = 1 punto

    if (formData.tiempoEstrategia2 && formData.tiempoEstrategia2.trim() !== '') {

      puntosTotales += 1;

    }

// Indicadores primera estrategia: si elige opción = 1 punto

    if (formData.indicadoresEstrategia1 && formData.indicadoresEstrategia1.length > 0) {

      puntosTotales += 1;

    }

// Indicadores segunda estrategia: si elige opción = 1 punto

    if (formData.indicadoresEstrategia2 && formData.indicadoresEstrategia2.length > 0) {

      puntosTotales += 1;

    }

return puntosTotales;

  };

const handleGenerar = () => {

    // Validaciones

    if (!formData.problema) {

      alert('Por favor selecciona un problema de marketing digital');

      return;

    }

    if (!formData.objetivoSmart || formData.objetivoSmart.trim() === '') {

      alert('Por favor escribe tu objetivo SMART');

      return;

    }

    if (!formData.estrategia1 || !formData.estrategia2) {

      alert('Por favor selecciona 2 estrategias de marketing digital');

      return;

    }

// Validar que cada estrategia tenga recursos, tiempo e indicadores

    if (formData.recursosEstrategia1.length === 0 || formData.tiempoEstrategia1 === '' || formData.indicadoresEstrategia1.length === 0) {

      alert('Por favor completa todos los campos para la primera estrategia');

      return;

    }

    if (formData.recursosEstrategia2.length === 0 || formData.tiempoEstrategia2 === '' || formData.indicadoresEstrategia2.length === 0) {

      alert('Por favor completa todos los campos para la segunda estrategia');

      return;

    }

setmostrarResultado(true);

  };

const problemas = [
    'a) Mi negocio tiene baja visibilidad en buscadores y redes sociales.',
    'b) Mis canales digitales existen, pero tienen poca actividad y contenido sin propósito.',
    'c) Los clientes dejan comentarios negativos o solicitudes sin respuesta.',
    'd) La competencia ofrece mejor posicionamiento y atención más rápida.',
    'e) No tengo objetivos claros ni estrategias definidas para mejorar mi presencia digital.'
  ];

const estrategias = [

    'Marketing de influencers',

    'Mejoramiento o creación de perfiles en redes sociales',

    'Contenido generado por el cliente',

    'Marketing de contenidos',

    'Publicidad pago',

    'Promociones y concursos en redes sociales',

    'Gestión activa de comentarios en los perfiles de redes sociales del emprendimiento',

    'SEO (Optimización en buscadores)',

    'SEM (Publicidad en buscadores)'

  ];

const recursos = [

    'Recursos humanos (por ejemplo: equipo de diseño, community manager, colaboración con influencers).',

    'Recursos tecnológicos (por ejemplo: computadora, celular con buena cámara, software de edición, herramientas de analítica).',

    'Recursos financieros (por ejemplo: presupuesto para publicidad paga, contratación de servicios externos, premios para concursos).',

    'Recursos de tiempo y organización (por ejemplo: planificación de calendario de publicaciones, dedicación semanal para gestión de comentarios).',

    'Recursos creativos (por ejemplo: ideas de contenido, fotografías originales, storytelling para campañas).'

  ];

const tiempos = ['2 meses', '3 meses', '6 meses', '1 año'];

const indicadores = [

    'Alcance logrado (por ejemplo: cuántas personas vieron más publicaciones o anuncios).',

    'Interacción del público (por ejemplo: cantidad de "me gusta", comentarios, compartidos o participación en concursos).',

    'Nuevos seguidores o clientes (por ejemplo: aumento de seguidores en redes sociales o clientes que llegaron por campañas).',

    'Visitas a mi página o perfil (por ejemplo: cuántas personas entraron a mi sitio web o redes sociales).',

    'Ventas o contactos generados (por ejemplo: número de productos vendidos, pedidos recibidos o mensajes de interés).'

  ];

const getTiempoFinal = (tiempo, otro) => {

    if (tiempo === 'Otra opción') {

      return otro || tiempo;

    }

    return tiempo;

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

                      Marketing Digital

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

              <button onClick={() => navigate('/student/marketing-digital')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Marketing Digital

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

              <button onClick={() => navigate('/student/marketing-digital')} className="hover:text-white transition-colors">

                Marketing Digital

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

              <span className="text-white text-sm font-medium">MÓDULO: Marketing Digital</span>

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

              Plan de Negocio - Marketing Digital

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

              Marketing digital: "Plan de acción digital"

            </h2>

<div className="prose max-w-none space-y-4">

              <p className="text-gray-700 text-base leading-relaxed">

                En esta sección complementaria del módulo de marketing digital y estrategias comerciales, vamos a desarrollar una actividad que servirá como insumo o aporte a tu plan de negocio.

              </p>

            </div>

          </div>

{/* Paso 1: Identificación del problema */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Paso 1. Identificación del problema de marketing digital de tu emprendimiento</h3>

<div className="space-y-4 mb-6">

              <p className="text-gray-700 text-base leading-relaxed">

                Con base en el diagnóstico de tu presencia digital, ¿cuál de los siguientes problemas de marketing digital afecta más a tu emprendimiento?
              </p>
              <div className="space-y-2">
                {problemas.map((problema, idx) => (

                  <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">

                    <input

                      type="radio"

                      name="problema"

                      value={problema}

                      checked={formData.problema === problema}

                      onChange={(e) => handleInputChange('problema', e.target.value)}

                      className="mt-1"

                    />

                    <span className="text-sm text-gray-700">{problema}</span>

                  </label>

                ))}

              </div>

            </div>

          </div>

{/* Paso 2: Objetivo SMART */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Paso 2. Define tu objetivo SMART</h3>

<div className="space-y-4 mb-6">

              <p className="text-gray-700 text-base leading-relaxed">

                Ahora es momento de que definas el objetivo SMART que te permitirá resolver el problema que has identificado en el paso 1.

              </p>

              <p className="text-gray-700 text-base leading-relaxed">

                Recuerda que un objetivo SMART debe ser:

              </p>

              <ul className="list-disc list-inside text-gray-700 text-base space-y-1 ml-4">

                <li><strong>S (Específico):</strong> claro y concreto.</li>

                <li><strong>M (Medible):</strong> que se pueda cuantificar o evaluar.</li>

                <li><strong>A (Alcanzable):</strong> realista según los recursos disponibles.</li>

                <li><strong>R (Relevante):</strong> que aporte al propósito del negocio.</li>

                <li><strong>T (Temporal):</strong> con un plazo definido.</li>

              </ul>

              <p className="text-gray-700 text-base leading-relaxed">

                Algunos ejemplos de objetivos SMART:

              </p>

              <ul className="list-disc list-inside text-gray-700 text-smáspace-y-1 ml-4 italic">

                <li>"Aumentar en un 20% la interacción en la página de Facebook en los próximos 3 meses mediante publicaciones semanales."</li>

                <li>"Lograr 50 ventas en la tienda virtual durante el primer trimestre, ofreciendo promociones en fechas clave."</li>

                <li>"Lograr 120 ventas del producto en los próximos 2 meses."</li>

              </ul>

              <p className="text-gray-700 text-base leading-relaxed font-semibold">

                Escribe tu objetivo SMART en el cuadro de texto:

              </p>

              <textarea

                value={formData.objetivoSmart}

                onChange={(e) => handleInputChange('objetivoSmart', e.target.value.slice(0, 200))}

                maxLength={200}

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"

                placeholder="Escribe tu objetivo SMART aquí..."

              />

              <p className="text-sm text-amber-700 mt-1 font-medium">

                Máximo 200 caracteres. {formData.objetivoSmart.length}/200

              </p>

            </div>

          </div>

{/* Paso 3: Selección de estrategias */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Paso 3. Selecciona las estrategias de marketing digital</h3>

<div className="space-y-4 mb-6">

              <p className="text-gray-700 text-base leading-relaxed font-semibold">

                Escoge las 2 estrategias que consideres más adecuadas para cumplir tu objetivo SMART.

              </p>

<div className="space-y-2">

                {estrategias.map((estrategia, idx) => {

                  const isSelected = formData.estrategia1 === estrategia || formData.estrategia2 === estrategia;

                  const canSelect = !isSelected && [formData.estrategia1, formData.estrategia2].filter(e => e).length < 2;

return (

                    <label

                      key={idx}

                      className={`flex items-start gap-2 cursor-pointer p-2 rounded ${isSelected ? 'bg-blue-50 border-2 border-blue-500' : canSelect ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'

                        }`}

                    >

                      <input

                        type="checkbox"

                        checked={isSelected}

                        onChange={(e) => handleEstrategiaChange(estrategia, e.target.checked)}

                        disabled={!canSelect && !isSelected}

                        className="mt-1"

                      />

                      <span className="text-sm text-gray-700">{estrategia}</span>

                    </label>

                  );

                })}

              </div>

            </div>

          </div>

{/* Detalles de Estrategia 1 */}

          {formData.estrategia1 && (

            <div className="border-t pt-8">

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Detalles de tu PRIMERA estrategia: {formData.estrategia1}</h3>

<div className="space-y-6">

                {/* Recursos */}

                <div>

                  <p className="text-gray-700 text-base leading-relaxed font-semibold mb-3">

                    ¿Qué recursos necesitarás para implementar la PRIMERA estrategia seleccionada? (puedes elegir una o varias opciones)

                  </p>

                  <div className="space-y-2">

                    {recursos.map((recurso, idx) => (

                      <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">

                        <input

                          type="checkbox"

                          checked={formData.recursosEstrategia1.includes(recurso)}

                          onChange={(e) => handleCheckboxChange('recursosEstrategia1', recurso, e.target.checked)}

                          className="mt-1"

                        />

                        <span className="text-sm text-gray-700">{recurso}</span>

                      </label>

                    ))}

                  </div>

                </div>

{/* Tiempo */}

                <div>

                  <p className="text-gray-700 text-base leading-relaxed font-semibold mb-3">

                    ¿En cuánto tiempo ejecutarás tu PRIMERA estrategia de marketing digital seleccionada?

                  </p>

                  <select

                    value={formData.tiempoEstrategia1}

                    onChange={(e) => handleInputChange('tiempoEstrategia1', e.target.value)}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"

                  >

                    <option value="">Selecciona un tiempo</option>

                    {tiempos.map((tiempo, idx) => (

                      <option key={idx} value={tiempo}>{tiempo}</option>

                    ))}

                    <option value="Otra opción">¿Otra opción?</option>

                  </select>

                  {formData.tiempoEstrategia1 === 'Otra opción' && (

                    <input

                      type="text"

                      value={formData.tiempoEstrategia1Otro}

                      onChange={(e) => handleInputChange('tiempoEstrategia1Otro', e.target.value)}

                      placeholder="Escribe tu opción aquí"

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  )}

                </div>

{/* Indicadores */}

                <div>

                  <p className="text-gray-700 text-base leading-relaxed font-semibold mb-3">

                    ¿Qué indicadores de resultado usarás para medir la consecución de tu PRIMERA estrategia de marketing digital seleccionada? (puedes elegir una o varias opciones)

                  </p>

                  <div className="space-y-2">

                    {indicadores.map((indicador, idx) => (

                      <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">

                        <input

                          type="checkbox"

                          checked={formData.indicadoresEstrategia1.includes(indicador)}

                          onChange={(e) => handleCheckboxChange('indicadoresEstrategia1', indicador, e.target.checked)}

                          className="mt-1"

                        />

                        <span className="text-sm text-gray-700">{indicador}</span>

                      </label>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          )}

{/* Detalles de Estrategia 2 */}

          {formData.estrategia2 && (

            <div className="border-t pt-8">

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Detalles de tu SEGUNDA estrategia: {formData.estrategia2}</h3>

<div className="space-y-6">

                {/* Recursos */}

                <div>

                  <p className="text-gray-700 text-base leading-relaxed font-semibold mb-3">

                    ¿Qué recursos necesitarás para implementar la SEGUNDA estrategia seleccionada? (puedes elegir una o varias opciones)

                  </p>

                  <div className="space-y-2">

                    {recursos.map((recurso, idx) => (

                      <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">

                        <input

                          type="checkbox"

                          checked={formData.recursosEstrategia2.includes(recurso)}

                          onChange={(e) => handleCheckboxChange('recursosEstrategia2', recurso, e.target.checked)}

                          className="mt-1"

                        />

                        <span className="text-sm text-gray-700">{recurso}</span>

                      </label>

                    ))}

                  </div>

                </div>

{/* Tiempo */}

                <div>

                  <p className="text-gray-700 text-base leading-relaxed font-semibold mb-3">

                    ¿En cuánto tiempo ejecutarás tu SEGUNDA estrategia de marketing digital seleccionada?

                  </p>

                  <select

                    value={formData.tiempoEstrategia2}

                    onChange={(e) => handleInputChange('tiempoEstrategia2', e.target.value)}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"

                  >

                    <option value="">Selecciona un tiempo</option>

                    {tiempos.map((tiempo, idx) => (

                      <option key={idx} value={tiempo}>{tiempo}</option>

                    ))}

                    <option value="Otra opción">¿Otra opción?</option>

                  </select>

                  {formData.tiempoEstrategia2 === 'Otra opción' && (

                    <input

                      type="text"

                      value={formData.tiempoEstrategia2Otro}

                      onChange={(e) => handleInputChange('tiempoEstrategia2Otro', e.target.value)}

                      placeholder="Escribe tu opción aquí"

                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  )}

                </div>

{/* Indicadores */}

                <div>

                  <p className="text-gray-700 text-base leading-relaxed font-semibold mb-3">

                    ¿Qué indicadores de resultado usarás para medir la consecución de tu SEGUNDA estrategia de marketing digital seleccionada? (puedes elegir una o varias opciones)

                  </p>

                  <div className="space-y-2">

                    {indicadores.map((indicador, idx) => (

                      <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">

                        <input

                          type="checkbox"

                          checked={formData.indicadoresEstrategia2.includes(indicador)}

                          onChange={(e) => handleCheckboxChange('indicadoresEstrategia2', indicador, e.target.checked)}

                          className="mt-1"

                        />

                        <span className="text-sm text-gray-700">{indicador}</span>

                      </label>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          )}

<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">

            <p className="text-blue-900 font-semibold mb-2">RESULTADO ESPERADO</p>

            <p className="text-blue-800 text-sm">Tabla con las estrategias seleccionadas y sus detalles completos</p>

          </div>

<Button

            onClick={handleGenerar}

            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"

          >

            Generar Resultado

          </Button>

        </div>

{/* Resultado Esperado - Tabla y Diagrama de Flujo */}

        {mostrarResultado && formData.problema && formData.objetivoSmart && formData.estrategia1 && formData.estrategia2 && (

          <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Resultado Esperado</h3>

{/* Tabla de Estrategias */}

            <div className="mb-8 overflow-x-auto">

              <table className="w-full border-collapse border border-gray-300 text-sm">

                <thead>

                  <tr className="bg-blue-100">

                    <th className="border border-gray-300 p-3 text-left font-bold">Estrategia digital</th>

                    <th className="border border-gray-300 p-3 text-left font-bold">Cómo se aplicará</th>

                    <th className="border border-gray-300 p-3 text-left font-bold">Recursos necesarios</th>

                    <th className="border border-gray-300 p-3 text-left font-bold">Plazo de ejecución</th>

                    <th className="border border-gray-300 p-3 text-left font-bold">Indicadores de resultados</th>

                  </tr>

                </thead>

                <tbody>

                  {/* Fila Estrategia 1 */}

                  <tr className="hover:bg-gray-50">

                    <td className="border border-gray-300 p-3 font-semibold">{formData.estrategia1}</td>

                    <td className="border border-gray-300 p-3">{formData.objetivoSmart}</td>

                    <td className="border border-gray-300 p-3">

                      <ul className="list-disc list-inside space-y-1">

                        {formData.recursosEstrategia1.map((recurso, idx) => {

                          const recursoLimpio = recurso.split('(')[0].trim();

                          return <li key={idx} className="text-xs">{recursoLimpio}</li>;

                        })}

                      </ul>

                    </td>

                    <td className="border border-gray-300 p-3">{getTiempoFinal(formData.tiempoEstrategia1, formData.tiempoEstrategia1Otro)}</td>

                    <td className="border border-gray-300 p-3">

                      <ul className="list-disc list-inside space-y-1">

                        {formData.indicadoresEstrategia1.map((indicador, idx) => (

                          <li key={idx} className="text-xs">{indicador.split('(')[0].trim()}</li>

                        ))}

                      </ul>

                    </td>

                  </tr>

                  {/* Fila Estrategia 2 */}

                  <tr className="hover:bg-gray-50">

                    <td className="border border-gray-300 p-3 font-semibold">{formData.estrategia2}</td>

                    <td className="border border-gray-300 p-3">{formData.objetivoSmart}</td>

                    <td className="border border-gray-300 p-3">

                      <ul className="list-disc list-inside space-y-1">

                        {formData.recursosEstrategia2.map((recurso, idx) => {

                          const recursoLimpio = recurso.split('(')[0].trim();

                          return <li key={idx} className="text-xs">{recursoLimpio}</li>;

                        })}

                      </ul>

                    </td>

                    <td className="border border-gray-300 p-3">{getTiempoFinal(formData.tiempoEstrategia2, formData.tiempoEstrategia2Otro)}</td>

                    <td className="border border-gray-300 p-3">

                      <ul className="list-disc list-inside space-y-1">

                        {formData.indicadoresEstrategia2.map((indicador, idx) => (

                          <li key={idx} className="text-xs">{indicador.split('(')[0].trim()}</li>

                        ))}

                      </ul>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

{/* Diagrama de Flujo */}

            <div className="mt-8">

              <h4 className="text-lg font-semibold text-gray-900 mb-6">Diagrama de Flujo</h4>

              <div className="relative bg-gray-50 rounded-lg p-8 overflow-x-auto" style={{ minHeight: '500px' }}>

                {/* Grid layout para mejor organización */}

                <div className="grid grid-cols-3 gap-8 items-center" style={{ minHeight: '450px' }}>

                  {/* Problema - Columna 1 */}

                  <div className="flex items-center justify-center">

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl w-full max-w-[280px]">

                      <h4 className="text-white text-xl font-bold mb-3 text-center">Problema</h4>

                      <p className="text-white text-sm leading-relaxed">

                        {formData.problema.replace(/^[a-e]\)\s*/, '')}

                      </p>

                    </div>

                  </div>

{/* Objetivo SMART - Columna 2 */}

                  <div className="flex items-center justify-center relative">

                    {/* Flecha desde Problema */}

                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full z-0">

                      <svg width="60" height="4" viewBox="0 0 60 4" className="text-blue-600">

                        <line x1="0" y1="2" x2="60" y2="2" stroke="currentColor" strokeWidth="3" />

                        <polygon points="55,0 60,2 55,4" fill="currentColor" />

                      </svg>

                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl w-full max-w-[280px]">

                      <h4 className="text-white text-xl font-bold mb-3 text-center">Objetivo SMART</h4>

                      <p className="text-white text-sm leading-relaxed">

                        {formData.objetivoSmart}

                      </p>

                    </div>

                  </div>

{/* Estrategias - Columna 3 */}

                  <div className="flex flex-col gap-6 items-center justify-center">

                    {/* Estrategia 1 - Arriba */}

                    <div className="relative w-full max-w-[280px]">

                      {/* Flecha desde Objetivo SMART hacia Estrategia 1 */}

                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full z-0">

                        <svg width="80" height="80" viewBox="0 0 80 80" className="text-blue-600">

                          <path d="M 0 40 Q 20 10, 40 10 L 80 10" stroke="currentColor" strokeWidth="3" fill="none" />

                          <polygon points="75,5 80,10 75,15" fill="currentColor" />

                        </svg>

                      </div>

                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">

                        <h4 className="text-white text-xl font-bold mb-3 text-center">Estrategia 1</h4>

                        <p className="text-white text-sm leading-relaxed">

                          {formData.estrategia1}

                        </p>

                      </div>

                    </div>

{/* Estrategia 2 - Abajo */}

                    <div className="relative w-full max-w-[280px]">

                      {/* Flecha desde Objetivo SMART hacia Estrategia 2 */}

                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full z-0">

                        <svg width="80" height="80" viewBox="0 0 80 80" className="text-blue-600">

                          <path d="M 0 40 Q 20 70, 40 70 L 80 70" stroke="currentColor" strokeWidth="3" fill="none" />

                          <polygon points="75,65 80,70 75,75" fill="currentColor" />

                        </svg>

                      </div>

                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">

                        <h4 className="text-white text-xl font-bold mb-3 text-center">Estrategia 2</h4>

                        <p className="text-white text-sm leading-relaxed">

                          {formData.estrategia2}

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

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

// Paso 1: problema - cualquier opción = 1 punto

                  if (formData.problema) {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta1',
                      respuesta: formData.problema,
                      puntos: 1
                    });
                  }

// Paso 2: objetivo SMART - si diligencia = 1 punto

                  if (formData.objetivoSmart && formData.objetivoSmart.trim() !== '') {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta2',
                      respuesta: formData.objetivoSmart,
                      puntos: 1
                    });
                  }

// Paso 3: estrategias

                  const estrategiasSeleccionadas = [formData.estrategia1, formData.estrategia2].filter(e => e && e.trim() !== '');

                  if (estrategiasSeleccionadas.length === 2) {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta3',
                      respuesta: `${formData.estrategia1}, ${formData.estrategia2}`,
                      puntos: 2
                    });
                  } else if (estrategiasSeleccionadas.length === 1) {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta3',
                      respuesta: estrategiasSeleccionadas[0],
                      puntos: 1
                    });
                  }

// Recursos primera estrategia: si elige opción = 1 punto

                  if (formData.recursosEstrategia1 && formData.recursosEstrategia1.length > 0) {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta4',
                      respuesta: formData.recursosEstrategia1.join(', ').substring(0, 180),
                      puntos: 1
                    });
                  }

                  // Recursos segunda estrategia: si elige opción = 1 punto
                  if (formData.recursosEstrategia2 && formData.recursosEstrategia2.length > 0) {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta5',
                      respuesta: formData.recursosEstrategia2.join(', ').substring(0, 180),
                      puntos: 1
                    });
                  }

// Tiempo primera estrategia: si elige opción = 1 punto

                  if (formData.tiempoEstrategia1 && formData.tiempoEstrategia1.trim() !== '') {
                    const tiempoFinal = getTiempoFinal(formData.tiempoEstrategia1, formData.tiempoEstrategia1Otro);
                    respuestasConPuntos.push({
                      pregunta: 'pregunta6',
                      respuesta: tiempoFinal,
                      puntos: 1
                    });
                  }

// Tiempo segunda estrategia: si elige opción = 1 punto

                  if (formData.tiempoEstrategia2 && formData.tiempoEstrategia2.trim() !== '') {
                    const tiempoFinal = getTiempoFinal(formData.tiempoEstrategia2, formData.tiempoEstrategia2Otro);
                    respuestasConPuntos.push({
                      pregunta: 'pregunta7',
                      respuesta: tiempoFinal,
                      puntos: 1
                    });
                  }

// Indicadores primera estrategia: si elige opción = 1 punto

                  if (formData.indicadoresEstrategia1 && formData.indicadoresEstrategia1.length > 0) {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta8',
                      respuesta: formData.indicadoresEstrategia1.join(', ').substring(0, 180),
                      puntos: 1
                    });
                  }

// Indicadores segunda estrategia: si elige opción = 1 punto

                  if (formData.indicadoresEstrategia2 && formData.indicadoresEstrategia2.length > 0) {
                    respuestasConPuntos.push({
                      pregunta: 'pregunta9',
                      respuesta: formData.indicadoresEstrategia2.join(', ').substring(0, 180),
                      puntos: 1
                    });
                  }

// Registrar puntos del plan de negocio

                  if (respuestasConPuntos.length > 0) {

                    await fetch(`${API_BASE_URL}/registrar-puntos-plan-negocio`, {

                      method: 'POST',

                      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                      body: JSON.stringify({

                        modulo_nombre: 'Marketing Digital',

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

                      modulo_nombre: 'Marketing Digital',

                      paso_nombre: 'Plan de Negocio',

                      curso_nombre: 'Marketing Digital'

                    })

                  });

// Persistir respuestas del plan de negocio en el backend

                  await fetch(`${API_BASE_URL}/save-respuestas-plan`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify({

                      modulo_nombre: 'Marketing Digital',

                      respuestas: formData

                    })

                  });

localStorage.removeItem('plan_negocio_marketing_digital');

                  localStorage.setItem('marketing_digital_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  alert('¡Plan de Negocio completado! El siguiente módulo ha sido desbloqueado.');

                  navigate('/student/modulos');

                } catch (error) {

                  console.error('Error al registrar progreso:', error);

                  localStorage.removeItem('plan_negocio_marketing_digital');

                  localStorage.setItem('marketing_digital_plan_negocio_completado', 'true');

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

            navigate('/student/marketing-digital');

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

export default PlanNegocioMarketingDigitalPage;


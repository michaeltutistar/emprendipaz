import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const PlanNegocioDescubrimientoPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const isScrolledRef = useRef(false);

  const [formData, setFormData] = useState(() => {
    console.log("DEBUG: Plan Negocio Descubrimiento - Updated v2 (Relative URLs)");
    const saved = localStorage.getItem('plan_negocio_descubrimiento');

    return saved ? JSON.parse(saved) : {

      // Paso 1: Productos por etapa

      productoIntroduccion: '',

      productoCrecimiento: '',

      productoMadurez: '',

      productoDeclive: '',

      // Paso 2: Estrategias por etapa

      estrategiaIntroduccion: '',

      estrategiaCrecimiento: '',

      estrategiaMadurez: '',

      estrategiaDeclive: ''

    };

  });

  const [mostrarResultados, setmostrarResultados] = useState(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    localStorage.setItem('plan_negocio_descubrimiento', JSON.stringify(formData));

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

const handleGenerar = () => {

    // Validar que al menos haya un producto ingresado

    const productos = [

      formData.productoIntroduccion,

      formData.productoCrecimiento,

      formData.productoMadurez,

      formData.productoDeclive

    ].filter(p => p.trim() !== '');

if (productos.length === 0) {

      alert('Por favor ingresa al menos un producto en alguna etapa del ciclo de vida');

      return;

    }

// Validar que si hay producto, haya estrategia seleccionada

    const etapasConProducto = [];

    if (formData.productoIntroduccion.trim() !== '') etapasConProducto.push('introduccion');

    if (formData.productoCrecimiento.trim() !== '') etapasConProducto.push('crecimiento');

    if (formData.productoMadurez.trim() !== '') etapasConProducto.push('madurez');

    if (formData.productoDeclive.trim() !== '') etapasConProducto.push('declive');

const faltanEstrategias = etapasConProducto.some(etapa => {

      const estrategiaKey = `estrategia${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`;

      return !formData[estrategiaKey] || formData[estrategiaKey].trim() === '';

    });

if (faltanEstrategias) {

      alert('Por favor selecciona una estrategia para cada etapa donde ingresaste un producto');

      return;

    }

setmostrarResultados(true);

  };

const estrategias = {

    introduccion: ['Promoción fuerte', 'Pruebas gratuitas', 'Definición de mercado meta'],

    crecimiento: ['Diferenciar', 'Ampliar distribución', 'Mejorar la calidad del producto'],

    madurez: ['Versiones nuevas', 'Promociones', 'Extensión de marca'],

    declive: ['Liquidación', 'Segmentación selectiva', 'Retiro gradual']

  };

const etapas = [

    { key: 'introduccion', label: 'Introducción', productoKey: 'productoIntroduccion', estrategiaKey: 'estrategiaIntroduccion' },

    { key: 'crecimiento', label: 'Crecimiento', productoKey: 'productoCrecimiento', estrategiaKey: 'estrategiaCrecimiento' },

    { key: 'madurez', label: 'Madurez', productoKey: 'productoMadurez', estrategiaKey: 'estrategiaMadurez' },

    { key: 'declive', label: 'Declive', productoKey: 'productoDeclive', estrategiaKey: 'estrategiaDeclive' }

  ];

// Datos para las tablas

  const tabla1Data = etapas

    .filter(etapa => formData[etapa.productoKey] && formData[etapa.productoKey].trim() !== '')

    .map(etapa => ({

      fase: etapa.label,

      producto: formData[etapa.productoKey]

    }));

const tabla2Data = etapas

    .filter(etapa => formData[etapa.productoKey] && formData[etapa.productoKey].trim() !== '' &&

      formData[etapa.estrategiaKey] && formData[etapa.estrategiaKey].trim() !== '')

    .map(etapa => ({

      fase: etapa.label,

      estrategia: formData[etapa.estrategiaKey]

    }));

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

                      Descubrimiento de Oportunidades

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

              <button onClick={() => navigate('/student/descubrimiento-oportunidades')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Descubrimiento de Oportunidades

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

              <button onClick={() => navigate('/student/descubrimiento-oportunidades')} className="hover:text-white transition-colors">

                Descubrimiento de Oportunidades

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

              <span className="text-white text-sm font-medium">MÓDULO 2</span>

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

              Plan de Negocio - Descubrimiento de Oportunidades

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

              Descubrimiento de oportunidades: "Ciclo de vida de más productos"

            </h2>

<div className="prose max-w-none space-y-4">

              <p className="text-gray-700 text-base leading-relaxed">

                Ahora que ya has culminado exitosamente el desarrollo de las 3 unidades del modulo de descubrimiento de oportunidades, es momento de elaborar el aporte de esta modulo a tu plan de negocios.

              </p>

            </div>

          </div>

{/* Paso 1: Establece el ciclo de vida de tus productos */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Paso 1. Establece el ciclo de vida de tus productos</h3>

<div className="space-y-4 mb-6">

              <p className="text-gray-700 text-base leading-relaxed">

                Para la primera parte de tu ejercicio, deberás seleccionar 2 productos de tu emprendimiento, por ejemplo, rubor, pestañina, pan, camisetas, artesanías etc., y escribe en qué etapa de ciclo de vida del producto se encuentra cada uno.

              </p>

              <p className="text-gray-700 text-base leading-relaxed">

                A continuación, encontraras los espacios de cada etapa del ciclo de vida del producto, escribe en el espacio que corresponda el nombre de tu producto, por ejemplo, si uno de los productos seleccionados en tu emprendimiento es la pestañina y se encuentra en etapa de crecimiento, sobre ese cuadro de texto escribe la palabra pestañina.

              </p>

            </div>

<div className="space-y-6 mb-6">

              {etapas.map((etapa) => (

                <div key={etapa.key} className="border border-gray-300 rounded-lg p-4">

                  <label className="block text-sm font-semibold text-gray-900 mb-2">

                    Etapa de {etapa.label.toLowerCase()}

                  </label>

                  <p className="text-sm text-gray-600 mb-3">

                    Si uno de los dos productos escogidos pertenece a está etapa, escríbelo sobre está cuadro de texto.

                  </p>

                  <input

                    type="text"

                    value={formData[etapa.productoKey]}

                    onChange={(e) => handleInputChange(etapa.productoKey, e.target.value)}

                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"

                    placeholder={`Nombre del producto en etapa de ${etapa.label.toLowerCase()}`}

                  />

                </div>

              ))}

            </div>

          </div>

{/* Paso 2: Selección de la estrategia */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Paso 2. Selección de la estrategia</h3>

<div className="space-y-4 mb-6">

              <p className="text-gray-700 text-base leading-relaxed">

                Ahora que ya identificaste a qué etapa del ciclo de vida del producto, pertenecen los 2 productos escogidos, vamos a seleccionar una estrategia de marketing para esas etapas.

              </p>

            </div>

<div className="space-y-6 mb-6">

              {etapas.map((etapa) => {

                const tieneProducto = formData[etapa.productoKey] && formData[etapa.productoKey].trim() !== '';

                return (

                  <div key={etapa.key} className={`border border-gray-300 rounded-lg p-4 ${!tieneProducto ? 'opacity-50' : ''}`}>

                    <label className="block text-sm font-semibold text-gray-900 mb-2">

                      Etapa de {etapa.label.toLowerCase()}

                    </label>

                    {tieneProducto ? (

                      <>

                        <p className="text-sm text-gray-600 mb-3">

                          Si un (o los dos) producto de tu emprendimiento que escogiste en el paso 1 se encuentra en está etapa, ahora escoge una de las siguientes estrategias de la etapa de {etapa.label.toLowerCase()} que aplicarías para gestionarlo:

                        </p>

                        <select

                          value={formData[etapa.estrategiaKey]}

                          onChange={(e) => handleInputChange(etapa.estrategiaKey, e.target.value)}

                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"

                        >

                          <option value="">Selecciona una estrategia</option>

                          {estrategias[etapa.key].map((estrategia, idx) => (

                            <option key={idx} value={estrategia}>{estrategia}</option>

                          ))}

                        </select>

                      </>

                    ) : (

                      <p className="text-sm text-gray-500 italic">

                        Primero ingresa un producto en está etapa para poder seleccionar una estrategia.

                      </p>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">

            <p className="text-green-900 font-semibold mb-2">RESULTADO ESPERADO</p>

            <p className="text-green-800 text-sm">Tablas con el ciclo de vida de tus productos y las estrategias seleccionadas</p>

          </div>

<Button

            onClick={handleGenerar}

            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"

          >

            Generar Tablas

          </Button>

        </div>

{/* Tablas de Resultado Esperado */}

        {mostrarResultados && (

          <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8 space-y-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Resultado Esperado</h3>

{/* Tabla 1: Fase del ciclo de vida del producto | Productos de mi emprendimiento */}

            {tabla1Data.length > 0 && (

              <div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tabla 1: Ciclo de vida de más productos</h4>

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse border border-gray-300 text-sm">

                    <thead>

                      <tr className="bg-green-100">

                        <th className="border border-gray-300 p-3 text-left font-bold">Fase del ciclo de vida del producto</th>

                        <th className="border border-gray-300 p-3 text-left font-bold">Productos de mi emprendimiento</th>

                      </tr>

                    </thead>

                    <tbody>

                      {tabla1Data.map((row, index) => (

                        <tr key={index} className="hover:bg-gray-50">

                          <td className="border border-gray-300 p-3 font-semibold">{row.fase}</td>

                          <td className="border border-gray-300 p-3">{row.producto}</td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

{/* Tabla 2: Fase del ciclo de vida del producto | Estrategias */}

            {tabla2Data.length > 0 && (

              <div>

                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tabla 2: Estrategias seleccionadas</h4>

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse border border-gray-300 text-sm">

                    <thead>

                      <tr className="bg-green-100">

                        <th className="border border-gray-300 p-3 text-left font-bold">Fase del ciclo de vida del producto</th>

                        <th className="border border-gray-300 p-3 text-left font-bold">Estrategias</th>

                      </tr>

                    </thead>

                    <tbody>

                      {tabla2Data.map((row, index) => (

                        <tr key={index} className="hover:bg-gray-50">

                          <td className="border border-gray-300 p-3 font-semibold">{row.fase}</td>

                          <td className="border border-gray-300 p-3">{row.estrategia}</td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

          </div>

        )}

{/* Botón para finalizar plan de negocio */}

        {mostrarResultados && (

          <div className="mt-8 text-center">

            <Button

              onClick={async () => {

                try {

                  const token = getAuthToken();

// Preparar datos para persistencia

                  const dataToSave = {

                    modulo_nombre: 'Descubrimiento de Oportunidades',

                    respuestas: formData

                  };

// 1. Guardar respuestas de forma persistente en el backend

                  const saveResp = await fetch(`${API_BASE_URL}/save-respuestas-plan`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify(dataToSave)

                  });

if (!saveResp.ok) {

                    console.error('Error al guardar respuestas en el backend');

                  }

// 2. Preparar estrategias seleccionadas para el sistema de puntos

                  const estrategiasSeleccionadas = [];

                  etapas.forEach((etapa) => {

                    const estrategiaKey = etapa.estrategiaKey;

                    const estrategia = formData[estrategiaKey];

                    if (estrategia && estrategia.trim() !== '') {

                      estrategiasSeleccionadas.push({

                        etapa: etapa.key,

                        estrategia: estrategia

                      });

                    }

                  });

// Registrar puntos del plan de negocio (mantiene compatibilidad con sistema de puntos actual)

                  if (estrategiasSeleccionadas.length > 0) {

                    await fetch(`${API_BASE_URL}/registrar-puntos-plan-negocio`, {

                      method: 'POST',

                      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                      body: JSON.stringify({

                        modulo_nombre: 'Descubrimiento de Oportunidades',

                        estrategias: estrategiasSeleccionadas

                      })

                    });

                  }

// 3. Registrar progreso del modulo

                  await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify({

                      modulo_nombre: 'Descubrimiento de Oportunidades',

                      paso_nombre: 'Plan de Negocio',

                      curso_nombre: 'Descubrimiento de Oportunidades'

                    })

                  });

localStorage.removeItem('plan_negocio_descubrimiento'); // Limpiar localstorage ya que tenemás persistencia

                  localStorage.setItem('descubrimiento_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  alert('¡Plan de Negocio completado y guardado permanentemente! El siguiente modulo ha sido desbloqueado.');

                  navigate('/student/modulos');

                } catch (error) {

                  console.error('Error al registrar progreso:', error);

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

            navigate('/student/descubrimiento-oportunidades');

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

export default PlanNegocioDescubrimientoPage;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, Star, Activity, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Componente para mostrar estrellas

const Estrellas = ({ cantidad }) => {

  return (

    <div className="flex items-center gap-1 ml-2">

      {[1, 2, 3, 4].map((num) => (

        <Star

          key={num}

          className={`w-5 h-5 ${num <= cantidad ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}

        />

      ))}

    </div>

  );

};

// Mapeo de valores a estrellas para cada paso

const estrellasPorPaso = {

  paso1: { A: 4, B: 3, C: 2, D: 1 },

  paso2: { A: 1, B: 2, C: 4, D: 3 },

  paso3: { A: 4, B: 2, C: 1, D: 3 }

};

const DescubrimientoUnidad1TallerPage = () => {

  const navigate = useNavigate();

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Descubrimiento de Oportunidades', 'Unidad 1: Taller');

  const [formData, setFormData] = useState({

    paso1: '',

    paso2: '',

    paso3: ''

  });

  const [mostrarReflexion, setmostrarReflexion] = useState(false);

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

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 100);

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

// Sincronizar mostrarReflexion con pasoCompletado del backend

  useEffect(() => {

    if (pasoCompletado) {

      setmostrarReflexion(true);

    }

  }, [pasoCompletado]);

const handleSubmit = async (e) => {

    e.preventDefault();

    if (formData.paso1 && formData.paso2 && formData.paso3) {

      setmostrarReflexion(true);

    }

  };

const handleFinalizar = async () => {

    if (!mostrarReflexion) return;

    // Registrar progreso en el backend

    await registrarProgreso();

    navigate('/student/descubrimiento-oportunidades/unidad1/cierre');

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

                      Descubrimiento de Oportunidades

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

                Módulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/descubrimiento-oportunidades')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Descubrimiento de Oportunidades

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Diagnóstico Estratégico

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

              MÓDULO: Descubrimiento de Oportunidades

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

              Diagnóstico Estratégico

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

              <p className="text-[10px] text-gray-500">Evaluación</p>

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

            Paso 3: Taller

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Hemos hablado de cómo diagnosticamos la estrategia de nuestro emprendimiento. Ahora, vamos a aplicarlos de forma práctica.

            </p>

          </div>

        </div>

<motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100"

        >

          <div className="mb-8">

            <div className="flex items-center gap-3 mb-4">

              <Activity className="w-6 h-6 text-[#006837]" />

              <h3 

                className="text-[#006837]"

                style={{ 

                  fontFamily: 'var(--font-heading)',

                  fontSize: '1.5rem',

                  fontWeight: 600,

                }}

              >

                Mi estrategia adecuada

              </h3>

            </div>

            <p className="text-gray-700 leading-relaxed mb-4">

              Hemos hablado de cómo diagnosticamos la estrategia de nuestro emprendimiento y cómo analizamos su contexto tanto micro como macro. Ahora, vamos a aplicarlos de forma práctica a nuestro emprendimiento o a uno que conozcamos bien. No necesitamos ser expertos, solo observar y reflexionar.

            </p>

          </div>

<form onSubmit={handleSubmit} className="space-y-8">

            {/* Paso 1 */}

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">

              <h3 className="text-lg font-bold text-gray-900 mb-3">Paso 1: ¿Entiendo cuáles son los factores críticos de mi bien o servicio para que sobreviva en un ambiente de alta competitividad?</h3>

              <p className="text-gray-700 mb-4 text-base">

                <strong>Instrucción:</strong> Regresemos a tu idea de negocio y pregúntate si tienes barreras de entrada fáciles o difíciles para lograr que tu producto sea exitoso. ¿Tu producto cuenta con un diferencial VS el resto? Con base en tus hallazgos selecciona la calificación que más se ajuste a tu ejercicio:

              </p>

              <div className="space-y-3">

                {[

                  { value: 'A', text: 'Mi producto es innovador y tiene barreras altas de entrada, lo que lo hace único en el mercado al no tener una competencia definida.' },

                  { value: 'B', text: 'Mi producto es poco innovador y tiene barreras bajas de entrada, lo que lo hace poco atractivo en el mercado al no tener mucha competencia.' },

                  { value: 'C', text: 'Mi producto es innovador y tiene barreras bajas de entrada, lo que lo hace reemplazable en el mercado al tener bienes sustitutos.' },

                  { value: 'D', text: 'Mi producto es único y será éxitoso.' }

                ].map((opcion) => (

                  <label

                    key={opcion.value}

                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${

                      formData.paso1 === opcion.value

                        ? 'border-blue-600 bg-blue-100'

                        : 'border-gray-200 hover:border-gray-300'

                    }`}

                  >

                    <input

                      type="radio"

                      name="paso1"

                      value={opcion.value}

                      checked={formData.paso1 === opcion.value}

                      onChange={(e) => setFormData({...formData, paso1: e.target.value})}

                      className="mt-1 mr-3"

                    />

                    <span className="text-gray-700 text-base">{opcion.text}</span>

                  </label>

                ))}

              </div>

            </div>

{/* Paso 2 */}

            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">

              <h3 className="text-lg font-bold text-gray-900 mb-3">Paso 2. Radiografía de mi contexto macro:</h3>

              <p className="text-gray-700 mb-4 text-base">

                <strong>Instrucción:</strong> Tu Negocio cuenta con un análisis PESTEL que evalúa cuáles de las siguientes opciones:

              </p>

              <div className="space-y-3">

                {[

                  { value: 'A', text: 'Analiza los aspectos del macroentorno, donde se destacan aspectos políticos, ecológicos, deportivos y religiosos.' },

                  { value: 'B', text: 'Analiza los aspectos del macroentorno, donde se destacan aspectos políticos, sexuales, deportivos y religiosos.' },

                  { value: 'C', text: 'Analiza los aspectos del macroentorno, donde se destacan aspectos políticos, económicos, sociales, tecnológicos, ecológicos y legales.' },

                  { value: 'D', text: 'Analiza los aspectos del macroentorno, donde se destacan aspectos políticos, ambientales, ecológicos, deportivos y demográficos.' }

                ].map((opcion) => (

                  <label

                    key={opcion.value}

                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${

                      formData.paso2 === opcion.value

                        ? 'border-green-600 bg-green-100'

                        : 'border-gray-200 hover:border-gray-300'

                    }`}

                  >

                    <input

                      type="radio"

                      name="paso2"

                      value={opcion.value}

                      checked={formData.paso2 === opcion.value}

                      onChange={(e) => setFormData({...formData, paso2: e.target.value})}

                      className="mt-1 mr-3"

                    />

                    <span className="text-gray-700 text-base">{opcion.text}</span>

                  </label>

                ))}

              </div>

            </div>

{/* Paso 3 */}

            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg">

              <h3 className="text-lg font-bold text-gray-900 mb-3">Paso 3: ¿Cuál es mi ventaja competitiva sobre la competencia directa de mi emprendimiento?</h3>

              <p className="text-gray-700 mb-4 text-base">

                <strong>Instrucción:</strong> Entiende tu emprendimiento como referente y selecciona la calificación que más se ajuste a tu ejercicio:

              </p>

              <div className="space-y-3">

                {[

                  { value: 'A', text: 'Mi emprendimiento puede tener competencia, pero tiene elementos que marcan un valor agregado sobre el resto.' },

                  { value: 'B', text: 'Mi emprendimiento NO tiene competencia porque es único en el mercado y el éxito está asegurado.' },

                  { value: 'C', text: 'Mi emprendimiento tiene competencia alta porque es fácil de replicar y poco escalable en el mercado.' },

                  { value: 'D', text: 'Mi emprendimiento tiene competencia baja porque es difícil de replicar y muy escalable en el mercado.' }

                ].map((opcion) => (

                  <label

                    key={opcion.value}

                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${

                      formData.paso3 === opcion.value

                        ? 'border-purple-600 bg-purple-100'

                        : 'border-gray-200 hover:border-gray-300'

                    }`}

                  >

                    <input

                      type="radio"

                      name="paso3"

                      value={opcion.value}

                      checked={formData.paso3 === opcion.value}

                      onChange={(e) => setFormData({...formData, paso3: e.target.value})}

                      className="mt-1 mr-3"

                    />

                    <span className="text-gray-700 text-base">{opcion.text}</span>

                  </label>

                ))}

              </div>

            </div>

{!mostrarReflexion && (

              <div className="flex justify-end">

                <Button

                  type="submit"

                  disabled={!formData.paso1 || !formData.paso2 || !formData.paso3}

                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"

                >

                  Ver Reflexión y Recomendaciones

                  <ChevronRight className="w-5 h-5" />

                </Button>

              </div>

            )}

{mostrarReflexion && (

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg space-y-4">

                <h3 className="text-lg font-bold text-gray-900">Reflexión final y recomendaciones</h3>

                <p className="text-gray-700 text-base leading-relaxed">

                  Recuerda que, con base en los resultados de tu actividad, se deben adoptar algunas acciones correctivas, algunas serán inmediatas y otras a mediano o incluso a largo plazo.

                </p>

                <p className="text-gray-700 text-base leading-relaxed">

                  Para la actividad práctica que acabamás de realizar algunas de las posibles acciones inmediatas que se podrían adoptar con base en la calificación de cada paso podrían incluir:

                </p>

<div className="overflow-x-auto mt-4">

                  <table className="min-w-full border border-gray-300 rounded-lg text-sm">

                    <thead className="bg-gray-900 text-white">

                      <tr>

                        <th className="px-4 py-3 text-left">PASO</th>

                        <th className="px-4 py-3 text-left">TU CALIFICACIÓN</th>

                        <th className="px-4 py-3 text-left">POSIBLES ACCIONES DE MEJORA</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-200">

                      {/* Paso 1 */}

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Entiendo cuáles son los factores críticos de mi bien o servicio para que sobreviva</td>

                        <td className="px-4 py-3">

                          {formData.paso1 ? (

                            <div className="flex items-center gap-2">

                              <Estrellas cantidad={estrellasPorPaso.paso1[formData.paso1]} />

                              <span className="text-sm text-gray-600">({estrellasPorPaso.paso1[formData.paso1]} estrellas)</span>

                            </div>

                          ) : (

                            <span className="text-gray-400">No seleccionado</span>

                          )}

                        </td>

                        <td className="px-4 py-3">

                          {formData.paso1 ? (

                            estrellasPorPaso.paso1[formData.paso1] === 4 ? (

                              'Un producto altamente ganador.'

                            ) : estrellasPorPaso.paso1[formData.paso1] === 3 || estrellasPorPaso.paso1[formData.paso1] === 2 ? (

                              'Considerar un producto que mejore sus diferenciales.'

                            ) : (

                              'Evaluar en cuál o cuáles mercados nuestro producto generará un impacto positivo. NO existe el producto perfecto.'

                            )

                          ) : (

                            '-'

                          )}

                        </td>

                      </tr>

                      {/* Paso 2 */}

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Radiografía de mi contexto macro:</td>

                        <td className="px-4 py-3">

                          {formData.paso2 ? (

                            <div className="flex items-center gap-2">

                              <Estrellas cantidad={estrellasPorPaso.paso2[formData.paso2]} />

                              <span className="text-sm text-gray-600">({estrellasPorPaso.paso2[formData.paso2]} estrellas)</span>

                            </div>

                          ) : (

                            <span className="text-gray-400">No seleccionado</span>

                          )}

                        </td>

                        <td className="px-4 py-3">

                          {formData.paso2 ? (

                            estrellasPorPaso.paso2[formData.paso2] === 4 ? (

                              'Si Tu idea de negocio cuenta con está análisis probablemente tendrás más probabilidades de anticiparte a las amenazas del mercado.'

                            ) : estrellasPorPaso.paso2[formData.paso2] === 3 || estrellasPorPaso.paso2[formData.paso2] === 2 ? (

                              'Debes mejorar el análisis macro'

                            ) : (

                              'Entender realmente el contexto de tu negocio.'

                            )

                          ) : (

                            '-'

                          )}

                        </td>

                      </tr>

                      {/* Paso 3 */}

                      <tr>

                        <td className="px-4 py-3 font-semibold text-gray-900">Cuál es mi ventaja competitiva sobre la competencia directa de mi emprendimiento</td>

                        <td className="px-4 py-3">

                          {formData.paso3 ? (

                            <div className="flex items-center gap-2">

                              <Estrellas cantidad={estrellasPorPaso.paso3[formData.paso3]} />

                              <span className="text-sm text-gray-600">({estrellasPorPaso.paso3[formData.paso3]} estrellas)</span>

                            </div>

                          ) : (

                            <span className="text-gray-400">No seleccionado</span>

                          )}

                        </td>

                        <td className="px-4 py-3">

                          {formData.paso3 ? (

                            estrellasPorPaso.paso3[formData.paso3] === 4 ? (

                              'Tu negocio tiene ventajas que lo hará resaltar en el mercado'

                            ) : estrellasPorPaso.paso3[formData.paso3] === 3 || estrellasPorPaso.paso3[formData.paso3] === 2 ? (

                              'Definir los criterios competitivos de tu negocio para encontrar un lugar en el mercado'

                            ) : (

                              'Revaluar cuál será el diferencial de tu negocio'

                            )

                          ) : (

                            '-'

                          )}

                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">

                  <h4 className="font-bold text-gray-900 mb-2">Reflexión</h4>

                  <p className="text-gray-700 text-base leading-relaxed">

                    Utiliza los conocimientos que has adquirido en está unidad para elaborar el diagnóstico estratégico de manera más detallada en el contexto de tu emprendimiento. Deberías considerar todos elementos internos como externos que afecten el negocio para descubrir cómo está afecta o potencia tu crecimiento.

                  </p>

                  <p className="text-gray-700 text-base leading-relaxed mt-2">

                    En la unidad 2 y 3 profundizaremás en la definición de diamante de Porter y ciclo de vida de producto.

                  </p>

                </div>

<div className="flex justify-end mt-6">

                  <Button

                    onClick={handleFinalizar}

                    className="bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2"

                  >

                    Siguiente Paso

                    <ChevronRight className="w-5 h-5" />

                  </Button>

                </div>

              </div>

            )}

          </form>

        </motion.div>

      </div>

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/descubrimiento-oportunidades/unidad1/desarrollo');

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

export default DescubrimientoUnidad1TallerPage;


import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';

import { useNavigate } from 'react-router-dom';

import Footer from '../Footer';

import { 

  ArrowLeft,

  Lock,

  CheckCircle,

  BookOpen,

  Library,

  Search,

  ChevronDown,

  Copy,

  Home,

  ChevronRight,

  Play

} from 'lucide-react';

import { motion } from 'framer-motion';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const PresentaciónPage = () => {

  const navigate = useNavigate();

  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const [bibliographyOpen, setBibliographyOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [copiedIndex, setCopiedIndex] = useState(null);

  const [videoStarted, setVideoStarted] = useState(false);

  const [videoEnded, setVideoEnded] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const isScrolledRef = useRef(false);

// Datos: Glosario (orden alfabético)

  const glossary = [

    { term: 'App', def: 'Aplicación de software desarrollada para operar en dispositivos móviles, como smartphones y tabletas.' },

    { term: 'Competidor', def: 'Participación de varios vendedores o empresas en el mercado, que pretenden que los clientes seleccionen su producto mediante el desarrollo de diferentes estrategias comerciales.' },

    { term: 'Diagnóstico', def: 'En el contexto del marketing digital, es un conjunto de acciones y herramientas utilizadas para descubrir cómo una empresa es percibida en el mercado. A partir de este reconocimiento, se logran identificar aspectos a mejorar.' },

    { term: 'Estrategia', def: 'Proceso planificado que busca alcanzar un objetivo concreto.' },

    { term: 'Fidelización', def: 'Proceso que tiene como propósito que los clientes permanezcan fieles a la marca.' },

    { term: 'Influencer', def: 'Persona con capacidad de influir en la conducta o en las decisiones de un grupo específico. Generalmente a través del uso de las redes sociales.' },

    { term: 'Interacciones', def: 'Participación activa de la audiencia meta con el contenido, a través de likes, comentarios, compartidos y visualizaciones.' },

    { term: 'Marketing digital', def: 'Utilización de tecnologías digitales para mejorar la relación con clientes y ofrecer valor en canales digitales.' },

    { term: 'Navegador web', def: 'Programa que permite buscar y visualizar la información que contiene una página web.' },

    { term: 'Plan de marketing digital', def: 'Documento estratégico que define cómo una empresa utilizará canales digitales para alcanzar sus objetivos de marketing.' },

    { term: 'Rentabilidad', def: 'Relación entre el beneficio obtenido y la inversión realizada para conseguirlo.' },

    { term: 'Segmentación de mercado', def: 'Proceso de dividir un mercado total en grupos con características o intereses en común.' },

    { term: 'SEM', def: 'Estrategia que utiliza publicidad pagada en motores de búsqueda para aumentar visibilidad y conversiones.' },

    { term: 'SEO', def: 'Estrategia para posicionar una web en buscadores de forma orgánica mediante uso adecuado de palabras clave.' },

    { term: 'Visibilidad de marca', def: 'Fuerza de la presencia de una marca en canales digitales; se mide con diversas métricas.' },

  ].sort((a, b) => a.term.localeCompare(b.term, 'es'));

// Datos: Bibliografía

  const bibliography = [

    { title: '¿Qué es una app y para qué se utiliza?', source: 'GoDaddy', year: 2024, url: 'https://www.godaddy.com/resources/es/tecnologia/que-es-una-app-y-para-que-se-utiliza' },

    { title: 'Qué es el SEO en el marketing', source: 'EBAC', year: 2023, url: 'https://ebac.mx/blog/que-es-el-seo' },

    { title: 'Definición de competencia en marketing', source: 'Federación Española de Asociaciones de Enólogos', year: 2023, url: 'https://www.federacionenologos.es/definicion-de-competencia-en-marketing-segun-varios-autores/' },

    { title: '¿Cómo medir y aumentar la visibilidad de la marca? Guía 2025', source: 'Brand24', year: 2024, url: 'https://brand24.com/blog/es/visibilidad-de-marca/' },

    { title: 'Marketing 4.0: Moving from traditional to digital', source: 'Wiley (Kotler et al.)', year: 2017, url: 'https://www.wiley.com/en-us/Marketing+4+0%3A+Moving+from+Traditional+to+Digital-p-9781119341208' },

    { title: 'Plan de marketing digital: guía ideal para empresas', source: 'HubSpot', year: 2025, url: 'https://blog.hubspot.es/marketing/como-crear-plan-marketing-digital' },

    { title: 'Diagnóstico de marketing digital: ¿Qué es y cómo hacer uno?', source: 'RD Station', year: 2020, url: 'https://www.rdstation.com/blog/es/diagnostico-marketing-digital/' },

    { title: 'Estrategia – Diccionario RAE', source: 'RAE', year: 0, url: 'https://dle.rae.es/estrategia' },

    { title: '¿Qué es la rentabilidad? Cómo calcularla y tipos', source: 'Economipedia', year: 2025, url: 'https://economipedia.com/definiciones/rentabilidad.html' },

    { title: 'Interacción – Diccionario de marketing digital', source: 'Starrt', year: 0, url: 'https://starrt.digital/diccionario-marketing-digital/interaccion' },

    { title: 'Historia y evolución de los navegadores web', source: 'Telefónica', year: 2023, url: 'https://www.telefonica.com/es/sala-comunicacion/blog/historia-evolucion-navegadores-web/' },

    { title: '¿Qué es SEM en marketing y publicidad?', source: 'UNIR', year: 2024, url: 'https://www.unir.net/revista/marketing-comunicacion/sem-que-es/' },

    { title: 'Marketing estratégico: Segmentación de mercado', source: 'Universidad Andrés Bello', year: 2024, url: 'https://uddo.unab.cl/archivos/2024_2%20(posgrado)/MBAES607/recursos/mbaes607_u3_segmentacion.pdf' },

    { title: 'El concepto de influencer como herramienta de marketing', source: 'Universidad de La Rioja', year: 2019, url: 'https://investigacion.unirioja.es/documentos/5eda31d1299952715635a813/f/5eda31d1299952715635a812.pdf' },

  ];

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

// Sincronizar el ref con el estado

  useEffect(() => {

    isScrolledRef.current = isScrolled;

  }, [isScrolled]);

// Detectar scroll para animar el header - Optimizado para evitar parpadeo

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

const filteredGlossary = glossary.filter(({ term, def }) => {

    const q = searchTerm.trim().toLowerCase();

    if (!q) return true;

    return term.toLowerCase().includes(q) || def.toLowerCase().includes(q);

  });

const copyCitation = async (text, index) => {

    try {

      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => setCopiedIndex(null), 1500);

    } catch (_) {}

  };

// Función para manejar el completado del paso

  const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          ...(token ? { 'Authorization': `Bearer ${token}` } : {})

        },

        body: JSON.stringify({

          modulo_nombre: 'Marketing Digital',

          paso_nombre: 'Presentación',

          curso_nombre: 'Marketing Digital'

        })

      });

if (response.ok) {

        alert('¡Paso completado! Tu progreso ha sido registrado.');

        navigate('/student/marketing-digital');

      } else {

        alert('Paso completado, pero hubo un problema al registrar el progreso.');

        navigate('/student/marketing-digital');

      }

    } catch (error) {

      console.error('Error al registrar progreso:', error);

      alert('¡Paso completado!');

      navigate('/student/marketing-digital');

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

                  </div>

                </motion.div>

              )}

<div className="flex justify-end">

                <motion.button

                  onClick={() => navigate('/student/perfil')}

                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"

                  whileHover={{ scale: 1.05 }}

                  whileTap={{ scale: 0.95 }}

                >

                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">

                    <span className="text-white font-semibold text-sm">U</span>

                  </div>

                </motion.button>

              </div>

            </div>

          </div>

        </motion.header>

      </div>

{/* Breadcrumb - Barra estática debajo del header cuando hay scroll */}

      {isScrolled && (

        <motion.div 

          className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

          initial={{ opacity: 0, y: -10 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.3 }}

        >

          <div className="max-w-7xl mx-auto px-8 py-2">

            <div className="flex items-center gap-1.5 text-gray-600 text-xs">

              <button 

                onClick={() => navigate('/student/dashboard')} 

                className="hover:text-[#006837] transition-colors flex items-center gap-1"

              >

                <Home className="w-3 h-3" />

                Inicio

              </button>

              <ChevronRight className="w-2.5 h-2.5" />

              <button 

                onClick={() => navigate('/student/marketing-digital')} 

                className="hover:text-[#006837] transition-colors"

              >

                Marketing Digital

              </button>

              <ChevronRight className="w-2.5 h-2.5" />

              <span className="text-[#006837] font-semibold">Presentación</span>

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

              <button onClick={() => navigate('/student/marketing-digital')} className="hover:text-white transition-colors">

                Marketing Digital

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Presentación</span>

            </motion.div>

          )}

{/* Title */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

            className="flex items-start gap-6"

          >

            <h1 

              className="text-white flex-shrink-0"

              style={{ 

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Video de Presentación

            </h1>

{/* Instrucciones Paso 1 - Al lado del título */}

            <div className="bg-white/10 backdrop-blur-sm border-l-3 border-white/50 rounded-lg p-2 flex-1 max-w-md">

              <p className="text-white/90 leading-snug text-xs">

                <strong>📌 Instrucciones:</strong> Debes ver el video completo para activar el siguiente paso. 

                Solo podrás aumentar la velocidad de reproducción.

              </p>

            </div>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z" fill="white"/>

          </svg>

        </div>

      </section>

{/* Main Content */}

      <div className="max-w-7xl mx-auto px-8 py-6">

        {/* Título arriba */}

        <h2 

          className="text-[#006837] mb-6"

          style={{ 

            fontFamily: 'var(--font-heading)',

            fontSize: '2.25rem',

            fontWeight: 700,

          }}

        >

          Paso 1: Presentación

        </h2>

{/* Dos párrafos en columnas debajo del título */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          <p className="text-gray-700 leading-relaxed">

            Conoce los conceptos fundamentales del Marketing Digital a través de este video de presentación.

          </p>

          <p className="text-gray-700 leading-relaxed">

            Este contenido te ayudará a comprender los objetivos y conceptos clave que aprenderás en este módulo.

          </p>

        </div>

{/* Video - Ancho completo */}

        <div className="mt-8">

          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-xl">

            {!videoStarted ? (

              <div className="absolute inset-0 flex items-center justify-center">

                <motion.button

                  onClick={() => setVideoStarted(true)}

                  whileHover={{ scale: 1.1 }}

                  whileTap={{ scale: 0.95 }}

                  className="bg-[#AA27B9] hover:bg-[#9d24ab] transition-colors rounded-full p-8 shadow-2xl"

                >

                  <Play className="w-16 h-16 text-white fill-white" />

                </motion.button>

              </div>

            ) : (

              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">

                <p className="text-white">Video en reproducción...</p>

              </div>

            )}

          </div>

        </div>

{/* Recursos: Glosario y Bibliografía */}

        <div className="mt-12 space-y-6">

          {/* Glosario */}

          <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">

            <button

              onClick={() => setGlossaryOpen((v) => !v)}

              className="w-full flex items-center justify-between px-6 py-4"

            >

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white flex items-center justify-center">

                  <BookOpen className="w-5 h-5" />

                </div>

                <div className="text-left">

                  <div className="text-lg font-semibold text-gray-900">Glosario</div>

                  <div className="text-sm text-gray-500">{glossary.length} términos</div>

                </div>

              </div>

              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${glossaryOpen ? 'rotate-180' : ''}`} />

            </button>

{glossaryOpen && (

              <div className="px-6 pb-6">

                {/* Buscador */}

                <div className="relative mb-4">

                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />

                  <input

                    type="text"

                    value={searchTerm}

                    onChange={(e) => setSearchTerm(e.target.value)}

                    placeholder="Buscar término o definición..."

                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#59D22E]"

                  />

                </div>

                {/* Lista de términos */}

                <ul className="divide-y divide-gray-100">

                  {filteredGlossary.map(({ term, def }) => (

                    <li key={term} className="py-3">

                      <details className="group">

                        <summary className="cursor-pointer list-none flex items-center justify-between">

                          <span className="font-semibold text-gray-800 group-open:text-[#006837]">{term}</span>

                          <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />

                        </summary>

                        <p className="mt-2 text-gray-600 leading-relaxed">{def}</p>

                      </details>

                    </li>

                  ))}

                </ul>

              </div>

            )}

          </div>

{/* Bibliografía */}

          <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">

            <button

              onClick={() => setBibliographyOpen((v) => !v)}

              className="w-full flex items-center justify-between px-6 py-4"

            >

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] text-white flex items-center justify-center">

                  <Library className="w-5 h-5" />

                </div>

                <div className="text-left">

                  <div className="text-lg font-semibold text-gray-900">Bibliografía</div>

                  <div className="text-sm text-gray-500">{bibliography.length} fuentes</div>

                </div>

              </div>

              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${bibliographyOpen ? 'rotate-180' : ''}`} />

            </button>

{bibliographyOpen && (

              <div className="px-6 pb-6">

                <ul className="space-y-3">

                  {bibliography.map((item, idx) => {

                    const citation = `${item.title}. ${itemásource}${item.year ? `, ${item.year}` : ''}${item.url ? ` — ${item.url}` : ''}`;

                    return (

                      <li key={idx} className="p-4 rounded-xl border border-gray-100 bg-white flex items-start justify-between gap-4">

                        <div>

                          <div className="font-medium text-gray-800">{item.title}</div>

                          <div className="text-sm text-gray-500">{itemásource}{item.year ? ` · ${item.year}` : ''}</div>

                          {item.url && (

                            <a

                              className="text-sm text-[#006837] hover:underline"

                              href={item.url}

                              target="_blank"

                              rel="noopener noreferrer"

                            >

                              Ver recurso

                            </a>

                          )}

                        </div>

                        <button

                          onClick={() => copyCitation(citation, idx)}

                          className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"

                        >

                          <Copy className="w-4 h-4" /> {copiedIndex === idx ? 'Copiado' : 'Copiar cita'}

                        </button>

                      </li>

                    );

                  })}

                </ul>

              </div>

            )}

          </div>

        </div>

{/* Botones de Navegación */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">

          <Button

            onClick={() => navigate('/student/marketing-digital')}

            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"

          >

            VOLVER A LA PÁGINA PRINCIPAL

          </Button>

          <Button

            onClick={handleCompleteStep}

            className="bg-gradient-to-r from-[#59D22E] to-[#A5E811] hover:from-[#A5E811] hover:to-[#59D22E] text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"

          >

            <CheckCircle className="w-5 h-5 mr-2" />

            COMPLETADO

          </Button>

        </div>

      </div>

{/* Back Button - Bottom Left */}

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

          className="bg-white hover:bg-gray-100 text-[#006837] border-2 border-[#006837] rounded-full px-6 py-3 flex items-center gap-2 shadow-2xl font-bold transition-all transform hover:scale-105"

        >

          <ArrowLeft className="w-5 h-5" />

          Atrás

        </Button>

      </motion.div>

{/* Footer */}

      <Footer />

    </div>

  );

};

export default PresentaciónPage;


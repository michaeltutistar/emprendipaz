import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, Video, BookOpen, ClipboardList, ExternalLink, Sparkles, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const definiciones = [

  {

    concepto: 'Misión',

    definicion: 'Describe la razón de ser actual de la organización: qué hace, para quién y con qué valor.',

    caracteristicas: ['Concreta y vigente', 'Se enfoca en el presente', 'Responde a ¿Quiénes somos y qué hacemos?']

  },

  {

    concepto: 'Visión',

    definicion: 'Expresa la imagen del futuro deseado: hacia dónde se dirige la organización a largo plazo.',

    caracteristicas: ['Inspiradora y aspiracional', 'Motivadora para el equipo', 'Responde a ¿A dónde queremos llegar?']

  },

  {

    concepto: 'Estrategias',

    definicion: 'Planes de acción de alto nivel que conectan la misión con la visión considerando recursos y entorno.',
    caracteristicas: ['Guían decisiones concretas', 'Se alinean con misión y visión', 'Detallan caminos para alcanzar objetivos']

  }

];

const casos = [

  {

    nombre: 'Empresa de servicios de salud',

    mision: 'Brindar atención médica integral y humana, accesible para toda la comunidad, garantizando calidad y seguridad en cada servicio.',

    vision: 'Ser en 2030 el referente regional en salud preventiva e innovación en bienestar comunitario.',

    estrategia: 'Desarrollar programas de telemedicina, fortalecer alianzas con aseguradoras y capacitar continuamente al personal médico.'

  },

  {

    nombre: 'Emprendimiento gastronómico',

    mision: 'Ofrecer comida artesanal saludable, preparada con ingredientes locales y frescos, para quienes buscan alimentación consciente.',

    vision: 'Convertirnos en la marca líder de comida saludable rápida en el país en los próximos 7 años.',

    estrategia: 'Crear menús diferenciados por regiones, usar redes sociales para fidelizar clientes y establecer franquicias.'

  }

];

const recursos = [

  {

    label: 'Plan estratégico de la empresa y elección de su estrategia',

    url: 'https://www.youtube.com/watch?reload=9&app=desktop&v=R_eNtRGzvcw'

  },

  {

    label: '¿Cómo redactar la visión y misión de tu empresa?',

    url: 'https://www.youtube.com/watch?v=7SZWW-KB-U8'

  }

];

const Unidad2DesarrolloPage = () => {

  const navigate = useNavigate();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

useEffect(() => {

    window.scrollTo(0, 0);

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

// Habilitar "Siguiente Paso" cuando el viewport alcanza la parte superior del footer

  useEffect(() => {

    const handleWindowScroll = () => {

      const windowHeight = window.innerHeight;

      const documentHeight = document.documentElement.scrollHeight;

      const scrollTop = window.scrollY;

const footerEl = document.querySelector('footer');

      const footerTop = footerEl ? footerEl.getBoundingClientRect().top + window.scrollY : documentHeight - 10;

if (scrollTop + windowHeight >= footerTop) {

        setHasScrolledToBottom(true);

      }

    };

window.addEventListener('scroll', handleWindowScroll, { passive: true });

    handleWindowScroll();

    return () => window.removeEventListener('scroll', handleWindowScroll);

  }, []);

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing y Comercialización',

          paso_nombre: 'Unidad 2: Fundamentación',

          curso_nombre: 'Marketing y Comercialización'

        })

      });

      navigate('/student/unidad2/taller');

    } catch (error) {

      navigate('/student/unidad2/taller');

    }

  };

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* HEADER ANIMADO */}

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

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[12%] w-11 h-11"

            animate={{

              x: [0, 137],

              y: [80, -33],

              opacity: [0, 0.65, 0.65, 0],

            }}

            transition={{

              duration: 4.2,

              repeat: Infinity,

              ease: "linear",

              delay: 0.3,

              times: [0, 0.1, 0.85, 1],

            }}

          />

{/* CAPA FRONTAL: Contenido estático y UI nítido */}

          <div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              {/* Logo */}

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

{/* Título centrado al hacer scroll */}

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

                      Unidad 2 · Fundamentación

                    </p>

                  </div>

                </motion.div>

              )}

{/* Usuario */}

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

              onClick={() => navigate('/student/presentacion-modulo')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Marketing y Comercialización

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Bases del direccionamiento estratégico

            </span>

          </div>

        </div>

      </motion.div>

{/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] pt-8 pb-16 px-8">

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

          {/* Breadcrumás visibles solo sin scroll */}

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

                Módulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/presentacion-modulo')}

                className="hover:text-white transition-colors"

              >

                Marketing y Comercialización

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 2 · Fundamentación</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Marketing y Comercialización

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

              Bases del direccionamiento estratégico · Fundamentación

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Profundiza en la misión, visión y estrategias de las organizaciones y cómo utilizarlas para tomar decisiones estratégicas

              de marketing y comercialización en tu emprendimiento.

            </p>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path

              d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z"

              fill="white"

            />

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

              animate={{ width: '50%' }}

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

{/* Step 2 - Active */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: "spring", stiffness: 200 }}

                className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                2

              </motion.div>

              <p className="text-[10px] text-[#AA27B9] font-bold">Fundamentación</p>

            </div>

{/* Step 3 */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-400 mb-0.5">Paso</p>

              <div className="bg-gray-200 text-gray-500 rounded-full w-6 h-6 flex items-center justify-center mb-0.5 text-xs font-bold">

                3

              </div>

              <p className="text-[10px] text-gray-500">Taller</p>

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

{/* Content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">

        {/* Título del Paso e Instrucciones (como Modulo 1) */}

        <div className="flex items-start gap-4 mb-6">

          <h2

            className="text-[#006837] shrink-0"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: '2.25rem',

              fontWeight: 800,

            }}

          >

            Paso 2: Fundamentación

          </h2>

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Debes leer todo el contenido hasta el final para activar el siguiente paso.

            </p>

          </div>

        </div>

<div className="space-y-12">

          {/* Section 1 */}

          <section>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center">

                <Video className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">1.3.1</p>

                <h2 className="text-2xl font-bold text-neutral-900">¿Qué es un plan estratégico?</h2>

              </div>

            </div>

            <p className="text-neutral-700 mb-4">

              Estudia el siguiente video donde encontrarás la definición sobre plan estratégico y cómo puedes elegir tu estrategia.

            </p>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">

              <p className="text-neutral-800 font-semibold mb-2">Recurso sugerido</p>

              <p className="text-neutral-600 text-sm mb-4">

                Busca el video <strong>“Plan Estratégico de la Empresa y elección de su estrategia”</strong> para reforzar este tema.

              </p>

              <Button

                variant="outline"

                onClick={() => window.open('https://www.youtube.com/watch?reload=9&app=desktop&v=R_eNtRGzvcw', '_blank')}

                className="border-neutral-900 text-neutral-900 hover:bg-neutral-100 flex items-center gap-2 w-full sm:w-auto"

              >

                <ExternalLink className="w-4 h-4" />

                Abrir en YouTube

              </Button>

            </div>

          </section>

{/* Definiciones */}

          <section>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-neutral-200 text-neutral-900 flex items-center justify-center">

                <BookOpen className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">1.3.2</p>

                <h2 className="text-2xl font-bold text-neutral-900">Direccionamiento estratégico</h2>

              </div>

            </div>

            <p className="text-neutral-700 mb-6">

              En un entorno competitivo y cambiante, las empresas necesitan claridad de propósito y dirección.

              La misión actúa como el presente: define quiénes somos y por qué existimos. La visión es el futuro:

              inspira y motiva, marcando el destino deseado. Las estrategias son los puentes que conectan ambos puntos.

              Sin una visión clara, las decisiones pueden volverse reactivas; sin una misión definida, las acciones pierden sentido;

              sin estrategias sólidas, las metas quedan en ideas. Toda organización —desde un pequeño emprendimiento hasta una multinacional—

              debe revisar periódicamente estos elementos para mantener la coherencia entre lo que dice y lo que hace.

            </p>

            <p className="text-neutral-700 mb-6">

              Para ampliar los fundamentos sobre el direccionamiento estratégico, puedes revisar el siguiente video:

              <strong> ¿Cómo redactar la Visión y Misión de tu empresa?</strong>

            </p>

            <div className="overflow-x-auto">

              <table className="min-w-full border border-neutral-200 rounded-xl overflow-hidden text-sm">

                <thead className="bg-neutral-900 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left">Concepto</th>

                    <th className="px-4 py-3 text-left">Definición</th>

                    <th className="px-4 py-3 text-left">Características principales</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-neutral-200 text-neutral-700">

                  {definiciones.map((item) => (

                    <tr key={item.concepto} className="align-top">

                      <td className="px-4 py-4 font-semibold text-neutral-900">{item.concepto}</td>

                      <td className="px-4 py-4">{item.definicion}</td>

                      <td className="px-4 py-4">

                        <ul className="list-disc list-inside space-y-1">

                          {item.caracteristicas.map((caracteristica) => (

                            <li key={caracteristica}>{caracteristica}</li>

                          ))}

                        </ul>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

{/* Casos */}

          <section>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">

                <ClipboardList className="w-6 h-6" />

              </div>

              <div>

                <p className="text-xs uppercase tracking-widest text-neutral-500">1.3.3</p>

                <h2 className="text-2xl font-bold text-neutral-900">Estudio de casos</h2>

              </div>

            </div>

            <p className="text-neutral-700 mb-6">

              A continuación se presentan dos casos de estudio que muestran cómo diferentes organizaciones definen su misión, visión y estrategias.

            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {casos.map((caso) => (

                <div key={caso.nombre} className="border border-neutral-200 rounded-xl p-6 bg-neutral-50 space-y-3">

                  <p className="text-neutral-900 font-bold">{caso.nombre}</p>

                  <div>

                    <p className="text-neutral-700 text-sm font-semibold">Misión</p>

                    <p className="text-neutral-600 text-sm">{caso.mision}</p>

                  </div>

                  <div>

                    <p className="text-neutral-700 text-sm font-semibold">Visión</p>

                    <p className="text-neutral-600 text-sm">{caso.vision}</p>

                  </div>

                  <div>

                    <p className="text-neutral-700 text-sm font-semibold">Estrategia</p>

                    <p className="text-neutral-600 text-sm">{caso.estrategia}</p>

                  </div>

                </div>

              ))}

            </div>

          </section>

        </div>

{/* CTA */}

        <div className="flex justify-end mt-8">

          <div className="relative group">

            <Button

              onClick={handleCompleteStep}

              disabled={!hasScrolledToBottom}

              className={`bg-[#AA27B9] hover:bg-[#9d24ab] text-white px-8 py-4 flex items-center gap-2 ${!hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

            {!hasScrolledToBottom && (

              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">

                Desplázate hasta el final para continuar

                <div className="absolute top-full right-4 transform -mt-1">

                  <div className="border-4 border-transparent border-t-neutral-900"></div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

{/* Back button */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/unidad2/inicio')}

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

export default Unidad2DesarrolloPage;


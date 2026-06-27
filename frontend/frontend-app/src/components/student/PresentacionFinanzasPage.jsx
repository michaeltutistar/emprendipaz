import React, { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, Play, BookMarked, BookOpen, ArrowDown } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import GlosarioFinanzasModal from './GlosarioFinanzasModal';

import BibliografiaFinanzasModal from './BibliografiaFinanzasModal';

import UnidadCard from './UnidadCard';

import { useModuleProgress } from '../../utils/useModuleProgress';
import { buildModuleAvailabilityFallback, fetchModuleAvailability } from '@/utils/module-availability';
import API_BASE_URL from '@/config/api'



const PresentaciónFinanzasPage = () => {

  const [videoStarted, setVideoStarted] = useState(false);

  const [showBibliografia, setShowBibliografia] = useState(false);

  const [showGlosario, setShowGlosario] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  const [unidad1Completada, setUnidad1Completada] = useState(false);

  const [unidad2Completada, setUnidad2Completada] = useState(false);

  const [unidad3Completada, setUnidad3Completada] = useState(false);

  const [progresoUnidad1, setProgresoUnidad1] = useState(0);

  const [progresoUnidad2, setProgresoUnidad2] = useState(0);

  const [progresoUnidad3, setProgresoUnidad3] = useState(0);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState({ 1: false, 2: false, 3: false });
  const [moduloDisponible, setModuloDisponible] = useState(false);
  const [unidadesCargadas, setUnidadesCargadas] = useState(false);

  const isScrolledRef = useRef(false);



  // Usar hook personalizado para cargar progreso desde backend

  const {

    unidad1Completada: u1Completada,

    unidad2Completada: u2Completada,

    unidad3Completada: u3Completada,

    progresoUnidad1: progU1,

    progresoUnidad2: progU2,

    progresoUnidad3: progU3

  } = useModuleProgress('Finanzas');



  // Sincronizar con estado local

  useEffect(() => {

    setUnidad1Completada(u1Completada);

    setUnidad2Completada(u2Completada);

    setUnidad3Completada(u3Completada);

    setProgresoUnidad1(progU1);

    setProgresoUnidad2(progU2);

    setProgresoUnidad3(progU3);

  }, [u1Completada, u2Completada, u3Completada, progU1, progU2, progU3]);

  const cargarUnidadesDisponibles = async () => {

    const fallback = buildModuleAvailabilityFallback({
      moduleAvailable: true,
      unidad1Completada,
      unidad2Completada
    });

    try {
      const availability = await fetchModuleAvailability('Finanzas');

      if (availability) {
        setModuloDisponible(availability.moduloDisponible);
        setUnidadesDisponibles(availability.unidadesDisponibles);
        setUnidadesCargadas(true);
        return;
      }
    } catch (error) {
      console.error('Error cargando unidades disponibles:', error);
    }

    setModuloDisponible(fallback.moduloDisponible);
    setUnidadesDisponibles(fallback.unidadesDisponibles);
    setUnidadesCargadas(fallback.unidadesCargadas);
  };



  useEffect(() => {

    const shouldScrollToComencemos = sessionStorage.getItem('scrollToComencemos');

    if (shouldScrollToComencemos === 'true') {

      sessionStorage.removeItem('scrollToComencemos');

      setTimeout(() => {

        const comencemasSection = document.getElementById('comencemas');

        if (comencemasSection) {

          comencemasSection.scrollIntoView({ behavior: 'smooth' });

        }

      }, 100);

    } else {
      window.scrollTo(0, 0);
    }

    cargarUnidadesDisponibles();
    const onProgresoActualizado = () => {
      cargarUnidadesDisponibles();
    };



    window.addEventListener('progreso-actualizado', onProgresoActualizado);

    window.addEventListener('focus', onProgresoActualizado);



    return () => {

      window.removeEventListener('progreso-actualizado', onProgresoActualizado);

      window.removeEventListener('focus', onProgresoActualizado);

    };

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



  const scrollToComencemos = () => {

    const comencemasSection = document.getElementById('comencemas');

    if (comencemasSection) {

      comencemasSection.scrollIntoView({ behavior: 'smooth' });

    }

  };



  return (

    <div className="min-h-screen bg-gradient-to-br from-[#006837] via-[#00844a] to-[#59D22E]">

      {/* Header con título dinámico */}

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
                      Finanzas y Gestión Empresarial

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



      {/* Hero Section - Modulo con Video al lado */}

      <section className="relative overflow-hidden py-12 px-8">

        {/* Blobs */}

        <div className="absolute inset-0 overflow-hidden">

          <motion.div

            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"

            style={{ background: 'radial-gradient(circle, #A5E811 0%, transparent 70%)' }}

            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}

            transition={{ duration: 20, repeat: Infinity }}

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

              <span className="text-white font-semibold">Finanzas y Gestión Empresarial</span>

            </motion.div>

          )}



          {/* Title y Video en dos columnas */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">

            {/* Columna Izquierda: Título */}

            <motion.div

              initial={{ opacity: 0, x: -20 }}

              animate={{ opacity: 1, x: 0 }}

              transition={{ duration: 0.6 }}

            >

              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">

                <span className="text-white text-sm font-medium">MÓDULO 8</span>

              </div>



              <h1

                className="text-white mb-6"

                style={{

                  fontFamily: 'var(--font-heading)',

                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',

                  fontWeight: 800,

                  letterSpacing: '-0.02em',

                  lineHeight: 1.1,

                }}


              >
                Finanzas y Gestión Empresarial

              </h1>



              {/* Botón Comenzar */}

              <Button

                onClick={scrollToComencemos}

                className="bg-gradient-to-r from-[#FFEB3B] via-[#A5E811] to-[#59D22E] hover:from-[#A5E811] hover:via-[#FFEB3B] hover:to-[#59D22E] text-[#006837] px-12 py-6 rounded-full shadow-2xl border-0 flex items-center gap-3 relative overflow-hidden group transform hover:scale-105 transition-all"

                style={{

                  boxShadow: '0 20px 60px rgba(255, 235, 59, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.3)',

                }}


              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>

                <span className="relative z-10 font-black text-xl">¡Comencemos!</span>

                <motion.div

                  animate={{ y: [0, 5, 0] }}

                  transition={{ duration: 1.5, repeat: Infinity }}

                  className="relative z-10"

                >

                  <ArrowDown className="w-6 h-6" />

                </motion.div>

              </Button>

            </motion.div>



            {/* Columna Derecha: Video */}

            <motion.div

              initial={{ opacity: 0, x: 20 }}

              animate={{ opacity: 1, x: 0 }}

              transition={{ duration: 0.6, delay: 0.2 }}

            >

              <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-4 border border-white/20">

                <div className="rounded-2xl aspect-video overflow-hidden bg-black relative">

                  <video

                    className="w-full h-full"

                    controls={videoStarted}

                    src="/Modulo8/M8INTRO.mp4"

                    poster="/Modulo8/screeninicio.jpg"

                    onClick={() => !videoStarted && setVideoStarted(true)}

                    onPlay={() => setVideoStarted(true)}

                  >

                    Tu navegador no soporta la reproducción de video.

                  </video>

                  {!videoStarted && (

                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={() => setVideoStarted(true)}>

                      <motion.button

                        whileHover={{ scale: 1.1 }}

                        whileTap={{ scale: 0.95 }}

                        className="bg-[#59D22E] hover:bg-[#A5E811] transition-colors rounded-full p-8 shadow-2xl"

                      >

                        <Play className="w-16 h-16 text-white fill-white" />

                      </motion.button>

                    </div>

                  )}

                </div>

              </div>

            </motion.div>

          </div>

        </div>



        {/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z" fill="#f9fafb" />

          </svg>

        </div>

      </section>



      {/* Main Content */}

      <div className="bg-gray-50 px-8 py-16">

        <div className="max-w-7xl mx-auto">

          {/* Comencemos Section */}

          <div id="comencemas" className="scroll-mt-20">

            <motion.div

              initial={{ opacity: 0, y: 20 }}

              whileInView={{ opacity: 1, y: 0 }}

              viewport={{ once: true }}

              transition={{ duration: 0.6 }}

              className="text-center mb-12"

            >

              <h2

                className="text-[#006837] mb-8"

                style={{

                  fontFamily: 'var(--font-heading)',

                  fontSize: 'clamp(2rem, 4vw, 3rem)',

                  fontWeight: 800,

                  letterSpacing: '-0.02em',

                }}


              >
                Comencemos

              </h2>



              {/* Instrucciones divididas en dos columnas */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">

                {/* Columna 1: Instrucciones */}

                <div className="bg-gradient-to-r from-[#59D22E]/10 to-[#A5E811]/10 border-l-4 border-[#59D22E] rounded-2xl p-6">

                  <p className="text-gray-700 text-left">

                    <strong>📌 Instrucciones importantes:</strong> Debes completar todos los pasos de cada unidad para ir activando las demás unidades.

                    El sistema desbloqueará automáticamente la siguiente unidad una vez hayas completado los 4 pasos de la unidad actual

                    (Presentación, Fundamentación, Taller y Evaluación).

                  </p>

                </div>



                {/* Columna 2: Recursos */}

                <div>

                  <p className="text-gray-700 text-left mb-4">

                    <strong>📚 No olvides consultar...</strong>

                  </p>

                  <div className="flex flex-col gap-3">

                    <Button

                      onClick={() => setShowGlosario(true)}

                      className="w-full bg-gradient-to-r from-[#A5E811] to-[#59D22E] hover:from-[#59D22E] hover:to-[#A5E811] text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all transform hover:scale-105 relative overflow-hidden group"

                    >

                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>

                      <BookMarked className="w-5 h-5 relative z-10" />

                      <span className="relative z-10">Glosario</span>

                    </Button>

                    <Button

                      onClick={() => setShowBibliografia(true)}

                      className="w-full bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] hover:from-[#FFEB3B] hover:to-[#AA27B9] text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all transform hover:scale-105 relative overflow-hidden group"

                    >

                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>

                      <BookOpen className="w-5 h-5 relative z-10" />

                      <span className="relative z-10">Bibliografía</span>

                    </Button>

                  </div>

                </div>

              </div>



              <p className="text-gray-600 text-lg max-w-3xl mx-auto">

                Avanza a tu propio ritmo. Cada unidad se activará cuando completes la anterior.

              </p>

            </motion.div>



            {/* Unidades - Grid */}

            <div className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Unidad 1 */}
                <UnidadCard
                  progreso={progresoUnidad1}
                  unidadNumero={1}
                  titulo="Estudio de la ecuación patrimonial"
                  descripcion="Aprende sobre contabilidad básica, la ecuación patrimonial y cómo registrar las operaciones económicas de tu empresa."
                  estaCompletada={unidad1Completada}
                  estaDisponible={unidadesDisponibles[1] ?? true}
                  unidadAnteriorCompletada={true}
                  ruta="/student/finanzas/unidad1"
                  delay={0.1}
                  textoBotonCompletada="Revisar Unidad"
                  textoBotonActiva="Empezar"
                />

                {/* Unidad 2 */}
                <UnidadCard
                  progreso={progresoUnidad2}
                  unidadNumero={2}
                  titulo="Preparación de presupuesto de ventas"
                  descripcion="Aprende a preparar presupuestos de ventas para proyectar ingresos futuros y planificar mejor tu negocio."
                  estaCompletada={unidad2Completada}
                  estaDisponible={unidadesDisponibles[2] ?? false}
                  unidadAnteriorCompletada={unidad1Completada}
                  ruta="/student/finanzas/unidad2"
                  delay={0.2}
                  textoBotonCompletada="Revisar Unidad"
                  textoBotonActiva="Empezar"
                />



                {/* Unidad 3 */}

                <UnidadCard

                  progreso={progresoUnidad3}

                  unidadNumero={3}

                  titulo="Gestión Empresarial"

                  descripcion="Aprende sobre gestión empresarial y cómo organizar eficientemente los recursos y procesos de tu emprendimiento."

                  estaCompletada={unidad3Completada}

                  estaDisponible={unidadesDisponibles[3] ?? false}

                  unidadAnteriorCompletada={unidad2Completada}

                  ruta="/student/finanzas/unidad3"

                  delay={0.3}

                  textoBotonCompletada="Revisar Unidad"

                  textoBotonActiva="Empezar"

                />

              </div>



              {/* Botón Plan de Negocio */}

              <div className="mt-10 text-center">

                <motion.div

                  initial={{ opacity: 0, y: 20 }}

                  whileInView={{ opacity: 1, y: 0 }}

                  viewport={{ once: true }}

                  transition={{ duration: 0.5, delay: 0.4 }}

                >

                  <Button

                    onClick={() => navigate('/student/finanzas/plan-negocio')}

                    className="bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] hover:from-[#FFEB3B] hover:to-[#AA27B9] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105 relative overflow-hidden group"

                  >

                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>

                    <span className="relative z-10 flex items-center gap-2">

                      Plan de Negocio

                      <ChevronRight className="w-5 h-5" />

                    </span>

                  </Button>

                </motion.div>

              </div>



              {/* Video Experto */}

              <div className="mt-10">

                <motion.div

                  initial={{ opacity: 0, y: 20 }}

                  whileInView={{ opacity: 1, y: 0 }}

                  viewport={{ once: true }}

                  transition={{ duration: 0.5, delay: 0.5 }}

                >

                  <h3

                    className="text-[#006837] mb-6 text-center"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontSize: 'clamp(1.5rem, 3vw, 2rem)',

                      fontWeight: 700,

                      letterSpacing: '-0.02em',

                    }}


                  >
                    Vídeo Experto

                  </h3>

                  <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-4 border border-white/20">

                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl aspect-video relative overflow-hidden">

                      <video

                        src="/Modulo8/M8EXP.mp4"

                        controls

                        className="w-full h-full object-cover rounded-2xl"

                      >

                        Tu navegador no soporta la reproducción de videos.

                      </video>

                    </div>

                  </div>

                </motion.div>

              </div>



              {/* Botón Finalizar Unidad */}

              <div className="mt-8 flex justify-end">

                <motion.div

                  initial={{ opacity: 0, y: 20 }}

                  whileInView={{ opacity: 1, y: 0 }}

                  viewport={{ once: true }}

                  transition={{ duration: 0.5, delay: 0.6 }}

                >

                  <Button

                    onClick={() => navigate('/student/modulos')}

                    className="bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] hover:from-[#FFEB3B] hover:to-[#AA27B9] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105 relative overflow-hidden group"

                  >

                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>

                    <span className="relative z-10 flex items-center gap-2">

                      Finalizar Unidad

                      <ChevronRight className="w-5 h-5" />

                    </span>

                  </Button>

                </motion.div>

              </div>

            </div>

          </div>

        </div>

      </div>



      {/* Modals */}

      {showBibliografia && <BibliografiaFinanzasModal onClose={() => setShowBibliografia(false)} />}

      {showGlosario && <GlosarioFinanzasModal onClose={() => setShowGlosario(false)} />}



      {/* Back Button */}

      <motion.div

        initial={{ opacity: 0, x: -20 }}

        animate={{ opacity: 1, x: 0 }}

        className="fixed bottom-8 left-8 z-40"

      >

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/modulos');

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



export default PresentaciónFinanzasPage;


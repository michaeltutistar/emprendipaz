import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, CheckCircle, XCircle, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';

import useProgressTracking from '../../utils/useProgressTracking';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const preguntas = [

  {

    id: 1,

    pregunta: 'El término canales digitales hace alusión a:',

    opciones: [

      { id: 'A', texto: 'Analizar la competencia' },

      { id: 'B', texto: 'Son los puntos de contacto online mediante los cuales los clientes se conectan con nuestro emprendimiento' },

      { id: 'C', texto: 'Una inteligencia artificial' }

    ],

    respuestaCorrecta: 'B'

  },

  {

    id: 2,

    pregunta: '¿Qué es un diagnóstico de presencia digital?',

    opciones: [

      { id: 'A', texto: 'Es la evaluación de cómo se encuentra nuestra presencia online' },

      { id: 'B', texto: 'Es una red social' },

      { id: 'C', texto: 'Es el análisis de los proveedores' }

    ],

    respuestaCorrecta: 'A'

  },

  {

    id: 3,

    pregunta: '¿Cuántos pasos componen un diagnóstico de presencia digital?',

    opciones: [

      { id: 'A', texto: '3' },

      { id: 'B', texto: '8' },

      { id: 'C', texto: '5' }

    ],

    respuestaCorrecta: 'C'

  },

  {

    id: 4,

    pregunta: 'Cuando revisamos si nuestro emprendimiento aparece en los primeros resultados en Google y nuestros datos de contacto están correctos, ¿Qué paso del diagnóstico de presencia digital estamos desarrollando?',

    opciones: [

      { id: 'A', texto: 'Analizar la competencia' },

      { id: 'B', texto: 'Búsqueda en navegadores' },

      { id: 'C', texto: 'Revisar las opiniones de los clientes' }

    ],

    respuestaCorrecta: 'B'

  },

  {

    id: 5,

    pregunta: 'Después de revisar todo sobre nuestra presencia digital y la de la competencia, el último paso del diagnóstico es decidir qué vamos a cambiar o mejorar. ¿Cómo se llama este paso?',

    opciones: [

      { id: 'A', texto: 'Definir acciones de mejora' },

      { id: 'B', texto: 'Búsqueda en navegadores' },

      { id: 'C', texto: 'Análisis de la competencia' }

    ],

    respuestaCorrecta: 'A'

  }

];

const ResultadoModal = ({ resultado, onClose }) => {

  const todoCorrecto = resultado.incorrectas.length === 0;

return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">

        <div className={`py-6 px-8 rounded-t-2xl ${todoCorrecto ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`}>

          <div className="flex items-center justify-center gap-3 text-white">

            {todoCorrecto ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}

            <div>

              <h2 className="text-[24px] font-bold">

                {todoCorrecto ? '¡Excelente!' : 'Revisa tus respuestas'}

              </h2>

              <p className="text-sm">

                {todoCorrecto ? 'Has completado la evaluación correctamente.' : 'Algunas respuestas necesitan corrección.'}

              </p>

            </div>

          </div>

        </div>

        <div className="p-8 space-y-4">

          <div className="flex items-center justify-between">

            <span className="text-neutral-700">Respuestas correctas:</span>

            <span className="font-bold text-green-600 text-[24px]">{resultado.correctas}/5</span>

          </div>

          {!todoCorrecto && (

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">

              <p className="font-bold text-red-900 mb-2">Preguntas con errores:</p>

              <ul className="space-y-2 text-sm text-red-700">

                {resultado.incorrectas.map((error) => (

                  <li key={error.pregunta}>

                    • Pregunta {error.pregunta}: seleccionaste la opción {error.respuesta}

                  </li>

                ))}

              </ul>

            </div>

          )}

          {todoCorrecto && (

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800">

              ¡Felicitaciones! Puedes finalizar la Unidad 1.

            </div>

          )}

          <Button onClick={onClose} className="w-full bg-[#AA27B9] hover:bg-[#9d24ab] text-white py-3 rounded-lg">

            {todoCorrecto ? 'Continuar' : 'Cerrar'}

          </Button>

        </div>

      </div>

    </div>

  );

};

const MarketingDigitalUnidad1CierrePage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState({});

  const [resultado, setResultado] = useState(null);

  const [evaluaciónCompleta, setEvaluaciónCompleta] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Marketing Digital', 'Unidad 1: Cierre');

  const evaluaciónBloqueada = evaluaciónCompleta || pasoCompletado;

  const [cargandoEstado, setCargandoEstado] = useState(true);

  const isScrolledRef = useRef(false);

  const enviandoIntentoRef = useRef(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

// Sincronizar la UI con el progreso guardado en el backend

  useEffect(() => {

    if (pasoCompletado) {

      setEvaluaciónCompleta(true);

    }

  }, [pasoCompletado, setCargandoEstado]);

useEffect(() => {

    // Simular carga inicial del estado de progreso

    const timeout = setTimeout(() => {

      setCargandoEstado(false);

    }, 500);

    return () => clearTimeout(timeout);

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

const handleRespuesta = (preguntaId, opcionId) => {

    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));

  };

const handleEnviar = async () => {

    if (evaluaciónBloqueada) {

      return; // No permitir enviar si ya pasó

    }

const incorrectas = [];

    let correctas = 0;

preguntas.forEach((pregunta) => {

      const respuestaUsuario = respuestas[pregunta.id];

      if (respuestaUsuario === pregunta.respuestaCorrecta) {

        correctas += 1;

      } else {

        incorrectas.push({ pregunta: pregunta.id, respuesta: respuestaUsuario || 'Sin responder' });

      }

    });

const todasCorrectas = incorrectas.length === 0;

// Registrar intento de evaluación

    try {

      const token = getAuthToken();

      if (!token) {

        console.error('No hay token de autenticación disponible');

        return;

      }

const apiUrl = `${API_BASE_URL}/registrar-intento-evaluacion`;

const response = await fetch(apiUrl, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          ...(token ? { 'Authorization': `Bearer ${token}` } : {})

        },

        body: JSON.stringify({

          modulo_nombre: 'Marketing Digital',

          unidad_nombre: 'Unidad 1',

          paso_nombre: 'Unidad 1: Evaluación',

          todas_correctas: todasCorrectas

        })

      });

if (!response.ok) {

        const errorData = await response.json().catch(() => ({}));

        console.error('Error al registrar intento de evaluación:', response.status, errorData);

      } else {

        const data = await response.json();

        console.log('Intento registrado éxitosamente:', data);

      }

    } catch (error) {

      console.error('Error al registrar intento de evaluación:', error);

    }

setResultado({ correctas, incorrectas });

    if (todasCorrectas) {

      setEvaluaciónCompleta(true);

    }

  };

const handleFinalizarUnidad = async () => {

    if (!evaluaciónCompleta) return;

    sessionStorage.setItem('scrollToComencemás', 'true');

    await registrarProgreso();

    navigate('/student/marketing-digital');

  };

const todasRespondidas = preguntas.every((pregunta) => respuestas[pregunta.id]);

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

{/* Hojas animadas */}

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[8%] w-12 h-12"

            animate={{ x: [0, 140], y: [80, -36], opacity: [0, 0.9, 0.9, 0] }}

            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[28%] w-10 h-10"

            animate={{ x: [0, 133], y: [80, -30], opacity: [0, 0.7, 0.7, 0] }}

            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', delay: 1, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[10%] w-11 h-11"

            animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.85, 0.85, 0] }}

            transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 0.5, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[5%] w-13 h-13"

            animate={{ x: [0, 146], y: [80, -42], opacity: [0, 0.6, 0.6, 0] }}

            transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1.5, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute left-[15%] w-8 h-8"

            animate={{ x: [0, 127], y: [80, -27], opacity: [0, 0.75, 0.75, 0] }}

            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute right-[40%] w-7 h-7"

            animate={{ x: [0, 120], y: [80, -24], opacity: [0, 0.8, 0.8, 0] }}

            transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', delay: 0.8, times: [0, 0.1, 0.85, 1] }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[12%] w-11 h-11"

            animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.65, 0.65, 0] }}

            transition={{ duration: 4.2, repeat: Infinity, ease: 'linear', delay: 0.3, times: [0, 0.1, 0.85, 1] }}

          />

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

                    Unidad 1 · Evaluación

                  </p>

                </div>

              </motion.div>

<div className="flex justify-end">

                <button

                  onClick={() => navigate('/student/perfil')}

                  className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-[10000]"

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

              onClick={() => navigate('/student/marketing-digital')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Marketing Digital

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Diagnóstico de Presencia Digital

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

                onClick={() => navigate('/student/marketing-digital')}

                className="hover:text-white transition-colors"

              >

                Marketing Digital

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 1 · Evaluación</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Marketing Digital

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

              Diagnóstico de Presencia Digital · Evaluación

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Evalúa tus conocimientos sobre diagnóstico de presencia digital y canales digitales.

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

              animate={{ width: '100%' }}

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

{/* Step 3 - Completado */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                3

              </div>

              <p className="text-[10px] text-gray-500">Taller</p>

            </div>

{/* Step 4 - Active */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div

                initial={{ scale: 0 }}

                animate={{ scale: 1 }}

                transition={{ type: "spring", stiffness: 200 }}

                className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                4

              </motion.div>

              <p className="text-[10px] text-[#AA27B9] font-bold">Evaluación</p>

            </div>

          </div>

        </div>

      </div>

{/* Content */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-8">

            <h2 className="text-2xl md:text-[32px] font-bold text-neutral-900 mb-4">1.3.1 Cuestionario cierre de unidad</h2>

            {evaluaciónBloqueada ? (
              <div className="bg-[#EFFFEC] border border-[#D1FADF] p-5 rounded-xl mb-8 flex items-start gap-4 shadow-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#D1FADF] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-[#027A48]" />
                </div>
                <div>
                  <h3 className="text-[#027A48] font-bold text-lg mb-1">
                    Evaluación ya completada
                  </h3>
                  <p className="text-[#027A48]/80 text-sm leading-relaxed">
                    Esta evaluación ya fue aprobada correctamente para este usuario. No se permiten más intentos en este módulo.
                  </p>
                </div>
              </div>
            ) : (

              <>

                <p className="text-neutral-600 text-sm md:text-base mb-2">

                  Para cerrar la unidad 1 "diagnóstico de presencia digital", realiza el siguiente cuestionario y pon a prueba tus conocimientos.

                </p>

                <p className="text-neutral-600 text-sm md:text-base">

                  Responde las cinco preguntas de selección múltiple sobre diagnóstico de presencia digital.

                </p>

              </>

            )}

          </div>

<div className="space-y-6 mb-8">

            {preguntas.map((pregunta) => (

              <div key={pregunta.id} className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-6">

                <div className="mb-4">

                  <span className="text-neutral-900 font-bold">Pregunta {pregunta.id}</span>

                  <p className="text-neutral-700 mt-2 leading-relaxed text-sm md:text-base">{pregunta.pregunta}</p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {pregunta.opciones.map((opcion) => {

                    const isSelected = respuestas[pregunta.id] === opcion.id;

                    return (

                      <button

                        key={opcion.id}

                        onClick={() => !evaluaciónBloqueada && handleRespuesta(pregunta.id, opcion.id)}

                        disabled={evaluaciónBloqueada}

                        className={`text-left border-2 rounded-lg px-4 py-3 text-sm md:text-base transition-all ${isSelected

                          ? 'bg-neutral-900 text-white border-neutral-900'

                          : 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900'

                          } ${evaluaciónBloqueada ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}

                      >

                        <span className="font-semibold mr-2">{opcion.id}.</span>

                        {opcion.texto}

                      </button>

                    );

                  })}

                </div>

              </div>

            ))}

          </div>

<div className="flex flex-col sm:flex-row gap-4 justify-end">

            {!evaluaciónBloqueada && (

              <Button

                onClick={handleEnviar}

                disabled={!todasRespondidas || cargandoEstado}

                className={`bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!todasRespondidas || cargandoEstado ? 'opacity-40 cursor-not-allowed' : ''

                  }`}

              >

                Enviar respuestas

              </Button>

            )}

            {evaluaciónCompleta && (

              <Button

                onClick={handleFinalizarUnidad}

                className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 flex items-center gap-2"

              >

                Finalizar Unidad

                <ChevronRight className="w-5 h-5" />

              </Button>

            )}

          </div>

        </div>

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/marketing-digital/unidad1')}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </div>

{/* Modal de Resultado */}

      {resultado && (

        <ResultadoModal

          resultado={resultado}

          onClose={() => {

            setResultado(null);

            if (evaluaciónCompleta) {

              // No hacer nada, el botón de finalizar ya está visible

            }

          }}

        />

      )}

<Footer />

    </div>

  );

};

export default MarketingDigitalUnidad1CierrePage;


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

    pregunta: 'El término meta de marketing digital hace alusión a:',

    opciones: [

      { id: 'A', texto: 'Analizar al cliente' },

      { id: 'B', texto: 'Una declaración clara y específica de los objetivos a los cuales nuestro emprendimiento aspira mediante el desarrollo de estrategias' },

      { id: 'C', texto: 'Una red social' }

    ],

    respuestaCorrecta: 'B'

  },

  {

    id: 2,

    pregunta: '¿Cuál es la metodología de definición de objetivos que deberíamás utilizar para el plan de marketing digital de nuestro emprendimiento?',

    opciones: [

      { id: 'A', texto: 'Design thinking' },

      { id: 'B', texto: 'Marketing de contenidos' },

      { id: 'C', texto: 'SMART' }

    ],

    respuestaCorrecta: 'C'

  },

  {

    id: 3,

    pregunta: '¿Un objetivo de largo plazo se mide en?',

    opciones: [

      { id: 'A', texto: '1 más' },

      { id: 'B', texto: '1 año o más' },

      { id: 'C', texto: '5 semanas' }

    ],

    respuestaCorrecta: 'B'

  },

  {

    id: 4,

    pregunta: '¿Cuál de los siguientes SÍ ES un objetivo SMART?',

    opciones: [

      { id: 'A', texto: 'Crecer en redes sociales' },

      { id: 'B', texto: 'Analizar mi producción' },

      { id: 'C', texto: 'Incrementar en un 20% los seguidores de Instagram en los próximos 3 meses' }

    ],

    respuestaCorrecta: 'C'

  },

  {

    id: 5,

    pregunta: '¿Cuál de los siguientes NO ES un objetivo SMART?',

    opciones: [

      { id: 'A', texto: 'Definir acciones de mejora' },

      { id: 'B', texto: 'Incrementar las ventas online en un 35% en un año' },

      { id: 'C', texto: 'Generar un incremento de las interacciones en Facebook del 40% en los próximos dos meses' }

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

              ¡Felicitaciones! Puedes finalizar la Unidad 2.

            </div>

          )}

          <div className="flex justify-end">

            <Button

              onClick={onClose}

              className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2"

            >

              Cerrar

            </Button>

          </div>

        </div>

      </div>

    </div>

  );

};



const MarketingDigitalUnidad2CierrePage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState({});

  const [mostrarResultado, setmostrarResultado] = useState(false);

  const [resultado, setResultado] = useState(null);

  const [puedeFinalizar, setPuedeFinalizar] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Marketing Digital', 'Unidad 2: Cierre');

  const evaluaciónBloqueada = puedeFinalizar || pasoCompletado;

  const [cargandoEstado, setCargandoEstado] = useState(true);

  const isScrolledRef = useRef(false);



  useEffect(() => {

    window.scrollTo(0, 0);

    const saved = localStorage.getItem('marketingDigitalUnidad2Cierre');

    if (saved) {

      setRespuestas(JSON.parse(saved));

    }

  }, []);



  // Sincronizar la UI con el progreso guardado en el backend

  useEffect(() => {

    if (pasoCompletado) {

      setPuedeFinalizar(true);

    }

  }, [pasoCompletado]);



  useEffect(() => {

    // Simular carga inicial del estado de progreso

    const timeout = setTimeout(() => {

      setCargandoEstado(false);

    }, 500);

    return () => clearTimeout(timeout);

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

    const nuevasRespuestas = { ...respuestas, [preguntaId]: opcionId };

    setRespuestas(nuevasRespuestas);

    localStorage.setItem('marketingDigitalUnidad2Cierre', JSON.stringify(nuevasRespuestas));

  };



  const handleEvaluar = async () => {

    if (evaluaciónBloqueada) {

      return; // No permitir evaluar si ya pasó

    }



    const todasRespondidas = preguntas.every(p => respuestas[p.id]);

    if (!todasRespondidas) {

      alert('Por favor responde todas las preguntas antes de evaluar.');

      return;

    }



    let correctas = 0;

    const incorrectas = [];



    preguntas.forEach(pregunta => {

      if (respuestas[pregunta.id] === pregunta.respuestaCorrecta) {

        correctas++;

      } else {

        incorrectas.push({

          pregunta: pregunta.id,

          respuesta: respuestas[pregunta.id]

        });

      }

    });



    const todasCorrectas = incorrectas.length === 0;



    // Registrar intento de evaluación

    try {

      const token = getAuthToken();

      const apiUrl = `${API_BASE_URL}/registrar-intento-evaluacion`;



      await fetch(apiUrl, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing Digital',

          unidad_nombre: 'Unidad 2',

          paso_nombre: 'Unidad 2: Evaluación',

          todas_correctas: todasCorrectas

        })

      });

    } catch (error) {

      console.error('Error al registrar intento de evaluación:', error);

    }



    const resultadoEvaluación = {

      correctas,

      incorrectas

    };



    setResultado(resultadoEvaluación);

    setmostrarResultado(true);

    setPuedeFinalizar(todasCorrectas);

  };



  const handleFinalizarUnidad = async () => {

    sessionStorage.setItem('scrollToComencemás', 'true');

    await registrarProgreso();

    navigate('/student/marketing-digital');

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

                    Unidad 2 · Evaluación

                  </p>

                </div>

              </motion.div>



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

              Modulos

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

              Metas de Marketing Digital

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

                Modulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button

                onClick={() => navigate('/student/marketing-digital')}

                className="hover:text-white transition-colors"

              >

                Marketing Digital

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 2 · Evaluación</span>

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

              Metas de Marketing Digital · Evaluación

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Evalúa tus conocimientos sobre metas de marketing digital y metodología SMART.

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



      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-6">

            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Cuestionario de cierre de unidad</h2>

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

              <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded">

                <p className="text-neutral-700 text-sm md:text-base">

                  <strong>📌 Instrucciones:</strong> Para cerrar la unidad 2 "Metas de marketing digital", realiza el siguiente cuestionario y pon a prueba tus conocimientos.

                </p>

              </div>

            )}

          </div>



          <div className="space-y-8">

            {preguntas.map((pregunta) => (

              <div key={pregunta.id} className="border-2 border-neutral-200 rounded-lg p-6">

                <h3 className="text-lg font-semibold text-neutral-900 mb-4">

                  {pregunta.id}. {pregunta.pregunta}

                </h3>

                <div className="space-y-3">

                  {pregunta.opciones.map((opcion) => {

                    const isSelected = respuestas[pregunta.id] === opcion.id;

                    const isCorrect = opcion.id === pregunta.respuestaCorrecta;

                    const showFeedback = mostrarResultado && resultado;



                    return (

                      <button

                        key={opcion.id}

                        onClick={() => !mostrarResultado && !evaluaciónBloqueada && handleRespuesta(pregunta.id, opcion.id)}

                        disabled={mostrarResultado || evaluaciónBloqueada}

                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected

                          ? showFeedback

                            ? isCorrect

                              ? 'bg-green-100 border-green-600'

                              : 'bg-red-100 border-red-600'

                            : 'bg-blue-100 border-blue-600'

                          : 'bg-white border-neutral-300 hover:border-neutral-400'

                          } ${mostrarResultado ? 'cursor-default' : 'cursor-pointer'}`}

                      >

                        <div className="flex items-start gap-3">

                          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected

                            ? showFeedback

                              ? isCorrect

                                ? 'bg-green-600 border-green-600'

                                : 'bg-red-600 border-red-600'

                              : 'bg-blue-600 border-blue-600'

                            : 'border-neutral-400'

                            }`}>

                            {isSelected && (

                              <span className="text-white text-xs font-bold">{opcion.id}</span>

                            )}

                          </div>

                          <span className={`flex-1 ${isSelected ? 'font-semibold' : ''}`}>

                            {opcion.id}) {opcion.texto}

                          </span>

                          {showFeedback && isCorrect && isSelected && (

                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />

                          )}

                          {showFeedback && !isCorrect && isSelected && (

                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />

                          )}

                        </div>

                      </button>

                    );

                  })}

                </div>

              </div>

            ))}

          </div>



          <div className="mt-8 flex justify-between items-center">

            {!evaluaciónBloqueada && (

              <Button

                onClick={handleEvaluar}

                disabled={mostrarResultado || !preguntas.every(p => respuestas[p.id]) || cargandoEstado}

                className={`px-8 py-4 ${mostrarResultado || !preguntas.every(p => respuestas[p.id]) || cargandoEstado

                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'

                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'

                  }`}

              >

                Evaluar Respuestas

              </Button>

            )}

            {puedeFinalizar && (

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



      {mostrarResultado && resultado && (

        <ResultadoModal

          resultado={resultado}

          onClose={() => setmostrarResultado(false)}

        />

      )}



      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/marketing-digital/unidad2')}

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



export default MarketingDigitalUnidad2CierrePage;




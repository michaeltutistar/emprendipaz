import React, { useEffect, useState, useRef } from 'react';

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

    enunciado: 'Una estrategia de comercialización se define como:',

    opciones: [

      { id: 'a', texto: 'El conjunto de tácticas financieras para reducir costos.', explicacion: 'Describe tácticas financieras, no una estrategia comercial.' },

      { id: 'b', texto: 'Las acciones planificadas para posicionar y vender un producto o servicio en el mercado.', correcta: true, explicacion: 'Corresponde a la definición presentada en la unidad.' },

      { id: 'c', texto: 'La estructura organizacional de la empresa.', explicacion: 'La estructura no corresponde a la estrategia comercial.' }

    ]

  },

  {

    enunciado: 'El objetivo principal de una estrategia de comercialización es:',

    opciones: [

      { id: 'a', texto: 'Aumentar la producción sin analizar la demanda.', explicacion: 'Producir sin estudiar el mercado no asegura ventas.' },

      { id: 'b', texto: 'Facilitar la conexión entre el producto y el cliente para generar ventas.', correcta: true, explicacion: 'La unidad resalta la conexión producto-cliente como objetivo central.' },

      { id: 'c', texto: 'Disminuir el personal de ventas.', explicacion: 'Reducir personal no es un objetivo de comercialización.' }

    ]

  },

  {

    enunciado: 'Una estrategia basada en el producto busca principalmente:',

    opciones: [

      { id: 'a', texto: 'Resaltar las características y beneficios que diferencian el producto.', correcta: true, explicacion: 'El enfoque está en destacar atributos únicos del producto.' },

      { id: 'b', texto: 'Reducir el número de puntos de venta.', explicacion: 'La distribución corresponde a la plaza, no al producto.' },

      { id: 'c', texto: 'Aumentar los costos de publicidad.', explicacion: 'La promoción no hace parte del enfoque de producto.' }

    ]

  },

  {

    enunciado: 'La estrategia de precios consiste en:',

    opciones: [

      { id: 'a', texto: 'Definir el valor monetario que el cliente está dispuestá a pagar por el producto.', correcta: true, explicacion: 'Se centra en asignar el valor económico al producto.' },

      { id: 'b', texto: 'Aumentar el margen de utilidad sin considerar el mercado.', explicacion: 'Ignorar al mercado contradice el enfoque de precios del marketing mix.' },

      { id: 'c', texto: 'Escoger proveedores con menores costos.', explicacion: 'Seleccionar proveedores pertenece a decisiones operativas.' }

    ]

  },

  {

    enunciado: 'Las estrategias de promoción tienen como finalidad:',

    opciones: [

      { id: 'a', texto: 'Comunicar, persuadir e incentivar la compra del producto o servicio.', correcta: true, explicacion: 'La promoción busca comunicar y motivar la compra.' },

      { id: 'b', texto: 'Limitar la información que recibe el cliente.', explicacion: 'Limitar información va en contra de la promoción.' },

      { id: 'c', texto: 'Reducir la inversión en publicidad.', explicacion: 'Reducir la inversión no describe la finalidad de la promoción.' }

    ]

  }

];



// Modal de resultado similar a otros modulos

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

            <span className="font-bold text-green-600 text-[24px]">{resultado.correctas}/{resultado.total}</span>

          </div>

          {!todoCorrecto && (

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">

              <p className="font-bold text-red-900 mb-2">Preguntas con errores:</p>

              <ul className="space-y-2 text-sm text-red-700">

                {resultado.incorrectas.map((error) => (

                  <li key={error.pregunta}>

                    • Pregunta {error.pregunta}: seleccionaste la opción {error.respuesta || 'Sin respuesta'}

                  </li>

                ))}

              </ul>

            </div>

          )}

          {todoCorrecto && (

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800">

              ¡Felicitaciones! Has completado exitosamente la Unidad 3. Puedes continuar con el siguiente módulo o revisar el contenido nuevamente.

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



const Unidad3CierrePage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState({});

  const [resultado, setResultado] = useState(null);

  const [evaluaciónCompleta, setEvaluaciónCompleta] = useState(false);

  const [enviandoIntento, setEnviandoIntento] = useState(false);

  const enviandoIntentoRef = useRef(false);

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Marketing y Comercialización', 'Unidad 3: Evaluación');

  const evaluaciónBloqueada = evaluaciónCompleta || pasoCompletado;

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const isScrolledRef = useRef(false);



  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);



  // Sincronizar la UI con el progreso guardado en el backend

  useEffect(() => {

    if (pasoCompletado) {

      setEvaluaciónCompleta(true);

    }

  }, [pasoCompletado]);



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



  const handleRespuesta = (preguntaIndex, opcionId) => {

    if (evaluaciónBloqueada) return;

    setRespuestas((prev) => ({ ...prev, [preguntaIndex]: opcionId }));

  };



  const handleEnviar = async () => {

    if (evaluaciónBloqueada) return;

    if (enviandoIntentoRef.current) return;

    enviandoIntentoRef.current = true;



    const incorrectas = [];

    let correctas = 0;



    preguntas.forEach((pregunta, index) => {

      const respuestaUsuario = respuestas[index];

      const opcionCorrecta = pregunta.opciones.find((o) => o.correcta);

      const idCorrecta = opcionCorrecta ? opcionCorrecta.id : null;



      if (respuestaUsuario === idCorrecta) {

        correctas += 1;

      } else {

        incorrectas.push({

          pregunta: index + 1,

          respuesta: respuestaUsuario || 'Sin responder'

        });

      }

    });



    const todasCorrectas = incorrectas.length === 0;



    // Registrar intento de evaluación

    try {

      setEnviandoIntento(true);

      const token = getAuthToken();

      const apiUrl = import.meta.env.MODE === 'production'

        ? `${API_BASE_URL}/registrar-intento-evaluacion`

        : `${API_BASE_URL}/registrar-intento-evaluacion`;



      await fetch(apiUrl, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing y Comercialización',

          unidad_nombre: 'Unidad 3',

          paso_nombre: 'Unidad 3: Evaluación',

          todas_correctas: todasCorrectas

        })

      });

    } catch (error) {

      console.error('Error al registrar intento de evaluación:', error);

    } finally {

      setEnviandoIntento(false);

      enviandoIntentoRef.current = false;

    }



    setResultado({

      correctas,

      total: preguntas.length,

      incorrectas

    });



    if (todasCorrectas) {

      setEvaluaciónCompleta(true);

      window.dispatchEvent(new Event('progreso-actualizado'));

    }

  };



  const handleFinalizarUnidad = async () => {

    if (!evaluaciónCompleta) return;

    sessionStorage.setItem('scrollToComencemas', 'true');

    await registrarProgreso();

    navigate('/student/presentacion-modulo');

  };



  const todasRespondidas = preguntas.every((_, index) => respuestas[index]);



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

                      Unidad 3 · Evaluación

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

              Estrategias de comercialización

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

              <span className="text-white font-semibold">Unidad 3 · Evaluación</span>

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

              Estrategias de comercialización · Evaluación

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Evalúa tus conocimientos sobre estrategias de comercialización y marketing mix.

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



      {/* Contenido principal - evaluación en una sola página */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-8">

            <h2 className="text-2xl md:text-[32px] font-bold text-neutral-900 mb-4">1.4 Cierre</h2>

            <h3 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2">EVALUACIÓN UNIDAD TRES</h3>

            <p className="text-neutral-700 font-semibold mb-4">Estrategias de comercialización</p>

            <p className="text-neutral-600 text-sm md:text-base">

              Responde todas las preguntas de selección múltiple sobre estrategias de comercialización.

              Debes responder correctamente para completar la unidad.

            </p>



            {evaluaciónBloqueada && (

              <div className="mt-4 bg-green-50 border border-green-200 text-green-900 rounded-xl p-3">

                <p className="font-semibold text-sm">Evaluación ya completada</p>

                <p className="text-xs mt-1">

                  Esta evaluación ya fue aprobada correctamente para este usuario. No se permiten más intentos en este módulo.

                </p>

              </div>

            )}

          </div>



          <div className="space-y-6 mb-8">

            {preguntas.map((pregunta, index) => (

              <div key={index} className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-6">

                <div className="mb-4">

                  <span className="text-neutral-900 font-bold">Pregunta {index + 1}</span>

                  <p className="text-neutral-700 mt-2 leading-relaxed text-sm md:text-base">{pregunta.enunciado}</p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {pregunta.opciones.map((opcion) => {

                    const isSelected = respuestas[index] === opcion.id;

                    return (

                      <button

                        key={opcion.id}

                        onClick={() => handleRespuesta(index, opcion.id)}

                        disabled={evaluaciónBloqueada}

                        className={`text-left border-2 rounded-lg px-4 py-3 text-sm md:text-base transition-all ${isSelected

                          ? 'bg-neutral-900 text-white border-neutral-900'

                          : 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900'

                          } ${evaluaciónBloqueada ? 'opacity-60 cursor-not-allowed' : ''}`}

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



          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">

            <Button

              onClick={() => navigate('/student/unidad3/desarrollo')}

              className="bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-900 px-8 py-4"

            >

              Volver al Desarrollo

            </Button>



            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">

              <Button

                onClick={handleEnviar}

                disabled={!todasRespondidas || enviandoIntento || evaluaciónBloqueada}

                className={`bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 ${(!todasRespondidas || enviandoIntento || evaluaciónBloqueada) ? 'opacity-40 cursor-not-allowed' : ''

                  }`}

              >

                Enviar Respuestas

              </Button>



              <Button

                onClick={handleFinalizarUnidad}

                disabled={!evaluaciónCompleta}

                className={`bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!evaluaciónCompleta ? 'opacity-40 cursor-not-allowed' : ''

                  }`}

              >

                Finalizar Unidad

                <ChevronRight className="w-5 h-5" />

              </Button>

            </div>

          </div>

        </div>

      </div>



      {/* Back button */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/unidad3')}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </div>



      {/* Modal de resultado */}

      {resultado && (

        <ResultadoModal

          resultado={resultado}

          onClose={() => setResultado(null)}

        />

      )}



      <Footer />

    </div>

  );

};



export default Unidad3CierrePage;




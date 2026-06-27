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

    pregunta: '¿Cuál es el verdadero propósito de tomar decisiones como líder?',

    opciones: [

      { id: 'A', texto: 'Elegir la opción más rápida para resolver problemas.' },

      { id: 'B', texto: 'Construir confianza, movilizar al equipo de trabajo y transformar la visión en acción.' },

      { id: 'C', texto: 'Evitar conflictos dentro del equipo de trabajo.' }

    ],

    respuestaCorrecta: 'B'

  },

  {

    id: 2,

    pregunta: '¿Qué debe tener en cuenta un líder al tomar decisiones sobre su equipo de trabajo?',

    opciones: [

      { id: 'A', texto: 'Que todos cumplan estrictamente las órdenes.' },

      { id: 'B', texto: 'Que cada colaborador tiene un lado humano y aspiraciones personales.' },

      { id: 'C', texto: 'Que los resultados están por encima de las emociones.' }

    ],

    respuestaCorrecta: 'B'

  },

  {

    id: 3,

    pregunta: '¿Qué implica la premisa "el líder siempre está en la mira"?',

    opciones: [

      { id: 'A', texto: 'Que debe controlar todo lo que hacen los demás.' },

      { id: 'B', texto: 'Que debe evitar errores para no ser criticado.' },

      { id: 'C', texto: 'Que debe convertirse en ejemplo para su equipo de trabajo.' }

    ],

    respuestaCorrecta: 'C'

  },

  {

    id: 4,

    pregunta: '¿Qué decisión difícil puede marcar la diferencia en la gestión de un líder?',

    opciones: [

      { id: 'A', texto: 'Ignorar los problemas para evitar confrontaciones.' },

      { id: 'B', texto: 'Anticipar desviaciones en un proyecto y actuar con firmeza.' },

      { id: 'C', texto: 'Delegar todas las decisiones al equipo de trabajo.' }

    ],

    respuestaCorrecta: 'B'

  },

  {

    id: 5,

    pregunta: '¿Cuál es el orden correcto de los pasos para tomar decisiones según la ruta para decidir?',

    opciones: [

      { id: 'A', texto: 'Pensar opciones → Detectar el problema → Actuar y revisar → Comparar y elegir' },

      { id: 'B', texto: 'Detectar el problema → Pensar opciones → Comparar y elegir → Actuar y revisar' },

      { id: 'C', texto: 'Comparar y elegir → Actuar y revisar → Detectar el problema → Pensar opciones' }

    ],

    respuestaCorrecta: 'B'

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

              ¡Felicitaciones! Has completado el módulo de Liderazgo.

            </div>

          )}

          <Button onClick={onClose} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-lg">

            {todoCorrecto ? 'Continuar' : 'Cerrar'}

          </Button>

        </div>

      </div>

    </div>

  );

};

const LiderazgoUnidad3CierrePage = () => {

  const navigate = useNavigate();

  const [respuestas, setRespuestas] = useState({});

  const [resultado, setResultado] = useState(null);

  const [evaluaciónCompleta, setEvaluaciónCompleta] = useState(false);

  const [enviandoIntento, setEnviandoIntento] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const enviandoIntentoRef = useRef(false);

  const { pasoCompletado, registrarProgreso } = useProgressTracking('Liderazgo', 'Unidad 3: Evaluación');

  const evaluaciónBloqueada = evaluaciónCompleta || pasoCompletado;

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

const handleRespuesta = (preguntaId, opcionId) => {

    if (evaluaciónBloqueada) return;

    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));

  };

const handleEnviar = async () => {

    if (evaluaciónBloqueada) return;

    if (enviandoIntentoRef.current) return;

    enviandoIntentoRef.current = true;

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

const resultadoEvaluación = { correctas, incorrectas };

    setResultado(resultadoEvaluación);

const todasCorrectas = incorrectas.length === 0;

// Registrar intento de evaluación

    try {

      setEnviandoIntento(true);

      const token = getAuthToken();

      const apiUrl = `${API_BASE_URL}/registrar-intento-evaluacion`;

      await fetch(apiUrl, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Liderazgo',

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

if (todasCorrectas) {

      setEvaluaciónCompleta(true);

      // Registrar progreso cuando se completa correctamente

      try {

        await registrarProgreso();

      } catch (error) {

        console.error('Error al registrar progreso:', error);

      }

    }

  };

const handleFinalizarUnidad = async () => {

    sessionStorage.setItem('scrollToComencemás', 'true');

    try {

      const token = getAuthToken();

      const apiUrl = `${API_BASE_URL}/registrar-progreso-modulo`;

      await fetch(apiUrl, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Liderazgo',

          paso_nombre: 'Unidad 3: Evaluación',

          curso_nombre: 'Liderazgo'

        })

      });

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/liderazgo');

    } catch (error) {

      window.dispatchEvent(new Event('progreso-actualizado'));

      navigate('/student/liderazgo');

    }

  };

const todasRespondidas = preguntas.every((p) => respuestas[p.id]);

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* Header con scroll dinámico */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-8 overflow-hidden min-h-[60px]"

          animate={{

            minHeight: '60px',

            paddingTop: '0.5rem',

            paddingBottom: '0.5rem',

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

{/* Menú de usuario - Derecha */}

              <div className="flex justify-end">

                <div className="relative">

                  <button

                    onClick={() => setUserMenuOpen(!userMenuOpen)}

                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"

                  >

                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 overflow-hidden">

                      {fotoPerfilUrl ? (

                        <img

                          src={fotoPerfilUrl}

                          alt="Foto de perfil"

                          className="w-full h-full object-cover"

                          onError={(e) => {

                            e.currentTarget.style.display = 'none';

                            const fallback = e.currentTarget.nextElementSibling;

                            if (fallback) fallback.style.display = 'flex';

                          }}

                        />

                      ) : null}

                      <span

                        className="text-white font-semibold text-sm"

                        style={{ display: fotoPerfilUrl ? 'none' : 'flex' }}

                      >

                        {userName.charAt(0).toUpperCase() || 'U'}

                      </span>

                    </div>

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

                    <div className="absolute right-full mr-2 top-0 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] border">

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

            <button onClick={() => navigate('/student/liderazgo')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Liderazgo

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Unidad 3 · Cierre

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

              MÓDULO: Liderazgo

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

              Toma de Decisiones

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

              <p className="text-[10px] text-[#AA27B9] font-bold">Cierre</p>

            </div>

          </div>

        </div>

      </div>

{/* Main Content */}

      <div className="max-w-7xl mx-auto px-8 py-6">

        {/* Título del Paso e Instrucciones - AL LADO */}

        <div className="flex items-start gap-4 mb-6">

          <h2

            className="text-[#006837] shrink-0"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: '2.25rem',

              fontWeight: 800,

            }}

          >

            Paso 4: Cierre

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Para cerrar la unidad 3 "Toma de Decisiones", realiza el siguiente cuestionario y pon a prueba tus conocimientos.

            </p>

          </div>

        </div>

<div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          {/* Banner de evaluación ya completada */}

          {evaluaciónBloqueada && (

            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">

              <div className="flex items-center gap-2">

                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />

                <p className="text-green-800 font-semibold">

                  Evaluación ya completada. No se permiten más intentos.

                </p>

              </div>

            </div>

          )}

<div className="space-y-8 mb-8">

            {preguntas.map((pregunta) => (

              <div key={pregunta.id} className="border-b border-neutral-200 pb-6 last:border-b-0">

                <h3 className="text-lg font-semibold text-neutral-900 mb-4">

                  {pregunta.id}. {pregunta.pregunta}

                </h3>

                <div className="space-y-3">

                  {pregunta.opciones.map((opcion) => (

                    <button

                      key={opcion.id}

                      onClick={() => handleRespuesta(pregunta.id, opcion.id)}

                      disabled={evaluaciónBloqueada}

                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${evaluaciónBloqueada ? 'opacity-50 cursor-not-allowed' : ''

                        } ${respuestas[pregunta.id] === opcion.id

                          ? 'border-[#AA27B9] bg-purple-50'

                          : 'border-gray-200 hover:border-gray-400 bg-white'

                        }`}

                    >

                      <div className="flex items-start gap-3">

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${respuestas[pregunta.id] === opcion.id

                          ? 'border-[#AA27B9] bg-[#AA27B9]'

                          : 'border-gray-400'

                          }`}>

                          {respuestas[pregunta.id] === opcion.id && (

                            <div className="w-2 h-2 rounded-full bg-white"></div>

                          )}

                        </div>

                        <span className="text-neutral-700">{opcion.texto}</span>

                      </div>

                    </button>

                  ))}

                </div>

              </div>

            ))}

          </div>

<div className="flex justify-end gap-4">

            <Button

              onClick={handleEnviar}

              disabled={!todasRespondidas || enviandoIntento || evaluaciónBloqueada}

              className={`px-8 py-4 ${(!todasRespondidas || enviandoIntento || evaluaciónBloqueada)

                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'

                : 'bg-[#AA27B9] hover:bg-[#9d24ab] text-white'

                }`}

            >

              Enviar Respuestas

            </Button>

            {evaluaciónCompleta && (

              <Button

                onClick={handleFinalizarUnidad}

                className="px-8 py-4 bg-green-800 hover:bg-green-900 text-white flex items-center gap-2"

              >

                Finalizar Unidad

                <ChevronRight className="w-5 h-5" />

              </Button>

            )}

          </div>

        </div>

      </div>

{resultado && (

        <ResultadoModal

          resultado={resultado}

          onClose={() => {

            setResultado(null);

            if (evaluaciónCompleta) {

              setEvaluaciónCompleta(true);

            }

          }}

        />

      )}

<Footer />

    </div>

  );

};

export default LiderazgoUnidad3CierrePage;


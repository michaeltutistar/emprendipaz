import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, ChevronDown, LogOut, Check, X } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { clearLocalSession, getAuthToken } from '@/utils/auth-storage'

const FinanzasUnidad2TallerPage = () => {

  const navigate = useNavigate();

// Datos del ejercicio

  const enunciados = [

    { id: 'enunciado1', texto: '1. Si vendiste 100 refrescos y esperas un incremento del 10 %, ¿cuántas unidades proyectas?', respuestaCorrecta: 'calculo1' },

    { id: 'enunciado2', texto: '2. Si proyectas vender 500 cafés a $2 cada uno, ¿cuál es el ingreso esperado?', respuestaCorrecta: 'calculo2' },

    { id: 'enunciado3', texto: '3. Si proyectas vender 200 pastelitos a $3 cada uno, ¿cuál es el ingreso esperado?', respuestaCorrecta: 'calculo5' },

    { id: 'enunciado4', texto: '4. Si proyectas vender 300 refrescos a $2.000 cada uno, ¿cuál es el ingreso esperado?', respuestaCorrecta: 'calculo3' },

    { id: 'enunciado5', texto: '5. Si proyectas vender 120 camisetas a $10 cada una, ¿cuál es el ingreso esperado?', respuestaCorrecta: 'calculo4' }

  ];

const calculos = [

    { id: 'calculo1', texto: '110' },

    { id: 'calculo2', texto: '$1.000' },

    { id: 'calculo3', texto: '$600.000' },

    { id: 'calculo4', texto: '$1.200' },

    { id: 'calculo5', texto: '$600' }

  ];

const [respuestas, setRespuestas] = useState(() => {

    const saved = localStorage.getItem('finanzas_u2_taller_respuestas_drag');

    return saved ? JSON.parse(saved) : {};

  });

const [validado, setValidado] = useState(false);

  const [completado, setCompletado] = useState(false);

  const [draggedItem, setDraggedItem] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

useEffect(() => {

    window.scrollTo(0, 0);

    cargarFotoPerfil();

  }, []);

useEffect(() => {

    let ticking = false;

    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          setIsScrolled(window.scrollY > 100);

          ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

useEffect(() => {

    localStorage.setItem('finanzas_u2_taller_respuestas_drag', JSON.stringify(respuestas));

  }, [respuestas]);

const cargarFotoPerfil = async () => {

    try {

      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/student/perfil`, {

        method: 'GET',

        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }

      });

      if (response.ok) {

        const data = await response.json();

        setUserName(data.nombre || 'Usuario');

        if (data.foto_perfil) {

          setFotoPerfilUrl(data.foto_perfil);

        }

      }

    } catch (error) {

      console.error('Error al cargar foto de perfil:', error);

    }

  };

const handleLogout = () => {
    clearLocalSession();
    navigate('/login');

  };

const handleDragStart = (e, calculoId) => {

    setDraggedItem(calculoId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

  };

const handleDrop = (e, enunciadoId) => {

    e.preventDefault();

    if (draggedItem && (!validado || (validado && !esCorrecta(enunciadoId)))) {

      setRespuestas(prev => ({

        ...prev,

        [enunciadoId]: draggedItem

      }));

    }

    setDraggedItem(null);

  };

const handleRemoveAnswer = (enunciadoId) => {

    if (!validado || (validado && !esCorrecta(enunciadoId))) {

      setRespuestas(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[enunciadoId];

        return newRespuestas;

      });

    }

  };

const esCorrecta = (enunciadoId) => {

    const enunciado = enunciados.find(e => e.id === enunciadoId);

    return enunciado && respuestas[enunciadoId] === enunciado.respuestaCorrecta;

  };

const validarRespuestas = () => {

    const todasRespondidas = enunciados.every(e => respuestas[e.id]);

    if (!todasRespondidas) {

      alert('Por favor completa todas las respuestas antes de verificar.');

      return;

    }

setValidado(true);

    const todasCorrectas = enunciados.every(e => esCorrecta(e.id));

if (todasCorrectas) {

      setCompletado(true);

    }

  };

const handleReintentar = () => {

    // Solo limpiar las respuestas incorrectas

    const nuevasRespuestas = {};

    enunciados.forEach(e => {

      if (esCorrecta(e.id)) {

        nuevasRespuestas[e.id] = respuestas[e.id];

      }

    });

    setRespuestas(nuevasRespuestas);

    setValidado(false);

  };

const handleCompleteStep = async () => {

    if (!completado) {

      alert('Debes completar correctamente el taller antes de continuar.');

      return;

    }

try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Finanzas y Gestión Empresarial',

          paso_nombre: 'Unidad 2: Taller',

          curso_nombre: 'Finanzas y Gestión Empresarial'

        })

      });

      navigate('/student/finanzas/unidad2/cierre');

    } catch (error) {

      console.error("Error al registrar progreso:", error);

      navigate('/student/finanzas/unidad2/cierre');

    }

  };

const calculosUsados = Object.values(respuestas);

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

            style={{ mixBlendMode: 'overlay', opacity: 0.2 }}

          >

            <img

              src="https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png"

              alt=""

              className="w-[160%] h-auto object-cover"

            />

          </div>

{/* Hojas animadas */}

          <motion.img src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png" alt="" className="absolute right-[8%] w-12 h-12" animate={{ x: [0, 140], y: [80, -36], opacity: [0, 0.9, 0.9, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.85, 1] }} />

          <motion.img src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png" alt="" className="absolute right-[28%] w-10 h-10" animate={{ x: [0, 133], y: [80, -30], opacity: [0, 0.7, 0.7, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', delay: 1, times: [0, 0.1, 0.85, 1] }} />

          <motion.img src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png" alt="" className="absolute left-[10%] w-11 h-11" animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.85, 0.85, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 0.5, times: [0, 0.1, 0.85, 1] }} />

          <motion.img src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png" alt="" className="absolute left-[5%] w-13 h-13" animate={{ x: [0, 146], y: [80, -42], opacity: [0, 0.6, 0.6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1.5, times: [0, 0.1, 0.85, 1] }} />

          <motion.img src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png" alt="" className="absolute left-[15%] w-8 h-8" animate={{ x: [0, 127], y: [80, -27], opacity: [0, 0.75, 0.75, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2, times: [0, 0.1, 0.85, 1] }} />

          <motion.img src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png" alt="" className="absolute right-[40%] w-7 h-7" animate={{ x: [0, 120], y: [80, -24], opacity: [0, 0.8, 0.8, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', delay: 0.8, times: [0, 0.1, 0.85, 1] }} />

          <motion.img src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png" alt="" className="absolute right-[12%] w-11 h-11" animate={{ x: [0, 137], y: [80, -33], opacity: [0, 0.65, 0.65, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'linear', delay: 0.3, times: [0, 0.1, 0.85, 1] }} />

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

                    src="/formacion.png"

                    alt="Formación Logo"

                    onClick={() => navigate(`/student/dashboard`)}

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

                      Finanzas y Gestión Empresarial

                    </h1>

                  </div>

                </motion.div>

              )}

{/* Menú de usuario - Derecha */}

              {isScrolled && (

                <motion.div

                  initial={{ opacity: 0, x: 20 }}

                  animate={{ opacity: 1, x: 0 }}

                  transition={{ duration: 0.3 }}

                  className="relative"

                >

                  <button

                    onClick={() => setUserMenuOpen(!userMenuOpen)}

                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"

                  >

                    {fotoPerfilUrl ? (

                      <img src={fotoPerfilUrl} alt="Perfil" className="w-7 h-7 rounded-full object-cover border-2 border-white" />

                    ) : (

                      <div className="w-7 h-7 rounded-full bg-white/40 flex items-center justify-center border-2 border-white">

                        <span className="text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>

                      </div>

                    )}

                    <ChevronDown className={`w-4 h-4 text-white transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />

                  </button>

{userMenuOpen && (

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">

                      <div className="px-4 py-2 border-b border-gray-200">

                        <p className="text-sm font-semibold text-gray-900">{userName}</p>

                        <p className="text-xs text-gray-500">Estudiante</p>

                      </div>

                      <button

                        onClick={handleLogout}

                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"

                      >

                        <LogOut className="w-4 h-4" />

                        Cerrar sesión

                      </button>

                    </div>

                  )}

                </motion.div>

              )}

            </div>

          </div>

        </motion.header>

{/* Breadcrumb sticky blanco */}

        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2 px-4 sm:px-8">

          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">

            <button onClick={() => navigate('/student/dashboard')} className="text-gray-600 hover:text-gray-900 transition-colors">

              <Home className="w-4 h-4" />

            </button>

            <span className="text-gray-400">/</span>

            <button onClick={() => navigate('/student/finanzas')} className="text-gray-600 hover:text-gray-900 transition-colors">

              Finanzas y Gestión Empresarial

            </button>

            <span className="text-gray-400">/</span>

            <span className="text-gray-900 font-medium">Unidad 2: Taller</span>

          </div>

        </div>

      </div>

{/* Hero Section - Morado */}

      <section className="relative bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] text-white py-8 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <h1

              className="text-white mb-2"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: '2.5rem',

                fontWeight: 800,

                letterSpacing: '-0.02em',

                textShadow: '0 2px 10px rgba(0,0,0,0.2)',

              }}

            >

              Unidad 2: Preparación de presupuesto de ventas

            </h1>

            <p className="text-white/90 text-lg">

              Taller práctico

            </p>

          </motion.div>

        </div>

<svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">

          <path

            d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z"

            fill="white"

          />

        </svg>

      </section>

{/* Progress Steps */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#AA27B9] to-[#d946ef] z-0"

              initial={{ width: 0 }}

              animate={{ width: '66.66%' }}

              transition={{ duration: 1 }}

            ></motion.div>

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                1

              </div>

              <p className="text-[10px] text-gray-500">Presentación</p>

            </div>

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                2

              </div>

              <p className="text-[10px] text-gray-500">Fundamentación</p>

            </div>

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

<div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-white border-2 border-gray-300 text-gray-400 rounded-full w-6 h-6 flex items-center justify-center mb-0.5 text-xs font-bold">

                4

              </div>

              <p className="text-[10px] text-gray-400">Evaluación</p>

            </div>

          </div>

        </div>

      </div>

{/* Main Content */}

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">

        <div className="mb-8 flex items-start gap-4">

          <h2

            className="text-neutral-900"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: '2.25rem',

              fontWeight: 800,

            }}

          >

            Paso 3: Taller

          </h2>

<div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Arrastra las opciones correctas de la columna Cálculo al espacio de la columna Enunciado que le corresponda en la siguiente tabla.

            </p>

          </div>

        </div>

<div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4">Taller: Presupuestos de ventas.</h3>

          <p className="text-sm md:text-base mb-8 text-neutral-700">

            Pongamos a prueba tu capacidad de realizar el presupuesto de ventas en algunos escenarios puntuales.

          </p>

{/* Tabla de drag and drop */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Columna Enunciado */}

            <div>

              <h4 className="text-lg font-semibold mb-4 text-center bg-[#1e3a8a] text-white py-3 rounded-t-lg">Enunciado</h4>

              <div className="space-y-3">

                {enunciados.map((enunciado) => {
                  const respuesta = respuestas[enunciado.id];
                  const esCorrectaRespuesta = validado && esCorrecta(enunciado.id);
                  const esIncorrecta = validado && respuesta && !esCorrecta(enunciado.id);
                  const calculoTexto = respuesta ? calculos.find(c => c.id === respuesta)?.texto : '';

                  return (
                    <div
                      key={enunciado.id}
                      className={`rounded-lg p-4 min-h-[100px] border-2 transition-all ${esCorrectaRespuesta
                        ? 'border-green-500 bg-green-50'
                        : esIncorrecta
                          ? 'border-red-500 bg-red-50'
                          : 'border-green-500 bg-green-50'
                        }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, enunciado.id)}
                      onContextMenu={handleContextMenu}
                    >
                      <p className="text-sm font-medium text-neutral-900 mb-3">{enunciado.texto}</p>

                      {respuesta ? (
                        <div className={`flex items-center justify-between px-3 py-2 rounded ${esCorrectaRespuesta
                          ? 'bg-green-100 border-2 border-green-500'
                          : esIncorrecta
                            ? 'bg-red-100 border-2 border-red-500'
                            : 'bg-white border-2 border-[#AA27B9]'
                          }`}>

                          <span className="text-sm font-semibold text-neutral-900">{calculoTexto}</span>

                          <div className="flex items-center gap-2">

                            {esCorrectaRespuesta && <Check className="w-5 h-5 text-green-600" />}

                            {esIncorrecta && <X className="w-5 h-5 text-red-600" />}

                            {(!validado || esIncorrecta) && (

                              <button

                                onClick={() => handleRemoveAnswer(enunciado.id)}

                                className="text-red-600 hover:text-red-800 text-xs font-semibold"

                              >

                                ✕

                              </button>

                            )}

                          </div>

                        </div>

                      ) : (

                        <div className="border-2 border-dashed border-gray-400 rounded p-3 text-center text-gray-500 text-sm">

                          Arrastra aquí la respuesta

                        </div>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

{/* Columna Cálculo */}

            <div>

              <h4 className="text-lg font-semibold mb-4 text-center bg-[#1e3a8a] text-white py-3 rounded-t-lg">Cálculo</h4>

              <div className="space-y-3">

                {calculos.map((calculo) => {

                  const estaUsado = calculosUsados.includes(calculo.id);

return (

                    <div

                      key={calculo.id}

                      draggable={!estaUsado}

                      onDragStart={(e) => handleDragStart(e, calculo.id)}

                      onContextMenu={handleContextMenu}

                      className={`rounded-lg p-4 border-2 text-center cursor-move transition-all ${estaUsado

                        ? 'bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed'

                        : 'bg-white border-[#AA27B9] hover:bg-[#AA27B9]/5 hover:shadow-md'

                        }`}

                    >

                      <span className="text-sm font-semibold text-neutral-900">{calculo.texto}</span>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>

{/* Botones de acción */}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

            {!validado && (

              <Button

                onClick={validarRespuestas}

                className="bg-[#AA27B9] hover:bg-[#9d24ab] text-white px-8 py-3"

              >

                Verificar respuestas

              </Button>

            )}

{validado && !completado && (

              <Button

                onClick={handleReintentar}

                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"

              >

                Reintentar incorrectas

              </Button>

            )}

          </div>

{/* Mensaje de éxito */}

          {completado && (

            <div className="mt-6 bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">

              <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />

              <h3 className="text-xl font-bold text-green-900 mb-2">¡Excelente! Has completado correctamente el taller.</h3>

              <p className="text-green-800">Todas tus respuestas son correctas. Puedes continuar al siguiente paso.</p>

            </div>

          )}

{/* Texto final */}

          <div className="mt-8 bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-lg p-6">

            <p className="text-sm md:text-base text-neutral-800 leading-relaxed">

              Los presupuestos son esenciales para un emprendimiento porque permiten anticipar ingresos, gastos y necesidades de recursos antes de ejecutarlos. Facilitan decidir cuánto vender y así determinar cuánto comprar y gastar para obtener utilidades, reduciendo la improvisación. Con un presupuesto claro, el emprendedor controla mejor sus operaciones, evita gastos innecesarios y mejora su capacidad para crecer de manera ordenada y sostenible.

            </p>

          </div>

        </div>

{/* Navegación */}

        <div className="flex justify-between items-center mt-8">

          <Button

            onClick={() => navigate('/student/finanzas/unidad2/desarrollo')}

            className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 px-6 py-3 flex items-center gap-2"

          >

            <ArrowLeft className="w-4 h-4" />

            Atrás

          </Button>

<Button

            onClick={handleCompleteStep}

            disabled={!completado}

            className={`px-8 py-3 flex items-center gap-2 ${!completado

              ? 'bg-gray-400 cursor-not-allowed'

              : 'bg-black hover:bg-neutral-800 text-white'

              }`}

          >

            Siguiente Paso

            <ChevronRight className="w-5 h-5" />

          </Button>

        </div>

      </div>

<Footer />

    </div>

  );

};

export default FinanzasUnidad2TallerPage;


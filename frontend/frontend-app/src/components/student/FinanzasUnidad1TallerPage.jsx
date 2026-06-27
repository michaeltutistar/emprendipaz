import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, CheckCircle, X, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const elementos = [

  {

    id: 'elemento1',

    texto: 'Dinero en caja.',

    tipoCorrecto: 'A'

  },

  {

    id: 'elemento2',

    texto: 'Deuda con el banco.',

    tipoCorrecto: 'P'

  },

  {

    id: 'elemento3',

    texto: 'Aporte del propietario.',

    tipoCorrecto: 'PT'

  },

  {

    id: 'elemento4',

    texto: 'Inventarios.',

    tipoCorrecto: 'A'

  },

  {

    id: 'elemento5',

    texto: 'Proveedores por pagar.',

    tipoCorrecto: 'P'

  }

];

const tipos = [

  { id: 'A', nombre: 'Activo (A)', descripcion: 'Bienes y derechos de la empresa' },

  { id: 'P', nombre: 'Pasivo (P)', descripcion: 'Deudas de la empresa' },

  { id: 'PT', nombre: 'Patrimonio (PT)', descripcion: 'Aportes de los propietarios' }

];

const FinanzasUnidad1TallerPage = () => {

  const navigate = useNavigate();

  const [respuestasActividad1, setRespuestasActividad1] = useState(() => {

    const saved = localStorage.getItem('finanzas_u1_taller_act1');

    return saved ? JSON.parse(saved) : {};

  });

  const [respuestasActividad2, setRespuestasActividad2] = useState(() => {

    const saved = localStorage.getItem('finanzas_u1_taller_act2');

    return saved ? JSON.parse(saved) : {

      pregunta1: '', // c

      pregunta2: '', // c

      pregunta3: ''  // d

    };

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('finanzas_u1_taller_validado');

    return saved === 'true';

  });

  const [mostrarValidacion, setmostrarValidacion] = useState(false);

  const [errores, setErrores] = useState({});

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

    localStorage.setItem('finanzas_u1_taller_act1', JSON.stringify(respuestasActividad1));

  }, [respuestasActividad1]);

useEffect(() => {

    localStorage.setItem('finanzas_u1_taller_act2', JSON.stringify(respuestasActividad2));

  }, [respuestasActividad2]);

useEffect(() => {

    localStorage.setItem('finanzas_u1_taller_validado', validado.toString());

  }, [validado]);

const handleTipoChange = (elementoId, tipoId) => {

    setRespuestasActividad1(prev => ({

      ...prev,

      [elementoId]: tipoId

    }));

  };

const handleRespuestaChange = (pregunta, valor) => {

    setRespuestasActividad2(prev => ({

      ...prev,

      [pregunta]: valor

    }));

  };

const validarRespuestas = () => {

    const erroresObj = {};

    let tieneErrores = false;

// Validar Actividad 1

    elementos.forEach(elemento => {

      if (respuestasActividad1[elemento.id] !== elemento.tipoCorrecto) {

        erroresObj[`act1_${elemento.id}`] = true;

        tieneErrores = true;

      }

    });

// Validar Actividad 2 (preguntas de selección múltiple)

    const respuesta1Correcta = respuestasActividad2.pregunta1 === 'c'; // $14.000.000

    const respuesta2Correcta = respuestasActividad2.pregunta2 === 'c'; // $14.000.000

    const respuesta3Correcta = respuestasActividad2.pregunta3 === 'd'; // $5.000.000

if (!respuesta1Correcta) { erroresObj.act2_p1 = true; tieneErrores = true; }

    if (!respuesta2Correcta) { erroresObj.act2_p2 = true; tieneErrores = true; }

    if (!respuesta3Correcta) { erroresObj.act2_p3 = true; tieneErrores = true; }

setErrores(erroresObj);

    setmostrarValidacion(true);

if (!tieneErrores) {

      setValidado(true);

      alert('¡Excelente! Todas las respuestas son correctas.');

    }

  };

const handleReintentar = () => {

    setmostrarValidacion(false);

    setErrores({});

    // Limpiar solo las respuestas incorrectas

    const nuevasRespuestas1 = { ...respuestasActividad1 };

    elementos.forEach(elemento => {

      if (errores[`act1_${elemento.id}`]) {

        delete nuevasRespuestas1[elemento.id];

      }

    });

    setRespuestasActividad1(nuevasRespuestas1);

const nuevasRespuestas2 = { ...respuestasActividad2 };

    if (errores.act2_p1) nuevasRespuestas2.pregunta1 = '';

    if (errores.act2_p2) nuevasRespuestas2.pregunta2 = '';

    if (errores.act2_p3) nuevasRespuestas2.pregunta3 = '';

    setRespuestasActividad2(nuevasRespuestas2);

  };

const handleValidarYContinuar = () => {

    // Primero validar siempre

    const erroresObj = {};

    let tieneErrores = false;

// Validar Actividad 1

    elementos.forEach(elemento => {

      if (respuestasActividad1[elemento.id] !== elemento.tipoCorrecto) {

        erroresObj[`act1_${elemento.id}`] = true;

        tieneErrores = true;

      }

    });

// Validar Actividad 2

    const respuesta1Correcta = respuestasActividad2.pregunta1 === 'c'; // $14.000.000

    const respuesta2Correcta = respuestasActividad2.pregunta2 === 'c'; // $14.000.000

    const respuesta3Correcta = respuestasActividad2.pregunta3 === 'd'; // $5.000.000

if (!respuesta1Correcta) { erroresObj.act2_p1 = true; tieneErrores = true; }

    if (!respuesta2Correcta) { erroresObj.act2_p2 = true; tieneErrores = true; }

    if (!respuesta3Correcta) { erroresObj.act2_p3 = true; tieneErrores = true; }

setErrores(erroresObj);

    setmostrarValidacion(true);

// Si hay errores, no continuar

    if (tieneErrores) {

      alert('Por favor corrige los errores marcados en rojo antes de continuar.');

      return;

    }

// Si todo está correcto, marcar como validado y continuar

    setValidado(true);

    alert('¡Excelente! Todas las respuestas son correctas. Continuando a la evaluación...');

// Continuar a la evaluación

    const continuarAEvaluación = async () => {

      try {

        const token = getAuthToken();

        await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

          method: 'POST',

          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

          body: JSON.stringify({

            modulo_nombre: 'Finanzas y Gestión Empresarial',

            paso_nombre: 'Unidad 1: Taller',

            curso_nombre: 'Finanzas y Gestión Empresarial'

          })

        });

        navigate('/student/finanzas/unidad1/cierre');

      } catch (error) {

        navigate('/student/finanzas/unidad1/cierre');

      }

    };

continuarAEvaluación();

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

                      Finanzas y Gestión Empresarial

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 1 · Taller

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

{/* Breadcrumb sticky siempre visible */}

      <motion.div

          className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

          initial={{ opacity: 0, y: -10 }}

          animate={{ opacity: 1, y: 0 }}

        >

          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">

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

              <button onClick={() => navigate('/student/finanzas')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Finanzas y Gestión Empresarial

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">Unidad 1 · Taller</span>

            </div>

          </div>

        </motion.div>

{/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] pt-8 pb-16 px-8">

        <div className="absolute inset-0 overflow-hidden">

          <motion.div

            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"

            style={{ background: 'radial-gradient(circle, #FFEB3B 0%, transparent 70%)' }}

            animate={{ scale: [1, 1.2, 1] }}

            transition={{ duration: 15, repeat: Infinity }}

          />

        </div>

<div className="max-w-7xl mx-auto relative z-10">

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <h1

              className="text-white"

              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}

            >

              Estudio de la ecuación patrimonial

            </h1>

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

{/* Progress Steps */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#AA27B9] to-[#d946ef] z-0"

              initial={{ width: 0 }}

              animate={{ width: '75%' }}

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

              <strong>📌 Instrucciones:</strong> Empareja la actividad de la derecha con la fortaleza de la izquierda. Arrastra cada opción de la derecha hacia las opciones de la izquierda.

            </p>

          </div>

        </div>

<div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">

          <div className="mb-8">

            <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">Taller: Identifica los elementos y aplica la ecuación contable</h3>

          </div>

{/* Actividad 1: Identifica los elementos */}

          <div className="mb-10">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Actividad 1: Identifica los elementos</h3>

            <p className="text-sm md:text-base mb-4 text-neutral-700">

              Lee cada enunciado y clasifícalo como <strong>Activo (A)</strong>, <strong>Pasivo (P)</strong> o <strong>Patrimonio (PT)</strong>.

            </p>

<div className="space-y-4">

              {elementos.map((elemento) => {

                const tipoSeleccionado = respuestasActividad1[elemento.id];

                const isCorrect = tipoSeleccionado === elemento.tipoCorrecto;

const tieneError = mostrarValidacion && errores[`act1_${elemento.id}`];

                return (

                  <div

                    key={elemento.id}

                    className={`border-2 rounded-lg p-4 transition-all ${

                      mostrarValidacion

                        ? isCorrect

                          ? 'border-green-500 bg-green-50'

                          : 'border-red-500 bg-red-50'

                        : tipoSeleccionado

                        ? 'border-blue-300 bg-blue-50'

                        : 'border-neutral-300 bg-white'

                    }`}

                  >

                    <p className="text-sm md:text-base font-medium text-neutral-900 mb-3">{elemento.texto}</p>

                    <div className="flex flex-wrap gap-3">

                      {tipos.map((tipo) => (

                        <button

                          key={tipo.id}

                          onClick={() => handleTipoChange(elemento.id, tipo.id)}

                          className={`px-4 py-2 rounded-lg border-2 transition-all text-sm md:text-base ${

                            mostrarValidacion && tipoSeleccionado === tipo.id

                              ? isCorrect

                                ? 'bg-green-600 text-white border-green-700'

                                : 'bg-red-600 text-white border-red-700'

                              : tipoSeleccionado === tipo.id

                              ? 'bg-blue-600 text-white border-blue-700'

                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'

                          }`}

                        >

                          {tipo.nombre}

                        </button>

                      ))}

                    </div>

                    {mostrarValidacion && tipoSeleccionado && (

                      <p className={`text-xs mt-2 font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>

                        {isCorrect ? '✓ Correcto' : '✗ Incorrecto - Revisa tu respuesta'}

                      </p>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

{/* Actividad 2: Aplica la ecuación contable */}

          <div className="mb-10">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Actividad 2: Aplica la ecuación contable</h3>

            <p className="text-sm md:text-base mb-4 text-neutral-700">

              Usa la ecuación <strong>Activos = Pasivos + Patrimonio</strong> para completar cada ejercicio:

            </p>

<div className="space-y-6">

              {/* Pregunta 1 */}

              <div className={`bg-white border-2 rounded-lg p-4 ${

                mostrarValidacion 

                  ? errores.act2_p1 

                    ? 'border-red-600' 

                    : 'border-green-600'

                  : 'border-neutral-300'

              }`}>

                <p className="text-sm md:text-base font-semibold mb-3">

                  1. Si una empresa tiene <strong>activos por $20.000.000</strong> y <strong>pasivos por $6.000.000</strong>, ¿cuál es su patrimonio?

                </p>

                <div className="space-y-2">

                  {[

                    { id: 'a', texto: '$26.000.000' },

                    { id: 'b', texto: '$20.000.000' },

                    { id: 'c', texto: '$14.000.000' },

                    { id: 'd', texto: '$6.000.000' }

                  ].map(opcion => (

                    <button

                      key={opcion.id}

                      onClick={() => handleRespuestaChange('pregunta1', opcion.id)}

                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${

                        mostrarValidacion && respuestasActividad2.pregunta1 === opcion.id

                          ? opcion.id === 'c'

                            ? 'bg-green-100 border-green-600 text-green-900'

                            : 'bg-red-100 border-red-600 text-red-900'

                          : respuestasActividad2.pregunta1 === opcion.id

                          ? 'bg-blue-100 border-blue-600 text-blue-900'

                          : 'bg-white border-neutral-300 hover:border-neutral-500'

                      }`}

                    >

                      <span className="font-semibold">{opcion.id.toUpperCase()})</span> {opcion.texto}

                    </button>

                  ))}

                </div>

                {mostrarValidacion && (

                  <p className={`text-xs mt-2 font-semibold ${errores.act2_p1 ? 'text-red-700' : 'text-green-700'}`}>

                    {errores.act2_p1 ? '✗ Incorrecto. La respuesta correcta es C) $14.000.000' : '✓ Correcto'}

                  </p>

                )}

              </div>

{/* Pregunta 2 */}

              <div className={`bg-white border-2 rounded-lg p-4 ${

                mostrarValidacion 

                  ? errores.act2_p2 

                    ? 'border-red-600' 

                    : 'border-green-600'

                  : 'border-neutral-300'

              }`}>

                <p className="text-sm md:text-base font-semibold mb-3">

                  2. Si <strong>el patrimonio es $10.000.000</strong> y <strong>los pasivos $4.000.000</strong>, ¿cuál es el total de activos?

                </p>

                <div className="space-y-2">

                  {[

                    { id: 'a', texto: '$6.000.000' },

                    { id: 'b', texto: '$20.000.000' },

                    { id: 'c', texto: '$14.000.000' },

                    { id: 'd', texto: '$10.000.000' }

                  ].map(opcion => (

                    <button

                      key={opcion.id}

                      onClick={() => handleRespuestaChange('pregunta2', opcion.id)}

                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${

                        mostrarValidacion && respuestasActividad2.pregunta2 === opcion.id

                          ? opcion.id === 'c'

                            ? 'bg-green-100 border-green-600 text-green-900'

                            : 'bg-red-100 border-red-600 text-red-900'

                          : respuestasActividad2.pregunta2 === opcion.id

                          ? 'bg-blue-100 border-blue-600 text-blue-900'

                          : 'bg-white border-neutral-300 hover:border-neutral-500'

                      }`}

                    >

                      <span className="font-semibold">{opcion.id.toUpperCase()})</span> {opcion.texto}

                    </button>

                  ))}

                </div>

                {mostrarValidacion && (

                  <p className={`text-xs mt-2 font-semibold ${errores.act2_p2 ? 'text-red-700' : 'text-green-700'}`}>

                    {errores.act2_p2 ? '✗ Incorrecto. La respuesta correcta es C) $14.000.000' : '✓ Correcto'}

                  </p>

                )}

              </div>

{/* Pregunta 3 */}

              <div className={`bg-white border-2 rounded-lg p-4 ${

                mostrarValidacion 

                  ? errores.act2_p3 

                    ? 'border-red-600' 

                    : 'border-green-600'

                  : 'border-neutral-300'

              }`}>

                <p className="text-sm md:text-base font-semibold mb-3">

                  3. Si <strong>los pasivos son de $7.000.000</strong> y <strong>los activos de $12.000.000</strong>, ¿cuál es el valor del patrimonio?

                </p>

                <div className="space-y-2">

                  {[

                    { id: 'a', texto: '$19.000.000' },

                    { id: 'b', texto: '$12.000.000' },

                    { id: 'c', texto: '$7.000.000' },

                    { id: 'd', texto: '$5.000.000' }

                  ].map(opcion => (

                    <button

                      key={opcion.id}

                      onClick={() => handleRespuestaChange('pregunta3', opcion.id)}

                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${

                        mostrarValidacion && respuestasActividad2.pregunta3 === opcion.id

                          ? opcion.id === 'd'

                            ? 'bg-green-100 border-green-600 text-green-900'

                            : 'bg-red-100 border-red-600 text-red-900'

                          : respuestasActividad2.pregunta3 === opcion.id

                          ? 'bg-blue-100 border-blue-600 text-blue-900'

                          : 'bg-white border-neutral-300 hover:border-neutral-500'

                      }`}

                    >

                      <span className="font-semibold">{opcion.id.toUpperCase()})</span> {opcion.texto}

                    </button>

                  ))}

                </div>

                {mostrarValidacion && (

                  <p className={`text-xs mt-2 font-semibold ${errores.act2_p3 ? 'text-red-700' : 'text-green-700'}`}>

                    {errores.act2_p3 ? '✗ Incorrecto. La respuesta correcta es D) $5.000.000' : '✓ Correcto'}

                  </p>

                )}

              </div>

            </div>

          </div>

{/* Texto Final */}

          <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6 mb-6">

            <p className="text-sm md:text-base text-neutral-800 leading-relaxed mb-3">

              Es importante tener en cuenta que <strong>la contabilidad es esencial</strong> porque organiza y revela la información financiera que permite comprender la situación real de una empresa para tomar mejores decisiones. Gracias a ella, los recursos se controlan y las decisiones se sustentan en datos confiables. Sin contabilidad, la gestión sería improvisada y la sostenibilidad empresarial estaría en riesgo, lo que puede generar desfalcos y pérdidas.

            </p>

            <p className="text-sm md:text-base text-neutral-800 leading-relaxed mb-3">

              Después de conocer aspectos de la educación contable, se puede aplicar de manera sencilla en el negocio y conocer los activos, pasivos y patrimonio que esta posee.

            </p>

            <p className="text-sm md:text-base text-neutral-800 leading-relaxed">

              Con los conocimientos adquiridos sobre la ecuación patrimonial, en la unidad 2 se tratarán temás sobre el <strong>presupuesto de ventas</strong>.

            </p>

          </div>

{/* Botones de Acción */}

          {mostrarValidacion && Object.keys(errores).length > 0 && (

            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">

              <p className="text-red-800 text-sm md:text-base font-semibold mb-2">

                ⚠️ Se encontraron errores en algunas respuestas. Revisa las respuestas marcadas en rojo y corrígelas.

              </p>

              <Button

                onClick={handleReintentar}

                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm"

              >

                Reintentar (Limpiar respuestas incorrectas)

              </Button>

            </div>

          )}

{/* Botones de acción - Siempre visibles */}

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-t-4 border-green-600 pt-6 mt-8 -mx-6 md:-mx-8 px-6 md:px-8 shadow-lg">

            <div className="max-w-5xl mx-auto">

              <p className="text-sm text-neutral-700 mb-4 text-center">

                {validado 

                  ? '✓ Todas las respuestas son correctas. Puedes continuar a la evaluación.'

                  : 'Completa todas las actividades y luego valida tus respuestas.'

                }

              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">

                {mostrarValidacion && Object.keys(errores).length > 0 && (

                  <Button

                    onClick={handleReintentar}

                    variant="outline"

                    className="border-red-600 text-red-600 hover:bg-red-50 px-6 py-4 text-base font-semibold"

                  >

                    Reintentar

                  </Button>

                )}

              <Button

                onClick={handleValidarYContinuar}

                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 flex items-center justify-center gap-2 text-lg font-bold shadow-xl transform hover:scale-105 transition-all"

                size="lg"

              >

                Validar y Continuar a Evaluación

                <ChevronRight className="w-6 h-6" />

              </Button>

              </div>

            </div>

          </div>

        </div>

      </div>

<div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/finanzas/unidad1')}

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

export default FinanzasUnidad1TallerPage;


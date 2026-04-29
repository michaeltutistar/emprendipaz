import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const FinanzasUnidad1DesarrolloPage = () => {

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

          setIsScrolled(window.scrollY > 70);

          ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

useEffect(() => {

    const handleWindowScroll = () => {

      const windowHeight = window.innerHeight;

      const documentHeight = document.documentElement.scrollHeight;

      const scrollTop = window.scrollY;

      const footerEl = document.querySelector('footer');

      const footerTop = footerEl

        ? footerEl.getBoundingClientRect().top + window.scrollY

        : documentHeight - 10;

if (scrollTop + windowHeight >= footerTop) {

        setHasScrolledToBottom(true);

      }

    };

    window.addEventListener('scroll', handleWindowScroll);

    return () => window.removeEventListener('scroll', handleWindowScroll);

  }, []);

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Finanzas y Gestión Empresarial',

          paso_nombre: 'Unidad 1: Fundamentación',

          curso_nombre: 'Finanzas y Gestión Empresarial'

        })

      });

      navigate('/student/finanzas/unidad1/taller');

    } catch (error) {

      console.error("Error al registrar progreso o navegar:", error);

      navigate('/student/finanzas/unidad1/taller');

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

                      Unidad 1 · Fundamentación

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

                onClick={() => navigate('/student/finanzas')}

                className="text-gray-600 hover:text-[#006837] transition-colors"

              >

                Finanzas y Gestión Empresarial

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Estudio de la ecuación patrimonial

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

                onClick={() => navigate('/student/finanzas')}

                className="hover:text-white transition-colors"

              >

                Finanzas y Gestión Empresarial

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 1 · Fundamentación</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <h1

              className="text-white"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Estudio de la ecuación patrimonial · Fundamentación

            </h1>

          </motion.div>

        </div>

{/* Ola inferior */}

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

            Paso 2: Fundamentación

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Debes leer todo el contenido hasta el final para activar el siguiente paso.

            </p>

          </div>

        </div>

{/* Main Content Area */}

        <div className="px-8 py-4 space-y-10 text-neutral-700">

        {/* Fundamentos sobre estudio de la ecuación patrimonial */}

        <section className="space-y-6">

          <h2 className="text-2xl font-bold text-neutral-900">Fundamentos sobre estudio de la ecuación patrimonial</h2>

          <h3 className="text-xl font-semibold text-neutral-900">Definición y componentes</h3>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <p className="text-sm md:text-base mb-4">

              La contabilidad es el proceso que registra, organiza y presenta las operaciones económicas de una entidad para ofrecer información 

              útil en la toma de decisiones. Permite conocer los recursos disponibles, las obligaciones y los resultados de las actividades. 

              Su base es la ecuación patrimonial, que muestra la relación fundamental entre los elementos que componen la situación financiera:

            </p>

<div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-4">

              <p className="text-lg md:text-xl font-bold text-green-900 mb-2">Ecuación Patrimonial</p>

              <p className="text-xl md:text-2xl font-bold text-green-800 text-center">

                Activos = Pasivos + Patrimonio

              </p>

            </div>

<div className="space-y-4 mb-6">

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">

                <p className="text-sm md:text-base">

                  <strong className="text-blue-900">Los activos</strong> representan los bienes y derechos de la empresa.

                </p>

              </div>

<div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">

                <p className="text-sm md:text-base">

                  <strong className="text-red-900">Los pasivos</strong> representan sus deudas.

                </p>

              </div>

<div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">

                <p className="text-sm md:text-base">

                  <strong className="text-purple-900">Patrimonio:</strong> El capital, los aportes o "inversión" de los propietarios.

                </p>

              </div>

            </div>

<p className="text-sm md:text-base mb-4">

              La ecuación patrimonial: <strong>Activos = Pasivos + Patrimonio</strong>, asegura el equilibrio contable y orienta la correcta elaboración de los estados financieros.

            </p>

          </div>

        </section>

{/* Relación entre contabilidad y finanzas */}

        <section className="space-y-6">

          <h3 className="text-xl font-semibold text-neutral-900">Relación entre contabilidad y finanzas</h3>

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <p className="text-sm md:text-base mb-4">

              Se debe reconocer que la contabilidad y las finanzas funcionan como dos piezas inseparables dentro de la gestión empresarial. 

              La relación entre ambas es estructural: las finanzas dependen de la contabilidad para operar correctamente, mientras que la 

              contabilidad adquiere sentido práctico cuando sus datos se utilizan para la toma de decisiones financieras y administrativas.

            </p>

            <p className="text-sm md:text-base mb-4">

              A continuación, se presentan tres argumentos y ejemplos respectivos:

            </p>

<div className="space-y-6">

              {/* Argumento 1 */}

              <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded">

                <h4 className="text-lg font-semibold text-blue-900 mb-3">

                  La contabilidad proporciona la información; las finanzas la interpretan y proyectan

                </h4>

                <p className="text-sm md:text-base mb-3">

                  La contabilidad registra transacciones reales y verificables, generando estados financieros que muestran la situación 

                  financiera de la empresa. Las finanzas toman estos datos para analizar la rentabilidad del capital invertido en el negocio, 

                  liquidez (dinero en caja) y el riesgo, y luego proyectan escenarios futuros.

                </p>

                <p className="text-sm md:text-base mb-3">

                  La contabilidad presenta la información de los bienes de una empresa (activos), sus deudas (pasivos) y los aportes de 

                  capital (patrimonio), con esta información, las finanzas permiten identificar su posición financiera y si existe rentabilidad 

                  al comparar la utilidad del ejercicio o el resultado del ejercicio (ventas – costos – gastos), y con ello conocer si existe 

                  o no una viabilidad financiera.

                </p>

                <div className="bg-white border border-blue-300 p-4 rounded mt-3">

                  <p className="text-sm font-semibold mb-2">Ejemplo:</p>

                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-4">

                    <li>La contabilidad indica que la empresa generó $40,000 de utilidad y tiene $25,000 en caja.</li>

                    <li>Las finanzas analizan si esa utilidad es suficiente para financiar un proyecto de expansión o si conviene buscar capital externo.</li>

                  </ul>

                </div>

              </div>

{/* Argumento 2 */}

              <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded">

                <h4 className="text-lg font-semibold text-green-900 mb-3">

                  La contabilidad mide el desempeño; las finanzas evalúan y optimizan ese desempeño

                </h4>

                <p className="text-sm md:text-base mb-3">

                  La contabilidad informa cuánto ganó la empresa, cuánto gastó, cuánto debe y cuánto posee.

                </p>

                <p className="text-sm md:text-base mb-3">

                  Las finanzas utilizan esa información para responder preguntas clave como:

                </p>

                <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4 mb-3">

                  <li>¿Cómo mejorar las utilidades?</li>

                  <li>¿Es rentable esta línea de productos?</li>

                  <li>¿Qué estructura de costos maximiza el margen?</li>

                </ul>

                <div className="bg-white border border-green-300 p-4 rounded mt-3">

                  <p className="text-sm font-semibold mb-2">Ejemplo:</p>

                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-4">

                    <li>Estado de resultados → muestra que los costos fijos aumentaron un 15%.</li>

                    <li>Decisión financiera → tercerizar parte de la operación o renegociar contratos para mejorar el margen.</li>

                  </ul>

                </div>

              </div>

{/* Argumento 3 */}

              <div className="bg-purple-50 border-l-4 border-purple-600 p-5 rounded">

                <h4 className="text-lg font-semibold text-purple-900 mb-3">

                  La contabilidad muestra la capacidad actual; las finanzas administran la capacidad futura

                </h4>

                <p className="text-sm md:text-base mb-3">

                  El Balance General o Estado de situación financiera revela la posición financiera actual (activos, pasivos, patrimonio).

                </p>

                <p className="text-sm md:text-base mb-3">

                  Las finanzas analizan esa estructura para decidir cómo financiar el crecimiento: con deuda, capital propio o reinvirtiendo utilidades.

                </p>

                <div className="bg-white border border-purple-300 p-4 rounded mt-3">

                  <p className="text-sm font-semibold mb-2">Ejemplo:</p>

                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-4">

                    <li>Contabilidad: la empresa tiene activos por $200,000 y pasivos por $80,000.</li>

                    <li>Finanzas: concluye que hay espacio para adquirir un crédito adicional sin comprometer la solvencia.</li>

                  </ul>

                </div>

              </div>

            </div>

          </div>

        </section>

{/* Lectura Corta */}

        <section className="space-y-6">

          <h3 className="text-xl font-semibold text-neutral-900">Lectura Corta</h3>

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <p className="text-sm md:text-base mb-4 leading-relaxed">

              La contabilidad para empresarios es una herramienta fundamental para el crecimiento sostenible y la toma de decisiones acertadas. 

              Más que cumplir una obligación legal, llevar un control contable adecuado permite visualizar claramente el estado financiero del 

              negocio, facilitando la identificación de oportunidades y riesgos.

            </p>

            <p className="text-sm md:text-base mb-4 leading-relaxed">

              En la práctica, la contabilidad recoge y organiza todas las transacciones económicas: ventas, compras, gastos e inversiones. 

              Esto genera información clave para planificar, controlar y evaluar el desempeño empresarial.

            </p>

            <p className="text-sm md:text-base mb-4 leading-relaxed">

              Además, implementar sistemas simples de registro, como hojas de cálculo o aplicaciones de bajo costo, puede ser suficiente para 

              iniciar un control ordenado. La constancia en la actualización de estos registros evita sorpresas desagradables y facilita la 

              gestión ante entidades fiscales o financieras.

            </p>

            <p className="text-sm md:text-base leading-relaxed">

              Finalmente, la educación contable es un proceso continuo. Aprender a interpretar estados financieros básicos, como el balance o 

              el estado de resultados, empodera a los pequeños empresarios para comunicar su situación económica con confianza y buscar recursos, 

              alianzas o financiamiento. En un entorno empresarial competitivo, la contabilidad es una ventaja estratégica que transforma retos 

              en oportunidades de crecimiento, sea un pequeño o gran negocio.

            </p>

          </div>

        </section>

{/* Estudio de caso */}

        <section className="space-y-6">

          <h2 className="text-2xl font-bold text-neutral-900">Estudio de caso: la tienda "Dulces y Sabor"</h2>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-400 rounded-lg p-6">

            <p className="text-sm md:text-base mb-4">

              A continuación, encontrarás un ejemplo práctico de cómo se aplican los conceptos estudiados en esta primera unidad:

            </p>

            <p className="text-sm md:text-base mb-4">

              La señora Anita abre una tienda de postres llamada <strong>Dulces y Sabor</strong>. Para empezar, aporta $6.000.000 de su propio dinero. 

              Ese es el punto de partida.

            </p>

<div className="space-y-6 mt-6">

              {/* 1. Aporte inicial */}

              <div className="bg-white border-2 border-green-400 p-5 rounded">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">1. Aporte inicial</h4>

                <p className="text-sm md:text-base mb-3">

                  Anita deposita $6.000.000 en la cuenta del negocio.

                </p>

                <div className="bg-green-50 p-4 rounded mb-3">

                  <p className="text-sm font-semibold mb-2">Presentación:</p>

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                    <li>Activo (Banco): $6.000.000</li>

                    <li>Patrimonio (Aporte de Anita): $6.000.000</li>

                  </ul>

                </div>

                <div className="bg-blue-50 p-4 rounded">

                  <p className="text-sm font-semibold mb-2">Ecuación:</p>

                  <p className="text-base md:text-lg font-bold text-center">

                    Activos $6.000.000 = Pasivos $0 + Patrimonio $6.000.000

                  </p>

                </div>

              </div>

{/* 2. Compra de una vitrina */}

              <div className="bg-white border-2 border-blue-400 p-5 rounded">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">2. Compra de una vitrina</h4>

                <p className="text-sm md:text-base mb-3">

                  Compra una vitrina para exhibir postres en $2.000.000.

                </p>

                <div className="bg-neutral-50 p-4 rounded mb-3">

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                    <li>Activo (Vitrina): + $2.000.000</li>

                    <li>Activo (Banco): – $2.000.000</li>

                  </ul>

                </div>

                <div className="bg-blue-50 p-4 rounded">

                  <p className="text-sm font-semibold mb-2">Ecuación sigue igual:</p>

                  <ul className="list-none space-y-1 text-sm md:text-base">

                    <li>Activos totales = 6.000.000</li>

                    <li>Pasivos = 0</li>

                    <li>Patrimonio = 6.000.000</li>

                  </ul>

                </div>

              </div>

{/* 3. Compra de materia prima */}

              <div className="bg-white border-2 border-purple-400 p-5 rounded">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">3. Compra de materia prima</h4>

                <p className="text-sm md:text-base mb-3">

                  Compra ingredientes por $1.000.000.

                </p>

                <div className="bg-neutral-50 p-4 rounded mb-3">

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                    <li>Activo (Inventarios): + $1.000.000</li>

                    <li>Activo (Banco): – $1.000.000</li>

                  </ul>

                </div>

              </div>

{/* Resumen de transacciones */}

              <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Resumen de transacciones</h4>

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse border border-neutral-300 text-sm md:text-base">

                    <thead>

                      <tr className="bg-neutral-100">

                        <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Elemento</th>

                        <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Valor</th>

                      </tr>

                    </thead>

                    <tbody>

                      <tr className="bg-white">

                        <td className="border border-neutral-300 px-4 py-3">Banco</td>

                        <td className="border border-neutral-300 px-4 py-3">$3.000.000 (saldo al restar la compra de vitrina $2.000.000 e inventarios $1.000.000)</td>

                      </tr>

                      <tr className="bg-neutral-50">

                        <td className="border border-neutral-300 px-4 py-3">Vitrina</td>

                        <td className="border border-neutral-300 px-4 py-3">$2.000.000</td>

                      </tr>

                      <tr className="bg-white">

                        <td className="border border-neutral-300 px-4 py-3">Inventarios</td>

                        <td className="border border-neutral-300 px-4 py-3">$1.000.000</td>

                      </tr>

                      <tr className="bg-green-50 font-semibold">

                        <td className="border border-neutral-300 px-4 py-3">Activos Totales</td>

                        <td className="border border-neutral-300 px-4 py-3">$6.000.000</td>

                      </tr>

                      <tr className="bg-white">

                        <td className="border border-neutral-300 px-4 py-3">Pasivos</td>

                        <td className="border border-neutral-300 px-4 py-3">$0</td>

                      </tr>

                      <tr className="bg-purple-50 font-semibold">

                        <td className="border border-neutral-300 px-4 py-3">Patrimonio</td>

                        <td className="border border-neutral-300 px-4 py-3">$6.000.000</td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>

{/* 4. Conclusión */}

              <div className="bg-green-100 border-2 border-green-500 p-5 rounded">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">4. Conclusión</h4>

                <p className="text-sm md:text-base mb-3">

                  Se observó que el dinero cambia de forma (dinero → vitrina → inventarios), el total sigue siendo $6.000.000, porque nada se pierde. 

                  Se cambió a otras cuentas; esta muestra cómo funciona siempre la ecuación:

                </p>

                <p className="text-base md:text-lg font-bold text-green-800 mt-2 text-center">

                  Activos = Pasivos + Patrimonio

                </p>

                <p className="text-base md:text-lg font-bold text-green-800 text-center">

                  6.000.000 = 0 + 6.000.000

                </p>

              </div>

            </div>

          </div>

        </section>

        </div>

{/* Bottom Navigation */}

        <div className="flex justify-end mt-8">

          <div className="relative group">

            <Button

              onClick={handleCompleteStep}

              disabled={!hasScrolledToBottom}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${

                !hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

              }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

{/* Tooltip para botón deshabilitado */}

            {!hasScrolledToBottom && (

              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">

                Debes leer todo el contenido hasta el final para activar el siguiente paso

                <div className="absolute top-full right-4 transform -mt-1">

                  <div className="border-4 border-transparent border-t-neutral-900"></div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

{/* Botón Atrás */}

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

export default FinanzasUnidad1DesarrolloPage;


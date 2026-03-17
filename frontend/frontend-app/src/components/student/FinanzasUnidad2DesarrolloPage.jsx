import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const FinanzasUnidad2DesarrolloPage = () => {

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

          paso_nombre: 'Unidad 2: Fundamentación',

          curso_nombre: 'Finanzas y Gestión Empresarial'

        })

      });

      navigate('/student/finanzas/unidad2/taller');

    } catch (error) {

      console.error("Error al registrar progreso o navegar:", error);

      navigate('/student/finanzas/unidad2/taller');

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

                      Unidad 2 · Fundamentación

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

                onClick={() => navigate('/student/finanzas')}

                className="text-gray-600 hover:text-[#006837] transition-colors"

              >

                Finanzas y Gestión Empresarial

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Preparación de presupuesto de ventas

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

                onClick={() => navigate('/student/finanzas')}

                className="hover:text-white transition-colors"

              >

                Finanzas y Gestión Empresarial

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

            <h1

              className="text-white"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Preparación de presupuesto de ventas · Fundamentación

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

        {/* Fundamentación sobre preparación de presupuesto de ventas */}

        <section className="space-y-6">

          <h2 className="text-2xl font-bold text-neutral-900">PREPARACIÓN DE PRESUPUESTO DE VENTAS</h2>

          <h3 className="text-xl font-semibold text-neutral-900">Fundamentación sobre preparación de presupuesto de ventas</h3>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">¿Qué es un presupuesto de ventas?</h3>

            <p className="text-sm md:text-base mb-4 leading-relaxed">

              Los presupuestos de ventas son instrumentos esenciales de planeación que permiten proyectar, de manera ordenada y cuantificada, los ingresos esperados por la comercialización de bienes o servicios en un periodo específico. Su elaboración parte del análisis histórico de ventas, la identificación de tendencias, la evaluación del entorno económico y la definición de metas estratégicas de la organización. Estos presupuestos establecen volúmenes de venta, precios estimados, canales de distribución y cuotas por territorios o segmentos de mercado.

            </p>

            <p className="text-sm md:text-base mb-4 leading-relaxed">

              La construcción del presupuesto exige integrar información de mercadeo, capacidad productiva y disponibilidad de inventarios, así como políticas de descuento y condiciones comerciales. Además, incorpora supuestos sobre competencia, comportamiento del consumidor y temporadas (fin de año, ingreso a clases) que puedan afectar la demanda.

            </p>

            <p className="text-sm md:text-base mb-6 leading-relaxed">

              Un presupuesto de ventas bien formulado orienta decisiones sobre inventarios, abastecimiento, flujo de caja y necesidades de financiamiento, ya que determina el nivel de ingresos sobre el cual se sustenta el resto del presupuesto empresarial. También facilita la coordinación entre áreas, el control de desviaciones y la adopción de acciones correctivas. En síntesis, constituye una herramienta clave para anticipar escenarios, optimizar recursos y asegurar el cumplimiento de los objetivos comerciales.

            </p>

          </div>

{/* Ejemplo práctico */}

          <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Ejemplo práctico</h3>

            <p className="text-sm md:text-base mb-4">

              El presupuesto de ventas nos permite proyectar las ventas futuras de un producto o servicio, en unidades y en dinero.

            </p>

            <div className="space-y-3 mb-4">

              <p className="text-sm md:text-base"><strong>En unidades:</strong> cuántos productos se venderán.</p>

              <p className="text-sm md:text-base"><strong>En dinero:</strong> cuánto ingresará al negocio por esas ventas.</p>

            </div>

<div className="bg-white border-2 border-blue-300 rounded-lg p-5 mt-4">

              <p className="text-sm md:text-base font-semibold mb-3">Ejemplo:</p>

              <p className="text-sm md:text-base mb-3">

                Si tu emprendimiento se dedica a la venta de camisetas y proyectas vender 100 unidades a $10 dólares cada una, tu presupuesto de ventas mensual sería:

              </p>

              <div className="bg-green-50 border-2 border-green-400 p-4 rounded">

                <p className="text-lg font-bold text-green-900 text-center">

                  100 (unidades) × 10 (precio de la unidad) = 1,000 dólares

                </p>

              </div>

            </div>

          </div>

{/* Utilidades de un presupuesto de ventas */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Utilidades de un presupuesto de ventas</h3>

            <p className="text-sm md:text-base mb-4">

              El presupuesto de ventas en nuestro emprendimiento nos permite:

            </p>

            <ul className="list-disc list-inside space-y-3 text-sm md:text-base ml-4">

              <li><strong>Planificar producción o stock:</strong> evitando quedarse sin productos o tener exceso de inventario.</li>

              <li><strong>Organizar el flujo de caja:</strong> saber cuánto dinero ingresará y cuándo.</li>

              <li><strong>Establecer metas comerciales:</strong> ayuda a motivar al equipo de ventas.</li>

              <li><strong>Tomar decisiones financieras:</strong> evaluar si se necesita financiamiento o inversión adicional.</li>

              <li><strong>Controlar el desempeño:</strong> comparar las ventas reales con las proyectadas permite medir eficiencia.</li>

            </ul>

          </div>

{/* Elementos básicos de un presupuesto de ventas */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Elementos básicos de un presupuesto de ventas</h3>

            <div className="space-y-4">

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Producto o servicio:</strong> identifica qué se va a vender.</p>

              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Periodo de tiempo:</strong> mensual, trimestral o anual, según la planificación.</p>

              </div>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Cantidad estimada de ventas:</strong> basada en datos históricos, tendencias de mercado o expectativas de crecimiento.</p>

              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Precio de venta:</strong> precio unitario del producto o servicio.</p>

              </div>

              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Total proyectado:</strong> unidades × precio = ingresos esperados.</p>

              </div>

            </div>

{/* Ejemplo práctico para un emprendedor de café */}

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-5 mt-6">

              <p className="text-sm md:text-base font-semibold mb-3">Ejemplo práctico para un emprendedor de café:</p>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse border border-neutral-300 text-sm md:text-base">

                  <thead>

                    <tr className="bg-neutral-200">

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Producto</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Unidades proyectadas</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Precio</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Ventas proyectadas</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="bg-white">

                      <td className="border border-neutral-300 px-4 py-3">Café en taza</td>

                      <td className="border border-neutral-300 px-4 py-3">500</td>

                      <td className="border border-neutral-300 px-4 py-3">$2</td>

                      <td className="border border-neutral-300 px-4 py-3">$1,000</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="border border-neutral-300 px-4 py-3">Pastelitos</td>

                      <td className="border border-neutral-300 px-4 py-3">200</td>

                      <td className="border border-neutral-300 px-4 py-3">$3</td>

                      <td className="border border-neutral-300 px-4 py-3">$600</td>

                    </tr>

                    <tr className="bg-green-100 font-semibold">

                      <td className="border border-neutral-300 px-4 py-3">Total</td>

                      <td className="border border-neutral-300 px-4 py-3">-</td>

                      <td className="border border-neutral-300 px-4 py-3">-</td>

                      <td className="border border-neutral-300 px-4 py-3">$1,600</td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>

{/* Cómo estimar las ventas */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Cómo estimar las ventas</h3>

            <p className="text-sm md:text-base mb-4">

              Para un emprendedor, los métodos más sencillos son:

            </p>

            <div className="space-y-4 mb-6">

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Basado en histórico:</strong> si vendiste 100 unidades el más pasado, proyecta un ligero crecimiento.</p>

              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Basado en capacidad de producción o stock:</strong> cuántos productos puedes fabricar o adquirir.</p>

              </div>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">

                <p className="text-sm md:text-base"><strong>Basado en mercado:</strong> estimando la demanda potencial según clientes o tendencias.</p>

              </div>

            </div>

<div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-lg p-5">

              <p className="text-sm md:text-base font-semibold mb-3">Ejemplo:</p>

              <p className="text-sm md:text-base mb-3">

                Si vendiste 100 refrescos el más pasado y esperas un 10% más por promoción, tu proyección será:

              </p>

              <div className="bg-white border-2 border-green-300 p-4 rounded">

                <p className="text-lg font-bold text-green-900 text-center">

                  100 × 1.10 = 110 unidades

                </p>

              </div>

            </div>

          </div>

{/* Consejos prácticos para emprendedores */}

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Consejos prácticos para emprendedores</h3>

            <ul className="list-disc list-inside space-y-3 text-sm md:text-base ml-4">

              <li>Sé realista, mejor subestimar que sobreestimar ventas.</li>

              <li>Actualiza el presupuesto cada más para ajustarte a la realidad.</li>

              <li>Usa el presupuesto como herramienta de control, no solo como plan.</li>

              <li>Relaciónalo con inventario y flujo de caja, así sabes cuándo comprar y cuánto dinero tendrás disponible.</li>

            </ul>

          </div>

{/* Conclusión */}

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-400 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Conclusión</h3>

            <p className="text-sm md:text-base leading-relaxed">

              El presupuesto de ventas es la base de toda planificación empresarial. Para un emprendedor, es la forma más simple de prever ingresos, organizar recursos y tomar decisiones informadas. No necesitas fórmulas complicadas: conociendo tus productos, precios y clientes, puedes proyectar ventas y usar esa información para crecer de manera ordenada y segura.

            </p>

          </div>

        </section>

{/* Estudio de caso */}

        <section className="space-y-6">

          <h2 className="text-2xl font-bold text-neutral-900">Estudio de caso: presupuesto de ventas para un pequeño negocio</h2>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-400 rounded-lg p-6">

            <p className="text-sm md:text-base mb-4">

              A continuación, vamos a estudiar un caso empresarial donde podremos evidenciar como se aplica la proyección de ventas.

            </p>

<div className="bg-white border-2 border-orange-300 rounded-lg p-5 mb-6">

              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Contexto del caso:</h3>

              <p className="text-sm md:text-base mb-3">

                Juanita tiene una tienda de bebidas enlatadas y papas "pobres". Quiere proyectar sus ventas para el próximo más, para saber cuánto producto comprar y cuánto dinero podría ingresar.

              </p>

              <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-4">

                <li><strong>Productos:</strong> refrescos en lata y bolsas de papas "pobres"</li>

                <li><strong>Precio por refresco:</strong> $2.000</li>

                <li><strong>Precio por bolsa de papas "pobres":</strong> $2.000</li>

              </ul>

            </div>

{/* A. Datos históricos */}

            <div className="mb-6">

              <h4 className="text-lg font-semibold text-neutral-900 mb-3">A. Datos históricos de ventas (último más)</h4>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse border border-neutral-300 text-sm md:text-base">

                  <thead>

                    <tr className="bg-neutral-200">

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Producto</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Unidades vendidas</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="bg-white">

                      <td className="border border-neutral-300 px-4 py-3">Refrescos</td>

                      <td className="border border-neutral-300 px-4 py-3">300</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="border border-neutral-300 px-4 py-3">Papas</td>

                      <td className="border border-neutral-300 px-4 py-3">150</td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

{/* B. Supuesta para el presupuesto */}

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-6">

              <h4 className="text-lg font-semibold text-blue-900 mb-2">B. Supuesta para el presupuesto</h4>

              <p className="text-sm md:text-base">

                Juanita espera un incremento del 10%, porque habrá más clientes en su población por unas obras cercanas.

              </p>

            </div>

{/* C. Presupuesto de ventas */}

            <div className="mb-6">

              <h4 className="text-lg font-semibold text-neutral-900 mb-3">C. Presupuesto de ventas</h4>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse border border-neutral-300 text-sm md:text-base">

                  <thead>

                    <tr className="bg-neutral-200">

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Producto</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Ventas estimadas (unidades)</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Precio</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Ventas estimadas ($)</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="bg-white">

                      <td className="border border-neutral-300 px-4 py-3">Refrescos</td>

                      <td className="border border-neutral-300 px-4 py-3">300 × 1.10 = 330</td>

                      <td className="border border-neutral-300 px-4 py-3">$2000</td>

                      <td className="border border-neutral-300 px-4 py-3">$660.000</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="border border-neutral-300 px-4 py-3">Papas</td>

                      <td className="border border-neutral-300 px-4 py-3">150 × 1.10 = 165</td>

                      <td className="border border-neutral-300 px-4 py-3">$2000</td>

                      <td className="border border-neutral-300 px-4 py-3">$330.000</td>

                    </tr>

                    <tr className="bg-green-100 font-semibold">

                      <td className="border border-neutral-300 px-4 py-3">Total</td>

                      <td className="border border-neutral-300 px-4 py-3">-</td>

                      <td className="border border-neutral-300 px-4 py-3">-</td>

                      <td className="border border-neutral-300 px-4 py-3">$990.000</td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

{/* D. Interpretación del ejercicio */}

            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-5">

              <h4 className="text-lg font-semibold text-green-900 mb-3">D. Interpretación del ejercicio</h4>

              <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-4">

                <li>Juanita sabe que debe comprar suficiente stock: 330 refrescos y 165 bolsas de papas.</li>

                <li>Espera ingresos aproximados de $990.000</li>

                <li>Le sirve para planear su flujo de caja y decidir si necesita más ayuda en la tienda.</li>

              </ul>

            </div>

{/* Conclusión del caso */}

            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-5 mt-6">

              <h4 className="text-lg font-semibold text-blue-900 mb-3">Conclusión</h4>

              <p className="text-sm md:text-base">

                Este presupuesto de ventas no necesita fórmulas complejas: solo se multiplica lo que vendiste antes por un factor de crecimiento esperado. Es una herramienta práctica y rápida para organizar compras, definir metas de venta y planificar el dinero que ingresará al negocio.

              </p>

            </div>

          </div>

        </section>

        </div>

{/* Bottom Navigation */}        {/* Bottom Navigation */}

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

          onClick={() => navigate('/student/finanzas/unidad2')}

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

export default FinanzasUnidad2DesarrolloPage;


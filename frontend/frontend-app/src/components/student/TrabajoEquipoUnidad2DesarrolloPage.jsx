import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const TrabajoEquipoUnidad2DesarrolloPage = () => {

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

    const handleWindowScroll = () => {

      setIsScrolled(window.scrollY > 100);

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

          modulo_nombre: 'Trabajo en Equipo',

          paso_nombre: 'Unidad 2: Fundamentación',

          curso_nombre: 'Trabajo en Equipo'

        })

      });

      navigate('/student/trabajo-equipo/unidad2/taller');

    } catch (error) {

      console.error("Error al registrar progreso o navegar:", error);

      navigate('/student/trabajo-equipo/unidad2/taller');

    }

  };

const elementos5W2H = [

    { elemento: 'What', pregunta: '¿Qué se va a hacer?', descripcion: 'Define la acción o actividad a realizar' },

    { elemento: 'Why', pregunta: '¿Por qué se hace?', descripcion: 'Establece el motivo o razón de la actividad' },

    { elemento: 'Where', pregunta: '¿Dónde se hará?', descripcion: 'Especifica el lugar o ubicación' },

    { elemento: 'When', pregunta: '¿Cuándo se hará?', descripcion: 'Determina el momento o fecha' },

    { elemento: 'Who', pregunta: '¿Quién lo hará?', descripcion: 'Identifica la persona o equipo responsable' },

    { elemento: 'How', pregunta: '¿Cómo se hará?', descripcion: 'Describe el método o proceso' },

    { elemento: 'How much', pregunta: '¿Cuánto costará?', descripcion: 'Establece el presupuesto o costo' }

  ];

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

                      Trabajo en Equipo

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 2 · Fundamentación

                    </p>

                  </div>

                </motion.div>

              )}

{/* Menú de usuario - Derecha */}

              <div className="flex justify-end">

                <div className="relative z-[10000]">

                  <button

                    onClick={() => setUserMenuOpen(!userMenuOpen)}

                    className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-[10000]"

                  >

                    {fotoPerfilUrl ? (

                      <img

                        src={fotoPerfilUrl}

                        alt="Foto de perfil"

                        className="w-10 h-10 rounded-full object-cover border-2 border-white/40"

                        onError={(e) => {

                          e.currentTarget.style.display = 'none';

                        }}

                      />

                    ) : (

                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">

                        <span className="text-white font-semibold text-sm">

                          {userName.charAt(0).toUpperCase() || 'U'}

                        </span>

                      </div>

                    )}

                    <ChevronDown className="w-4 h-4 text-white" />

                  </button>

{userMenuOpen && (

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border z-[10001]">

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

              onClick={() => navigate('/student/trabajo-equipo')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Trabajo en Equipo

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Planificación de Actividades · Fundamentación

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

          {/* Title */}

          <motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Trabajo en Equipo

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

              Planificación de Actividades

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

{/* Progress Steps - NO STICKY */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            {/* Progress Line */}

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#006837] to-[#59D22E] z-0"

              initial={{ width: 0 }}

              animate={{ width: '50%' }}

              transition={{ duration: 1 }}

            ></motion.div>

{/* Step 1 - Completado */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#006837] to-[#59D22E] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

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

                className="bg-gradient-to-br from-[#006837] to-[#59D22E] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold"

              >

                2

              </motion.div>

              <p className="text-[10px] text-[#006837] font-bold">Fundamentación</p>

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

        {/* Título con instrucciones al lado */}

        <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6 mb-6">

          <h2

            className="text-[#006837] flex-shrink-0"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: '2.25rem',

              fontWeight: 700,

            }}

          >

            Paso 2: Fundamentación

          </h2>

{/* Instrucciones Paso 2 - Al lado del título */}

          <div className="bg-gradient-to-r from-[#006837]/10 to-[#00844a]/10 border-l-4 border-[#006837] rounded-lg p-3 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-sm">

              <strong>📌 Instrucciones Paso 2:</strong> Lee el contenido de la fundamentación y desplázate hasta el final para activar el siguiente paso.

            </p>

          </div>

        </div>

<div className="space-y-10 text-neutral-700">

          {/* 2.2.1 Fundamentos sobre planificación de actividades */}

          <section className="space-y-6">

            <h2 className="text-2xl font-bold text-neutral-900">2.2.1. Fundamentos sobre planificación de actividades</h2>

{/* ¿Por qué es importante planificar en equipo? */}

            <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">¿Por qué es importante planificar en equipo?</h3>

              <p className="text-sm md:text-base mb-6">

                Planificar en equipo nos garantiza que todos los colaboradores sepan qué se va a hacer, por qué, cómo y quién lo hará.

                Esto evita malos entendidos, mejora la organización en el trabajo y fortalece el compromiso. Cuando se planifica con

                claridad, el equipo de trabajo labora con mayor orden y aprovecha eficientemente los recursos disponibles.

              </p>

<h4 className="text-lg font-semibold text-neutral-900 mb-4">Ventajas de planificar en equipo</h4>

              <p className="text-sm md:text-base mb-3">

                Las principales ventajas que nos ofrece planificar en equipo incluyen:

              </p>

              <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-2">

                <li>

                  <strong>Claridad en los objetivos:</strong> al definir metas de manera conjunta, todos los miembros del equipo comprenden qué se va a hacer, cómo y por qué.

                </li>

                <li>

                  <strong>Mejor coordinación:</strong> la planificación permite anticiparse a los retos y coordinar esfuerzos, evitando duplicidad de tareas y mejorando la eficiencia.

                </li>

                <li>

                  <strong>Fortalecimiento del compromiso:</strong> cuando los colaboradores participan en la planificación, se sienten parte del proceso y aumenta su motivación.

                </li>

                <li>

                  <strong>Optimización de recursos:</strong> una planificación clara ayuda a aprovechar de manera eficiente los recursos disponibles, reduciendo desperdicios y mejorando resultados.

                </li>

                <li>

                  <strong>Prevención de conflictos:</strong> al establecer responsabilidades desde el inicio, se evitan malos entendidos y se mejora la comunicación interna.

                </li>

                <li>

                  <strong>Impulso a la creatividad:</strong> la planificación conjunta abre espacios para que surjan nuevas ideas y soluciones innovadoras.

                </li>

                <li>

                  <strong>Mayor resiliencia:</strong> los equipos que planifican juntos están mejor preparados para adaptarse a cambios y enfrentar imprevistos.

                </li>

              </ul>

            </div>

{/* Conoce la metodología 5W2H */}

            <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Conoce la metodología 5W2H</h3>

              <p className="text-sm md:text-base mb-4">

                Esta metodología nos permite planificar las actividades en equipo de manera simple y funcional, sin requerir de

                conocimientos técnicos. Se implementa mediante 7 interrogantes de la siguiente forma:

              </p>

<div className="overflow-x-auto">

                <table className="w-full border-collapse border border-neutral-300 text-sm md:text-base">

                  <thead>

                    <tr className="bg-neutral-100">

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">ELEMENTO</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">PREGUNTA ORIENTADORA</th>

                    </tr>

                  </thead>

                  <tbody>

                    {elementos5W2H.map((item, index) => (

                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>

                        <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">{item.elemento}</td>

                        <td className="border border-neutral-300 px-4 py-3">{item.pregunta}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </section>

{/* 2.2.2 Estudio de caso */}

          <section className="space-y-6">

            <h2 className="text-2xl font-bold text-neutral-900">2.2.2. Estudio de caso</h2>

            <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <p className="text-sm md:text-base mb-4">

                Vamos a analizar el siguiente caso empresarial donde se aplica la metodología 5W2H:

              </p>

<div className="bg-blue-50 border-l-4 border-blue-600 pl-4 py-3 rounded mb-4">

                <p className="text-sm md:text-base font-semibold text-neutral-900 mb-2">Caso: "Musa eterna"</p>

                <p className="text-sm md:text-base mb-2">

                  Sofía tiene una empresa de cosméticos llamada "Musa eterna". Con la ayuda de su equipo de trabajo han definido que

                  en el día del amor y la amistad van a lanzar una promoción en redes sociales. Para que la actividad se planifique

                  adecuadamente, ha aplicado la metodología 5W2H obteniendo los siguientes resultados:

                </p>

              </div>

<div className="overflow-x-auto">

                <table className="w-full border-collapse border border-neutral-300 text-sm md:text-base">

                  <thead>

                    <tr className="bg-neutral-100">

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">ELEMENTO</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">PREGUNTA ORIENTADORA</th>

                      <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">RESULTADO</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="bg-white">

                      <td className="border border-neutral-300 px-4 py-3 font-semibold">What</td>

                      <td className="border border-neutral-300 px-4 py-3">¿Qué se va a hacer?</td>

                      <td className="border border-neutral-300 px-4 py-3">Publicar una promoción</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="border border-neutral-300 px-4 py-3 font-semibold">Why</td>

                      <td className="border border-neutral-300 px-4 py-3">¿Por qué se hace?</td>

                      <td className="border border-neutral-300 px-4 py-3">Para aumentar las ventas en amor y amistad</td>

                    </tr>

                    <tr className="bg-white">

                      <td className="border border-neutral-300 px-4 py-3 font-semibold">Where</td>

                      <td className="border border-neutral-300 px-4 py-3">¿Dónde se hará?</td>

                      <td className="border border-neutral-300 px-4 py-3">En Instagram y WhatsApp</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="border border-neutral-300 px-4 py-3 font-semibold">When</td>

                      <td className="border border-neutral-300 px-4 py-3">¿Cuándo se hará?</td>

                      <td className="border border-neutral-300 px-4 py-3">El viernes por la tarde</td>

                    </tr>

                    <tr className="bg-white">

                      <td className="border border-neutral-300 px-4 py-3 font-semibold">Who</td>

                      <td className="border border-neutral-300 px-4 py-3">¿Quién lo hará?</td>

                      <td className="border border-neutral-300 px-4 py-3">Camila y Sixto</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="border border-neutral-300 px-4 py-3 font-semibold">How</td>

                      <td className="border border-neutral-300 px-4 py-3">¿Cómo se hará?</td>

                      <td className="border border-neutral-300 px-4 py-3">Con fotos, texto y diseño</td>

                    </tr>

                    <tr className="bg-white">

                      <td className="border border-neutral-300 px-4 py-3 font-semibold">How much</td>

                      <td className="border border-neutral-300 px-4 py-3">¿Cuánto costará?</td>

                      <td className="border border-neutral-300 px-4 py-3">$0 (uso de recursos propios)</td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </section>

        </div>

{/* Next Button */}

        <div className="flex justify-end mt-8">

          <div className="relative group">

            <Button

              onClick={handleCompleteStep}

              disabled={!hasScrolledToBottom}

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${!hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

{/* Tooltip for disabled button */}

            {!hasScrolledToBottom && (

              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">

                Debes desplazarte hasta el final del contenido para activar el siguiente paso

                <div className="absolute top-full right-4 transform -mt-1">

                  <div className="border-4 border-transparent border-t-neutral-900"></div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/trabajo-equipo/unidad2/inicio');

          }}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          Atrás

        </Button>

      </div>

<Footer />

    </div>

  );

};

export default TrabajoEquipoUnidad2DesarrolloPage;


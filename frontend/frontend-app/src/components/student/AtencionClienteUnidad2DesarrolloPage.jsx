import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const AtencionClienteUnidad2DesarrolloPage = () => {

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

          modulo_nombre: 'Atención al Cliente y Resolución de Conflictos',

          paso_nombre: 'Unidad 2: Fundamentación',

          curso_nombre: 'Atención al Cliente'

        })

      });

      navigate('/student/atencion-cliente/unidad2/taller');

    } catch (error) {

      navigate('/student/atencion-cliente/unidad2/taller');

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

                      Atención al Cliente

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 2

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

              Módulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button

              onClick={() => navigate('/student/atencion-cliente')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Atención al Cliente

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Gestión de Quejas y Reclamaciones

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

              MÓDULO: Atención al Cliente y Resolución de Conflictos

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

              Gestión de Quejas y Reclamaciones

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

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#9d24ab]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Debes leer todo el contenido hasta el final para activar el siguiente paso.

            </p>

          </div>

        </div>

{/* Main Content Area */}

        <div className="space-y-10 text-neutral-700">

          <section className="space-y-6">

            <h2 className="text-2xl font-bold text-neutral-900">2.2.1 Fundamentos sobre gestión de quejas y reclamaciones</h2>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Queja vs reclamo</h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">

                  <h4 className="font-semibold text-neutral-900 mb-2">Queja</h4>

                  <p className="text-sm md:text-base mb-2">

                    Expresión de inconformidad menor relacionada con la atención o la experiencia, pero sin solicitud formal de compensación.

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-1">Ejemplo:</p>

                  <p className="text-sm md:text-base italic">"Me atendieron muy tarde"</p>

                  <p className="text-sm md:text-base mt-2">

                    <strong>Finalidad:</strong> Mejorar la calidad del servicio.

                  </p>

                </div>

<div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">

                  <h4 className="font-semibold text-neutral-900 mb-2">Reclamo</h4>

                  <p className="text-sm md:text-base mb-2">

                    Manifestación formal del cliente por el incumplimiento de una promesa, defecto del producto o error

                    en la prestación del servicio, donde espera una solución concreta (cambio, devolución, ajuste).

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-1">Ejemplo:</p>

                  <p className="text-sm md:text-base italic">"El producto llegó dañado y necesito un reemplazo"</p>

                  <p className="text-sm md:text-base mt-2">

                    <strong>Finalidad:</strong> Corregir una falla que afecta el valor recibido.

                  </p>

                </div>

              </div>

<div className="bg-neutral-50 border-l-4 border-neutral-900 pl-4 py-3 rounded">

                <p className="text-sm md:text-base">

                  <strong>En síntesis:</strong> La diferencia entre queja y reclamo está en que los reclamos requieren una acción

                  inmediata, trazabilidad y un cierre formal. Por su parte, las quejas deben ser escuchadas, gestionadas y utilizadas

                  para la mejora.

                </p>

              </div>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Protocolo de atención: Recibir, Verificar, Responder y Cerrar</h3>

              <p className="text-sm md:text-base mb-4">

                El protocolo de atención de quejas y reclamaciones es un conjunto de pasos, lineamientos y buenas prácticas que

                orientan al personal sobre cómo recibir, gestionar, resolver y cerrar las inconformidades expresadas por los

                clientes. Su objetivo es garantizar una atención eficiente, respetuosa, transparente y oportuna, que permita

                recuperar la confianza del cliente, corregir fallas y fortalecer la calidad del servicio.

              </p>

              <p className="text-sm md:text-base mb-4">

                Estos son los 4 pasos del protocolo de atención:

              </p>

<div className="space-y-6">

                <div className="border-l-4 border-green-600 pl-4">

                  <h4 className="font-semibold text-neutral-900 mb-2">1) Paso 1. Recibir</h4>

                  <p className="text-sm md:text-base mb-3">

                    Corresponde al primer contacto con el cliente inconforme. Incluye escuchar activamente,

                    mostrar empatía, permitir que el cliente se exprese sin interrupciones y registrar la información de forma

                    clara y completa.

                  </p>

                  <p className="text-sm md:text-base mb-2 font-semibold">Ejemplo:</p>

                  <p className="text-sm md:text-base italic mb-3">"Gracias por informarnos lo ocurrido. Permítame revisar el caso para darle una solución clara."</p>

                  <p className="text-sm md:text-base font-semibold mb-2">Elementos:</p>

                  <ul className="list-none space-y-1 text-sm md:text-base ml-4">

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">•</span>

                      <span>Saludo respetuoso</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">•</span>

                      <span>Escucha activa</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">•</span>

                      <span>No contradecir ni justificar</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">•</span>

                      <span>Validar la emoción del cliente</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">•</span>

                      <span>Recolectar datos del caso (qué ocurrió, cuándo, cómo y quién participó)</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">•</span>

                      <span>Agradecer la comunicación</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">•</span>

                      <span>mostrar disposición inmediata</span>

                    </li>

                  </ul>

                </div>

<div className="border-l-4 border-blue-600 pl-4">

                  <h4 className="font-semibold text-neutral-900 mb-2">2) Paso 2. Verificar</h4>

                  <p className="text-sm md:text-base mb-3">

                    Implica revisar la información, analizar el caso y confirmar la veracidad de los hechos. El

                    objetivo es entender el origen del problema, evaluar si se trata de una queja o un reclamo, y determinar

                    las acciones necesarias.

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-2">Elementos:</p>

                  <ul className="list-none space-y-1 text-sm md:text-base ml-4">

                    <li className="flex items-start gap-2">

                      <span className="text-blue-600 font-bold mt-1">•</span>

                      <span>Consultar registros, facturas, mensajes o evidencias</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-blue-600 font-bold mt-1">•</span>

                      <span>Revisar políticas y procedimientos del servicio</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-blue-600 font-bold mt-1">•</span>

                      <span>Determinar el nivel de responsabilidad de la empresa</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-blue-600 font-bold mt-1">•</span>

                      <span>Clasificar el tipo de caso y su prioridad</span>

                    </li>

                  </ul>

                </div>

<div className="border-l-4 border-purple-600 pl-4">

                  <h4 className="font-semibold text-neutral-900 mb-2">3) Paso 3. Responder</h4>

                  <p className="text-sm md:text-base mb-3">

                    Es el momento de ofrecer una solución clara, oportuna y ajustada a las políticas de la

                    organización. Incluye comunicar la respuesta de forma profesional y explicar los pasos a seguir.

                  </p>

                  <p className="text-sm md:text-base mb-2 font-semibold">Ejemplo:</p>

                  <p className="text-sm md:text-base italic mb-3">"Hemos verificado su caso y corresponde a un reclamo por falla del producto. Podemos

                    cambiarlo o devolver su dinero. ¿Cuál opción prefiere?"</p>

                  <p className="text-sm md:text-base font-semibold mb-2">Elementos:</p>

                  <ul className="list-none space-y-1 text-sm md:text-base ml-4">

                    <li className="flex items-start gap-2">

                      <span className="text-purple-600 font-bold mt-1">•</span>

                      <span>Dar una solución concreta</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-purple-600 font-bold mt-1">•</span>

                      <span>Explicar con lenguaje claro y respetuoso</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-purple-600 font-bold mt-1">•</span>

                      <span>Evitar tecnicismos o frases que transfieran la culpa al cliente</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-purple-600 font-bold mt-1">•</span>

                      <span>Cumplir los tiempos establecidos</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-purple-600 font-bold mt-1">•</span>

                      <span>Gestionar compensaciones cuando corresponda</span>

                    </li>

                  </ul>

                </div>

<div className="border-l-4 border-orange-600 pl-4">

                  <h4 className="font-semibold text-neutral-900 mb-2">4) Paso 4. Cerrar</h4>

                  <p className="text-sm md:text-base mb-3">

                    Consiste en confirmar que el cliente comprendió la solución, verificar su satisfacción y

                    registrar el caso como finalizado. También incluye agradecer la retroalimentación y dejar constancia para

                    análisis posterior.

                  </p>

                  <p className="text-sm md:text-base mb-2 font-semibold">Ejemplo:</p>

                  <p className="text-sm md:text-base italic mb-3">"Su caso ha sido resuelto. Gracias por darnos la oportunidad de mejorar."</p>

                  <p className="text-sm md:text-base font-semibold mb-2">Elementos:</p>

                  <ul className="list-none space-y-1 text-sm md:text-base ml-4">

                    <li className="flex items-start gap-2">

                      <span className="text-orange-600 font-bold mt-1">•</span>

                      <span>Confirmar que el cliente quedó atendido y satisfecho</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-orange-600 font-bold mt-1">•</span>

                      <span>Registrar el caso</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-orange-600 font-bold mt-1">•</span>

                      <span>Agradecer nuevamente</span>

                    </li>

                  </ul>

                </div>

              </div>

<div className="mt-6 bg-blue-50 border-l-4 border-blue-600 pl-4 py-3 rounded">

                <p className="text-sm md:text-base">

                  <strong>Recuerda:</strong> La comunicación para atender quejas y reclamaciones debe ser profesional, empática, clara y orientada

                  a la solución. Es una de las competencias más importantes en el servicio al cliente, porque un mal manejo puede

                  agravar el conflicto, mientras que una comunicación adecuada puede transformar una situación negativa en una

                  oportunidad de fidelización.

                </p>

              </div>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">2.2.2 Estudio de caso: "Una experiencia que podía perder un cliente… o fidelizarlo"</h3>

              <p className="text-sm md:text-base mb-4">

                A continuación, estudiaremos un caso empresarial donde podremos evidenciar cómo se realiza correctamente la gestión de quejas y reclamaciones:

              </p>

{/* Presentación del caso */}

              <div className="mb-6">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Presentación del caso</h4>

                <p className="text-sm md:text-base mb-3">

                  <strong>Sabores del Valle</strong> es un restaurante especializado en almuerzos ejecutivos, con un alto volumen de ventas en horario laboral. Su modelo de negocio combina atención presencial y pedidos digitales gestionados principalmente a través del canal de WhatsApp, el cual se ha convertido en un punto clave de contacto con el cliente.

                </p>

                <p className="text-sm md:text-base mb-3">

                  La empresa comunica como promesa de valor:

                </p>

                <ul className="list-disc list-inside space-y-1 text-sm md:text-base mb-3 ml-4">

                  <li>Rapidez en la entrega.</li>

                  <li>Calidad constante del producto.</li>

                  <li>Atención personalizada y cercana.</li>

                </ul>

                <p className="text-sm md:text-base">

                  Gran parte de los clientes son profesionales que trabajan en oficinas cercanas, para quienes el tiempo y la confiabilidad del servicio son factores críticos de decisión.

                </p>

              </div>

{/* Descripción del caso */}

              <div className="mb-6">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Descripción del caso</h4>

                <p className="text-sm md:text-base mb-3">

                  Un día, en hora pico (12:30 p. m.), el señor <strong>Andrés López</strong>, cliente frecuente del restaurante desde hace más de un año, realiza un pedido digital para entrega en su oficina. El pedido incluye un menú ejecutivo específico, elegido tanto por razones de tiempo como por preferencia personal.

                </p>

                <div className="bg-blue-50 border-l-4 border-blue-600 pl-4 py-3 rounded mb-4">

                  <p className="text-sm md:text-base font-semibold mb-2">El pedido:</p>

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-2">

                    <li>Llega con 25 minutos de retraso frente al tiempo habitual de entrega.</li>

                    <li>Incluye un producto diferente al solicitado originalmente.</li>

                  </ul>

                </div>

                <p className="text-sm md:text-base mb-3">

                  Ante la situación, el cliente no tiene la posibilidad de devolver el pedido debido a su jornada laboral. Minutos después de recibirlo, decide escribir al canal de WhatsApp del restaurante:

                </p>

                <div className="bg-gray-100 border-l-4 border-gray-400 pl-4 py-3 rounded mb-4 italic">

                  <p className="text-sm md:text-base">

                    "Buenas tardes. Mi pedido llegó tarde y además no es lo que pedí. Siempre compro aquí, pero hoy quedé muy decepcionado."

                  </p>

                </div>

                <p className="text-sm md:text-base mb-3">

                  El mensaje es recibido por un colaborador encargado del canal digital, quien:

                </p>

                <div className="bg-red-50 border-l-4 border-red-600 pl-4 py-3 rounded mb-4">

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-2">

                    <li>Responde 40 minutos después del mensaje inicial.</li>

                    <li>Justifica el retraso argumentando que "había muchos pedidos".</li>

                    <li>No solicita información adicional del pedido.</li>

                    <li>No verifica el error del producto.</li>

                    <li>No ofrece ninguna solución concreta ni alternativa.</li>

                  </ul>

                </div>

                <p className="text-sm md:text-base">

                  La respuesta genera mayor molestia en el cliente, quien insiste en su inconformidad, eleva el tono del mensaje y expresa explícitamente su intención de no volver a comprar en el restaurante.

                </p>

              </div>

{/* Análisis del caso */}

              <div className="mb-6">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Análisis del caso</h4>

<div className="mb-4">

                  <p className="text-sm md:text-base font-semibold mb-2">Identificación del tipo de situación:</p>

                  <p className="text-sm md:text-base mb-3">

                    Desde una perspectiva técnica del servicio al cliente, el caso corresponde a un <strong>reclamo</strong>, debido a:

                  </p>

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base mb-3 ml-4">

                    <li>Incumplimiento en el tiempo de entrega.</li>

                    <li>Error en el producto entregado.</li>

                    <li>Expectativa clara de una solución concreta por parte del cliente.</li>

                  </ul>

                  <p className="text-sm md:text-base">

                    Adicionalmente, el caso incorpora un componente emocional asociado a la experiencia previa positiva, lo que incrementa el nivel de frustración y el riesgo de pérdida del cliente.

                  </p>

                </div>

<div className="mb-4">

                  <p className="text-sm md:text-base font-semibold mb-2">Momentos críticos de decisión:</p>

                  <p className="text-sm md:text-base mb-3">

                    En el desarrollo del caso se identifican al menos cuatro momentos clave donde la empresa pudo intervenir estratégicamente:

                  </p>

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base mb-3 ml-4">

                    <li>La recepción del primer mensaje del cliente.</li>

                    <li>El tiempo de respuesta al canal digital.</li>

                    <li>El contenido y tono del mensaje enviado.</li>

                    <li>La ausencia de cierre y seguimiento del caso.</li>

                  </ul>

                  <p className="text-sm md:text-base">

                    Cada uno de estos momentos representó una oportunidad de recuperación del servicio que no fue aprovechada.

                  </p>

                </div>

<div className="mb-4">

                  <p className="text-sm md:text-base font-semibold mb-2">Errores cometidos por la empresa:</p>

                  <p className="text-sm md:text-base mb-3">

                    Desde un enfoque profesional, los principales errores fueron:

                  </p>

                  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                    <li><strong>Tiempo de respuesta inadecuado:</strong> especialmente en un canal digital de atención inmediata.</li>

                    <li><strong>Falta de empatía:</strong> no darle validación emocional del cliente.</li>

                    <li><strong>Justificación del error:</strong> en lugar de asumir responsabilidad.</li>

                    <li><strong>Ausencia total de solución:</strong> sin compensación o alternativa.</li>

                    <li><strong>No aplicación del protocolo de atención:</strong> (Recibir, Verificar, Responder, Cerrar).</li>

                    <li><strong>No registro del incidente:</strong> lo que impide análisis posterior y mejora del proceso.</li>

                  </ul>

                </div>

              </div>

{/* Propuesta de gestión correcta */}

              <div className="mb-6">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Propuesta de gestión correcta del caso</h4>

<div className="space-y-4">

                  <div className="border-l-4 border-green-600 pl-4">

                    <p className="text-sm md:text-base font-semibold mb-2">Recibir:</p>

                    <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                      <li>Responder oportunamente.</li>

                      <li>Escuchar activamente.</li>

                      <li>Validar la molestia del cliente.</li>

                      <li>Agradecer la comunicación como oportunidad de mejora.</li>

                    </ul>

                  </div>

<div className="border-l-4 border-blue-600 pl-4">

                    <p className="text-sm md:text-base font-semibold mb-2">Verificar:</p>

                    <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                      <li>Revisar el pedido original.</li>

                      <li>Confirmar el tiempo de entrega.</li>

                      <li>Identificar el origen del error.</li>

                      <li>Clasificar correctamente el caso como reclamo.</li>

                    </ul>

                  </div>

<div className="border-l-4 border-purple-600 pl-4">

                    <p className="text-sm md:text-base font-semibold mb-2">Responder:</p>

                    <p className="text-sm md:text-base mb-2">Ofrecer una solución clara y concreta:</p>

                    <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4 mb-2">

                      <li>Reposición inmediata del producto correcto.</li>

                      <li>Devolución parcial o total.</li>

                      <li>Beneficio compensatorio según políticas.</li>

                    </ul>

                    <p className="text-sm md:text-base">

                      Explicar los pasos a seguir y tiempos de respuesta.

                    </p>

                  </div>

<div className="border-l-4 border-orange-600 pl-4">

                    <p className="text-sm md:text-base font-semibold mb-2">Cerrar:</p>

                    <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                      <li>Confirmar que el cliente acepta la solución.</li>

                      <li>Verificar su nivel de satisfacción.</li>

                      <li>Registrar el caso en el sistema.</li>

                      <li>Agradecer la retroalimentación.</li>

                    </ul>

                  </div>

                </div>

              </div>

{/* Aprendizajes del caso */}

              <div className="mb-6">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Aprendizajes del caso</h4>

                <ul className="list-disc list-inside space-y-2 text-sm md:text-base ml-4">

                  <li>Un error en el servicio no necesariamente genera pérdida del cliente; una mala gestión del reclamo sí.</li>

                  <li>El tiempo de respuesta en canales digitales es parte fundamental de la experiencia.</li>

                  <li>La empatía y la solución pesan más que la justificación.</li>

                  <li>Cada reclamo bien gestionado fortalece la relación y la confianza del cliente.</li>

                </ul>

              </div>

{/* Frase de cierre */}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 pl-4 py-4 rounded">

                <p className="text-sm md:text-base font-semibold italic text-neutral-800">

                  "En la experiencia del cliente, no siempre se recuerda el error, pero sí la forma en que fue atendido".

                </p>

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

              Continuar al Taller

              <ChevronRight className="w-5 h-5" />

            </Button>

{/* Tooltip for disabled button */}

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

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/atencion-cliente/unidad2/inicio');

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

export default AtencionClienteUnidad2DesarrolloPage;


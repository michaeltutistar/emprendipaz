import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const AtencionClienteUnidad1DesarrolloPage = () => {

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

          paso_nombre: 'Unidad 1: Fundamentación',

          curso_nombre: 'Atención al Cliente'

        })

      });

      navigate('/student/atencion-cliente/unidad1/taller');

    } catch (error) {

      navigate('/student/atencion-cliente/unidad1/taller');

    }

  };

const pasosCiclo = [

    { numero: 1, nombre: 'Expectativa o búsqueda de información', definicion: 'Antes de interactuar con la empresa, el cliente forma expectativas basadas en publicidad, recomendaciones, experiencias previas o necesidades personales.' },

    { numero: 2, nombre: 'Primer contacto', definicion: 'Es el momento en que el cliente se acerca por primera vez al negocio, ya sea de manera presencial, telefónica o digital.' },

    { numero: 3, nombre: 'Recepción y bienvenida', definicion: 'El cliente es atendido, saludado y orientado. Esta etapa marca la calidad del trato y define el tono de toda la experiencia.' },

    { numero: 4, nombre: 'Identificación de necesidades', definicion: 'El colaborador escucha, pregunta y comprende qué necesita realmente el cliente.' },

    { numero: 5, nombre: 'Propuesta de solución', definicion: 'El personal ofrece opciones claras y explica las alternativas disponibles según la necesidad del cliente.' },

    { numero: 6, nombre: 'Prestación o ejecución del servicio', definicion: 'Se realiza el servicio o se entrega el producto. Aquí se evalúa la eficiencia, la calidad, la precisión y la experiencia general.' },

    { numero: 7, nombre: 'Verificación y ajuste', definicion: 'Se confirma que el cliente recibió exactamente lo solicitado y se ajusta cualquier detalle si es necesario.' },

    { numero: 8, nombre: 'Despedida y cierre de atención', definicion: 'Se finaliza la interacción con cortesía, agradecimiento y una invitación a regresar. Una buena despedida deja una impresión positiva duradera.' },

    { numero: 9, nombre: 'Seguimiento', definicion: 'En muchos servicios, es clave hacer seguimiento para asegurar satisfacción, corregir fallas y fortalecer la relación con el cliente.' },

    { numero: 10, nombre: 'Retroalimentación del cliente', definicion: 'El cliente evalúa la experiencia y puede dar comentarios, quejas, sugerencias o recomendaciones.' },

    { numero: 11, nombre: 'Post-servicio o acompañamiento', definicion: 'Incluye garantías, soporte, gestión de dudas posteriores y comunicación proactiva. Este paso ayuda a consolidar la fidelización.' }

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

                      Unidad 1

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

              onClick={() => navigate('/student/atencion-cliente')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Atención al Cliente

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Ciclo del Servicio

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

              Ciclo del Servicio

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

            <h2 className="text-2xl font-bold text-neutral-900">1.2.1 Fundamentos sobre Ciclo del servicio</h2>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Atención al cliente y su importancia</h3>

              <p className="text-sm md:text-base leading-relaxed">

                La Atención al Cliente es el conjunto de acciones y estrategias que una empresa o institución implementa para

                asistir, orientar y resolver las necesidades, dudas o problemas de sus clientes, antes, durante y después de la

                compra de un producto o servicio.

              </p>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Importancia de la atención al cliente para emprendedores</h3>

              <p className="text-sm md:text-base mb-4">

                En los emprendimientos, donde los recursos son limitados y la competencia es alta, la atención al cliente se

                convierte en una ventaja competitiva muy importante, ya que:

              </p>

              <ul className="list-none space-y-2 text-sm md:text-base">

                <li className="flex items-start gap-2">

                  <span className="text-green-600 font-bold mt-1">✓</span>

                  <span>Genera confianza y credibilidad</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-green-600 font-bold mt-1">✓</span>

                  <span>Aumenta la posibilidad de recompra</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-green-600 font-bold mt-1">✓</span>

                  <span>Reduce costos de marketing, ya que la recomendación boca a boca es determinante</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-green-600 font-bold mt-1">✓</span>

                  <span>Facilita la fidelización del cliente</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-green-600 font-bold mt-1">✓</span>

                  <span>Permite diferenciarse de la competencia</span>

                </li>

              </ul>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Conoce el ciclo del servicio</h3>

              <p className="text-sm md:text-base mb-4">

                El ciclo del servicio es la secuencia completa de interacciones, percepciones y procesos que un cliente experimenta

                antes, durante y después de recibir un servicio.

              </p>

              <p className="text-sm md:text-base mb-4">

                En la siguiente tabla encontrarás los pasos del ciclo del servicio y su definición:

              </p>

<div className="overflow-x-auto">

                <table className="min-w-full border border-neutral-300 rounded-lg text-sm">

                  <thead className="bg-neutral-900 text-white">

                    <tr>

                      <th className="px-4 py-3 text-left border border-neutral-300">Pasos del Ciclo del Servicio</th>

                      <th className="px-4 py-3 text-left border border-neutral-300">Definición</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-neutral-200">

                    {pasosCiclo.map((paso, index) => (

                      <tr key={paso.numero} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>

                        <td className="px-4 py-3 font-semibold border border-neutral-300">{paso.numero}. {paso.nombre}</td>

                        <td className="px-4 py-3 border border-neutral-300">{paso.definicion}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Momentos de verdad</h3>

              <p className="text-sm md:text-base mb-4">

                Los momentos de verdad son aquellos instantes del ciclo del servicio en los que el cliente entra en contacto directo

                o indirecto con la empresa y forma una percepción inmediata sobre la calidad del servicio. En estos momentos,

                cada interacción por pequeña que parezca, tiene el poder de fortalecer o deteriorar la relación con el cliente, ya

                que es evaluada de manera consciente o inconsciente.

              </p>

              <p className="text-sm md:text-base mb-4">Estos son algunos ejemplos de momentos de verdad:</p>

              <ul className="list-none space-y-2 text-sm md:text-base">

                <li className="flex items-start gap-2">

                  <span className="text-blue-600 font-bold mt-1">✓</span>

                  <span>Un saludo</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-blue-600 font-bold mt-1">✓</span>

                  <span>Una respuesta en redes</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-blue-600 font-bold mt-1">✓</span>

                  <span>La entrega del producto</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-blue-600 font-bold mt-1">✓</span>

                  <span>La gestión de un reclamo</span>

                </li>

                <li className="flex items-start gap-2">

                  <span className="text-blue-600 font-bold mt-1">✓</span>

                  <span>La manera de explicar precios o disponibilidad</span>

                </li>

              </ul>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">1.2.2 Estudio de caso: "Eco-Ágil"</h3>

              <p className="text-sm md:text-base mb-4">

                A continuación, vamos a analizar un caso de un emprendimiento donde se evidencia cómo se desarrolla el ciclo del servicio

                en una versión simplificada:

              </p>

              <p className="text-sm md:text-base mb-4 font-semibold">

                La empresa de mensajería "Eco-Ágil" en Pasto, ofrece entregas rápidas en bicicleta y moto con enfoque ecológico. Su éxito

                depende de la experiencia que viven los clientes en cada interacción.

              </p>

<div className="overflow-x-auto mt-6">

                <table className="min-w-full border border-neutral-300 rounded-lg text-sm">

                  <thead className="bg-neutral-900 text-white">

                    <tr>

                      <th className="px-4 py-3 text-left border border-neutral-300">Ciclo del Servicio</th>

                      <th className="px-4 py-3 text-left border border-neutral-300">Situación Práctica en Eco-Ágil</th>

                      <th className="px-4 py-3 text-left border border-neutral-300">Impacto en el Cliente</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-neutral-200">

                    <tr className="bg-neutral-50">

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Primer contacto</td>

                      <td className="px-4 py-3 border border-neutral-300">Un cliente ve en redes sociales un anuncio de Eco-Ágil con mensajes claros: "Entrega segura, rápida y ecológica". El diseño es atractivo y transmite confianza.</td>

                      <td className="px-4 py-3 border border-neutral-300">El cliente percibe profesionalismo y decide probar el servicio.</td>

                    </tr>

                    <tr>

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Propuesta de solución</td>

                      <td className="px-4 py-3 border border-neutral-300">El cliente llama para pedir una entrega. La asesora responde con amabilidad, explica tarifas y tiempos con claridad, y ofrece opciones según la urgencia.</td>

                      <td className="px-4 py-3 border border-neutral-300">El cliente siente que lo escuchan y que sus necesidades son comprendidas.</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Prestación o ejecución del servicio</td>

                      <td className="px-4 py-3 border border-neutral-300">El mensajero llega puntual, vestido con uniforme limpio y con una sonrisa. Verifica el paquete y confirma la dirección antes de salir.</td>

                      <td className="px-4 py-3 border border-neutral-300">El cliente percibe seriedad y seguridad, aumenta su confianza en la empresa.</td>

                    </tr>

                    <tr>

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Seguimiento</td>

                      <td className="px-4 py-3 border border-neutral-300">Durante el trayecto, el cliente recibe un mensaje de WhatsApp con el estado de la entrega y una foto al recibir el paquete.</td>

                      <td className="px-4 py-3 border border-neutral-300">El cliente se siente informado y tranquilo, lo que refuerza la satisfacción.</td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Post-servicio o acompañamiento</td>

                      <td className="px-4 py-3 border border-neutral-300">Al finalizar, Eco-Ágil envía un breve mensaje de agradecimiento y un enlace para calificar la experiencia.</td>

                      <td className="px-4 py-3 border border-neutral-300">El cliente se siente valorado y con poder de opinar, lo que aumenta la fidelidad.</td>

                    </tr>

                  </tbody>

                </table>

              </div>

<div className="mt-6 bg-blue-50 border-l-4 border-blue-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">Conclusiones del caso:</h4>

                <ul className="list-none space-y-2 text-sm md:text-base">

                  <li className="flex items-start gap-2">

                    <span className="text-blue-600 font-bold mt-1">✓</span>

                    <span>Cada interacción, por pequeña que sea, construye o destruye la percepción del cliente.</span>

                  </li>

                  <li className="flex items-start gap-2">

                    <span className="text-blue-600 font-bold mt-1">✓</span>

                    <span>Los momentos de verdad no dependen solo del producto, sino de la comunicación, actitud y consistencia en el servicio.</span>

                  </li>

                  <li className="flex items-start gap-2">

                    <span className="text-blue-600 font-bold mt-1">✓</span>

                    <span>En este ejemplo, Eco-Ágil logra que un cliente nuevo se convierta en cliente recurrente gracias a la suma de experiencias positivas.</span>

                  </li>

                </ul>

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

            navigate('/student/atencion-cliente/unidad1/inicio');

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

export default AtencionClienteUnidad1DesarrolloPage;


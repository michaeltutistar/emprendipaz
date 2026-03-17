import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const MarketingDigitalUnidad1DesarrolloPage = () => {

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

          modulo_nombre: 'Marketing Digital',

          paso_nombre: 'Unidad 1: Fundamentación',

          curso_nombre: 'Marketing Digital'

        })

      });

      navigate('/student/marketing-digital/unidad1/taller');

    } catch (error) {

      navigate('/student/marketing-digital/unidad1/taller');

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

            style={{ background: 'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)' }}

            animate={{

              background: [

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 30% 70%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 70% 30%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

              ],

            }}

            transition={{ duration: 15, ease: 'easeInOut', repeat: Infinity }}

          />

<div className="absolute inset-0 flex items-center justify-center" style={{ mixBlendMode: 'overlay', opacity: 0.4 }}>

            <img src="https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png" alt="" className="w-[160%] h-auto object-cover" />

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

                <motion.div className="flex items-center justify-start" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>

                  <img src="/formacion.png" alt="Formación Logo" onClick={() => navigate(`/student/dashboard`)} className="h-10 w-auto object-contain drop-shadow-2xl cursor-pointer hover:opacity-80" style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }} />

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

                      Marketing Digital

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

              <button onClick={() => navigate('/student/dashboard')} className="text-gray-600 hover:text-[#006837] transition-colors flex items-center gap-1">

                <Home className="w-3.5 h-3.5" />

                Inicio

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/modulos')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Modulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/marketing-digital')} className="text-gray-600 hover:text-[#006837] transition-colors">

                Marketing Digital

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Diagnóstico de Presencia Digital

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

              MÓDULO: Marketing Digital

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

              Diagnóstico de Presencia Digital

            </h1>

          </motion.div>

        </div>

{/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z" fill="white"/>

          </svg>

        </div>

      </section>

{/* Progress Steps - STICKY */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#AA27B9] to-[#d946ef] z-0" initial={{ width: 0 }} animate={{ width: '50%' }} transition={{ duration: 1 }}></motion.div>

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                1

              </div>

              <p className="text-[10px] text-gray-500">Presentación</p>

            </div>

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                2

              </motion.div>

              <p className="text-[10px] text-[#AA27B9] font-bold">Fundamentación</p>

            </div>

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-400 mb-0.5">Paso</p>

              <div className="bg-gray-200 text-gray-500 rounded-full w-6 h-6 flex items-center justify-center mb-0.5 text-xs font-bold">

                3

              </div>

              <p className="text-[10px] text-gray-500">Taller</p>

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

        <div className="space-y-10 text-neutral-700">

        {/* 1.2.2 Contenidos sobre diagnóstico de presencia digital */}

        <section className="space-y-6">

          <h2 className="text-2xl font-bold text-neutral-900">1.2.2 Contenidos sobre diagnóstico de presencia digital</h2>

{/* ¿Qué es un diagnóstico de presencia digital? */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">¿Qué es un diagnóstico de presencia digital?</h3>

            <p className="text-sm md:text-base mb-3">

              Cuando pretendemos formular un plan de marketing digital para nuestro emprendimiento, el punto de partida deberá ser la elaboración de un diagnóstico de presencia digital, reconocido como una evaluación de nuestra presencia online.

            </p>

            <p className="text-sm md:text-base mb-3">

              A través de este ejercicio, lograremos definir qué tan fácil nos resulta establecer conexiones con nuestros clientes a través de los canales digitales, la confiabilidad y pertinencia de la información aquí disponible y, que conceptos tienen acerca de nuestro emprendimiento o de la competencia.

            </p>

            <p className="text-sm md:text-base">

              Finalmente, podremos evaluar aspectos como: la calidad del contenido, frecuencia de publicación y otro tipo de activos como las apps del negocio.

            </p>

          </div>

{/* ¿Qué son los canales digitales? */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">¿Qué son los canales digitales?</h3>

            <p className="text-sm md:text-base mb-4">

              Son los medios que utilizan las organizaciones para comunicarse con su público objetivo a través de plataformas digitales. Estos canales permiten entregar mensajes, promocionar productos o servicios, interactuar con los consumidores y facilitar transacciones en línea.

            </p>

<div className="mt-6">

              <h4 className="text-lg font-semibold text-neutral-900 mb-3">Los canales digitales incluyen:</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">

                  <h5 className="font-semibold text-neutral-900 mb-2">Redes Sociales</h5>

                  <ul className="text-sm space-y-1 text-neutral-700">

                    <li>• LinkedIn</li>

                    <li>• Instagram</li>

                    <li>• Facebook</li>

                    <li>• TikTok</li>

                  </ul>

                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">

                  <h5 className="font-semibold text-neutral-900 mb-2">Correo Electrónico</h5>

                  <ul className="text-sm space-y-1 text-neutral-700">

                    <li>• Gmail</li>

                    <li>• Zoho Campaigns</li>

                  </ul>

                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">

                  <h5 className="font-semibold text-neutral-900 mb-2">Motores de Búsqueda</h5>

                  <ul className="text-sm space-y-1 text-neutral-700">

                    <li>• Google</li>

                    <li>• Bing</li>

                    <li>• DuckDuckgo</li>

                  </ul>

                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">

                  <h5 className="font-semibold text-neutral-900 mb-2">Sitios Web</h5>

                  <ul className="text-sm space-y-1 text-neutral-700">

                    <li>• Ebay</li>

                    <li>• Etsy</li>

                    <li>• Amazon</li>

                  </ul>

                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">

                  <h5 className="font-semibold text-neutral-900 mb-2">Publicidad Basada en la Web</h5>

                  <ul className="text-sm space-y-1 text-neutral-700">

                    <li>• Google Ads</li>

                    <li>• Amazon Ads</li>

                    <li>• Fiverr</li>

                  </ul>

                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">

                  <h5 className="font-semibold text-neutral-900 mb-2">Aplicaciones Móviles</h5>

                  <ul className="text-sm space-y-1 text-neutral-700">

                    <li>• Shopify</li>

                    <li>• Magento</li>

                    <li>• Mercado libre</li>

                  </ul>

                </div>

              </div>

            </div>

          </div>

{/* Los 5 pasos */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Los 5 pasos para que elabores un diagnóstico de presencia digital:</h3>

<div className="space-y-6">

              <div className="border-l-4 border-green-600 pl-4">

                <h4 className="font-semibold text-neutral-900 mb-2">1. Búsqueda en navegadores</h4>

                <p className="text-sm md:text-base">

                  Especialmente para emprendimientos que ya tienen página web, se realiza una búsqueda en un navegador para verificar que la empresa aparezca en un lugar destacado. De este modo, podremos evidenciar que datos de contacto como: dirección, horario de atención y los números estén disponibles y actualizados, certificando que los clientes recibirán información fiable.

                </p>

              </div>

<div className="border-l-4 border-blue-600 pl-4">

                <h4 className="font-semibold text-neutral-900 mb-2">2. Presencia en canales digitales</h4>

                <p className="text-sm md:text-base mb-2">

                  Se evalúa la presencia del emprendimiento en los principales canales digitales, como el sitio web, redes sociales (Facebook, Instagram, TikTok) y Google Maps. Es importante entender, que un negocio no necesariamente debe tener perfiles en todas las redes sociales. Por ejemplo, una agencia de automóviles de lujo probablemente tendrá mayor actividad y concentrará sus esfuerzos de marketing digital en un sitio web, al ofrecer un producto de mayor especialización y que requiere centrar sus esfuerzos en la información y aspectos técnicos. Por otro lado, una tienda que se dedique a vender calzado para dama, probablemente utilice especialmente redes sociales como Facebook e Instagram, las cuales priorizan la visualización del producto y la interacción con públicos más amplios.

                </p>

                <p className="text-sm md:text-base mb-2">

                  En este paso además podremos evaluar la frecuencia y la calidad del contenido compartido en los canales digitales, algunas preguntas orientadoras serían:

                </p>

                <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-4">

                  <li>¿Cada cuánto lo estamos realizando?</li>

                  <li>¿Existe un cronograma para la publicación del contenido?</li>

                  <li>¿El contenido de más canales digitales persiguen un propósito o lo público al azar?</li>

                </ul>

              </div>

<div className="border-l-4 border-purple-600 pl-4">

                <h4 className="font-semibold text-neutral-900 mb-2">3. Evaluación de opiniones</h4>

                <p className="text-sm md:text-base">

                  Se analizan las opiniones que los clientes han compartido en los canales digitales. Por ejemplo, se revisan los comentarios en las publicaciones de redes sociales, las puntuaciones de los usuarios en la página web o en la app del emprendimiento (en caso de tenerla) y las sugerencias en WhatsApp, entre otros. Así podremos medir aspectos importantes como: la calidad de la atención ofrecida al cliente, que tanto impacto positivo está generando el contenido compartido, si los clientes desean hacer compras o agendar citas: ¿Pueden realizarlo de forma eficiente?

                </p>

              </div>

<div className="border-l-4 border-orange-600 pl-4">

                <h4 className="font-semibold text-neutral-900 mb-2">4. Análisis de la competencia</h4>

                <p className="text-sm md:text-base mb-2">

                  Se replican las acciones del punto 3, pero tomando como referencia a la competencia. Se recopilan opiniones de clientes en los canales digitales disponibles, puntuaciones en su página web e incluso se puede buscar información adicional como su misión y visión para conocer su razón de ser y hacia dónde se proyectan. De esta manera, se pueden encontrar aspectos que los clientes valoran y replicarlos, como, por ejemplo, entregas inmediatas, buena atención, respuestas rápidas en WhatsApp, atributos que más valoran en los productos, etc.

                </p>

                <p className="text-sm md:text-base">

                  El análisis de la competencia nos permite identificar buenas prácticas que son valoradas en el mercado, pero también nos puede mostrar oportunidades que aún no han sido aprovechadas. Por ejemplo, en el análisis de las opiniones en el sitio web de una empresa de comidas rápidas, se pudo identificar que sus clientes se muestran satisfechos con los productos, pero no con la manera en cómo son empacados, aquí se ha identificado una oportunidad de hacer algo mejor que la competencia y que el mercado lo valora como un plus.

                </p>

              </div>

<div className="border-l-4 border-red-600 pl-4">

                <h4 className="font-semibold text-neutral-900 mb-2">5. Definir acciones de mejora</h4>

                <p className="text-sm md:text-base">

                  Se establecen acciones para mejorar algún aspecto de la presencia digital. Por ejemplo, si se encontró que la empresa no ha actualizado su información de contacto en Facebook (dirección, número de WhatsApp), se define que se deben actualizar los datos disponibles para el cliente. Si identifique que mi contenido es escaso y no genera interés, probablemente tendré que establecer objetivos claros para que este contenido persiga una meta.

                </p>

              </div>

            </div>

          </div>

{/* Estudio de caso */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">1.2.3 Estudio de caso: diagnóstico de presencia digital de "Paisaje de Madera"</h3>

            <p className="text-sm md:text-base mb-4">

              A continuación, encontrarás un ejemplo práctico de cómo se elabora un diagnóstico de presencia digital:

            </p>

            <p className="text-sm md:text-base mb-4 font-semibold">

              La empresa de muebles "Paisaje de Madera" ha decidido realizar su diagnóstico de presencia digital y ha obtenido los siguientes resultados:

            </p>

<div className="space-y-4">

              <div className="bg-neutral-50 border-l-4 border-green-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">1. Búsqueda en navegadores:</h4>

                <p className="text-sm md:text-base">

                  Al buscar el nombre del negocio en Google, se encontró que aparece en la tercera página de resultados, mucho más lejos de lo esperado. Al ingresar a la página, se evidenció que no hay dirección del establecimiento y los datos de contacto corresponden a un número de celular en desuso, además la velocidad de carga de la página es baja y resulta confuso entender las secciones que la componen.

                </p>

              </div>

<div className="bg-neutral-50 border-l-4 border-blue-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">2. Presencia en canales digitales:</h4>

                <p className="text-sm md:text-base">

                  Revisando las principales redes sociales, se descubrió que la empresa no cuenta con un perfil en TikTok. La página de Facebook no ha tenido publicaciones en los últimes dos meses, y la página de Instagram tiene como nombre "Paisaje de madera12345", lo que dificulta que los clientes puedan encontrar el perfil.

                </p>

              </div>

<div className="bg-neutral-50 border-l-4 border-purple-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">3. Evaluación de opiniones:</h4>

                <p className="text-sm md:text-base">

                  En el perfil de Facebook, se encontraron comentarios de clientes solicitando un contacto de WhatsApp para pedir información. Además, hay comentarios que muestran inconformidad porque, a pesar de solicitar información en las publicaciones, no existe respuesta por parte de la empresa.

                </p>

              </div>

<div className="bg-neutral-50 border-l-4 border-orange-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">4. Análisis de la competencia:</h4>

                <p className="text-sm md:text-base mb-2">

                  Se visitaron la página web y las redes sociales del competidor más directo, "Mueblería Plus". Se encontró que su página web obtiene un 90% de calificaciones de 5 estrellas, con comentarios positivos como: "La madera con la que están fabricados los muebles es de alta calidad, 100% satisfecho". Por otra parte, en Facebook e Instagram, sus clientes valoran como punto favorable la atención inmediata y la información oportuna. Además, según los comentarios, los clientes también aprecian la buena atención en el punto de venta.

                </p>

                <p className="text-sm md:text-base font-semibold">

                  Con base en el análisis de la competencia, se concluye que los clientes valoran los buenos materiales, la atención oportuna en los canales digitales y una excelente atención en el punto de venta.

                </p>

              </div>

<div className="bg-neutral-50 border-l-4 border-red-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">5. Definir acciones de mejora:</h4>

                <p className="text-sm md:text-base">

                  Se establecen acciones para mejorar algún aspecto de la presencia digital. Por ejemplo, si se encontró que la empresa no ha actualizado su información de contacto en Facebook (dirección, número de WhatsApp), se define que se deben actualizar los datos disponibles para el cliente. Si identifique que mi contenido es escaso y no genera interés, probablemente tendré que establecer objetivos claros para que este contenido persiga una meta.

                </p>

              </div>

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

              className={`bg-black hover:bg-neutral-800 text-white px-8 py-4 flex items-center gap-2 ${

                !hasScrolledToBottom ? 'opacity-40 cursor-not-allowed' : ''

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

            navigate('/student/marketing-digital/unidad1/inicio');

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

export default MarketingDigitalUnidad1DesarrolloPage;


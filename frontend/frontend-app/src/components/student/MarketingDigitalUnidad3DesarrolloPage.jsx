import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, TrendingUp, DollarSign, Sparkles, Users, MessageCircle, RefreshCw, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const MarketingDigitalUnidad3DesarrolloPage = () => {

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

          paso_nombre: 'Unidad 3: Fundamentación',

          curso_nombre: 'Marketing Digital'

        })

      });

      navigate('/student/marketing-digital/unidad3/taller');

    } catch (error) {

      navigate('/student/marketing-digital/unidad3/taller');

    }

  };

const ventajas = [

    {

      id: 1,

      titulo: 'Medición en tiempo real',

      descripcion: 'Podemos hacer seguimiento inmediato del rendimiento de nuestras campañas.',

      color: 'bg-yellow-100',

      borderColor: 'border-yellow-500',

      icon: TrendingUp,

      iconColor: 'text-yellow-600'

    },

    {

      id: 2,

      titulo: 'Rentabilidad',

      descripcion: 'Ofrece alternativas más económicas en comparación con los métodos tradicionales.',

      color: 'bg-red-100',

      borderColor: 'border-red-500',

      icon: DollarSign,

      iconColor: 'text-red-600'

    },

    {

      id: 3,

      titulo: 'Visibilidad de la marca',

      descripcion: 'Aumenta el reconocimiento y la posición de la marca en el mercado.',

      color: 'bg-purple-100',

      borderColor: 'border-purple-500',

      icon: Sparkles,

      iconColor: 'text-purple-600'

    },

    {

      id: 4,

      titulo: 'Segmentación precisa',

      descripcion: 'Facilita la identificación y focalización de audiencias específicas.',

      color: 'bg-orange-100',

      borderColor: 'border-orange-500',

      icon: Users,

      iconColor: 'text-orange-600'

    },

    {

      id: 5,

      titulo: 'Interacción directa',

      descripcion: 'Fomenta la comunicación y el compromiso con los clientes.',

      color: 'bg-pink-100',

      borderColor: 'border-pink-500',

      icon: MessageCircle,

      iconColor: 'text-pink-600'

    },

    {

      id: 6,

      titulo: 'Adaptabilidad',

      descripcion: 'Permite ajustes rápidos en respuesta a las tendencias del mercado.',

      color: 'bg-blue-100',

      borderColor: 'border-blue-500',

      icon: RefreshCw,

      iconColor: 'text-blue-600'

    }

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

                      Marketing Digital

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 3

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

                onClick={() => navigate('/student/marketing-digital')}

                className="text-gray-600 hover:text-[#006837] transition-colors"

              >

                Marketing Digital

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Estrategias de Marketing Digital

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

              Estrategias de Marketing Digital

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

        <div className="space-y-10 text-neutral-700">

        {/* 3.2.2 Contenidos sobre estrategias de marketing digital */}

        <section className="space-y-6">

          <h2 className="text-2xl font-bold text-neutral-900">3.2.2 Contenidos sobre estrategias de marketing digital</h2>

{/* ¿Qué es una estrategia de marketing digital? */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">¿Qué es una estrategia de marketing digital?</h3>

            <div className="text-sm md:text-base leading-relaxed space-y-3">

              <p>

                Una estrategia de marketing digital es el plan global que una empresa o emprendimiento diseña para orientar sus acciones en el entorno digital con el fin de alcanzar objetivos de negocio. Se trata de una guía que establece cómo aprovechar las herramientas y plataformas digitales, como: redes sociales, sitios web, buscadores o correo electrónico, para conectar con clientes, aumentar la visibilidad de la marca y generar valor en el mercado.

              </p>

              <p>

                Más que un conjunto de acciones aisladas, la estrategia de marketing digital constituye una ruta coherente y planificada que integra comunicación, promoción y relación con el público en el espacio digital. Su esencia está en definir con claridad hacia dónde se quiere llegar y cómo las acciones digitales contribuyen al crecimiento y la sostenibilidad del emprendimiento.

              </p>

            </div>

          </div>

{/* Infografía: Ventajas de una estrategia de marketing digital */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-6 text-center">Ventajas de una estrategia de marketing digital</h3>

{/* Grid de tarjetas hexagonales */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {ventajas.map((ventaja) => {

                const IconComponent = ventaja.icon;

                return (

                  <div

                    key={ventaja.id}

                    className={`${ventaja.color} ${ventaja.borderColor} border-2 rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}

                  >

                    <div className="flex flex-col items-center text-center space-y-3">

                      <div className={`${ventaja.iconColor} mb-2`}>

                        <IconComponent className="w-12 h-12" />

                      </div>

                      <h4 className="font-bold text-neutral-900 text-lg">{ventaja.titulo}</h4>

                      <p className="text-sm md:text-base text-neutral-700">{ventaja.descripcion}</p>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

{/* Conoce algunas estrategias de marketing digital modernas */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Conoce algunas estrategias de marketing digital modernas</h3>

            <p className="text-sm md:text-base mb-4 text-neutral-700">

              La siguiente tabla nos muestra algunas de las estrategias de marketing digital más utilizadas actualmente:

            </p>

<div className="overflow-x-auto">

              <table className="min-w-full border border-neutral-300 rounded-lg text-sm">

                <thead className="bg-neutral-900 text-white">

                  <tr>

                    <th className="px-4 py-3 text-left border border-neutral-300">Estrategia</th>

                    <th className="px-4 py-3 text-left border border-neutral-300">Definición</th>

                    <th className="px-4 py-3 text-left border border-neutral-300">Cómo se aplica</th>

                    <th className="px-4 py-3 text-left border border-neutral-300">Ejemplo</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-neutral-200">

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3 font-semibold border border-neutral-300">Marketing de influencers</td>

                    <td className="px-4 py-3 border border-neutral-300">Una marca selecciona a una persona popular en el ámbito local, nacional o internacional, para que promocione su producto o servicio.</td>

                    <td className="px-4 py-3 border border-neutral-300">Elegir una celebridad acorde a la actividad del negocio para que figure en un video para redes sociales, un flyer, o un comercial en TV con el producto.</td>

                    <td className="px-4 py-3 border border-neutral-300">Una empresa dedicada a la venta de artículos deportivos contrata a Falcao García para promocionar su nueva marca de guayos.</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold border border-neutral-300">Contenido generado por el cliente</td>

                    <td className="px-4 py-3 border border-neutral-300">Los clientes interactúan constantemente a través de reacciones, emojis, fotografías, reseñas, en redes sociales de la compañía.</td>

                    <td className="px-4 py-3 border border-neutral-300">Lanzar una campaña donde el cliente realice una acción como compartir una fotografía utilizando el producto.</td>

                    <td className="px-4 py-3 border border-neutral-300">Una panadería local ha lanzado un nuevo sabor de torta, ha invitado a que sus clientes compartan en Instagram una fotografía con este producto. La foto con más likes, ganará un premio.</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3 font-semibold border border-neutral-300">Marketing de contenidos</td>

                    <td className="px-4 py-3 border border-neutral-300">Crear y compartir contenido útil para atraer y retener clientes.</td>

                    <td className="px-4 py-3 border border-neutral-300">Publicar blogs, videos o infografías sobre temas relevantes.</td>

                    <td className="px-4 py-3 border border-neutral-300">Una empresa de repostería, anuncia sus productos con videos cortos para TikTok, regalando muestras del mismo en las calles de la ciudad.</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold border border-neutral-300">Publicidad pago</td>

                    <td className="px-4 py-3 border border-neutral-300">Invertir un presupuesto para que algún canal digital promocione el producto.</td>

                    <td className="px-4 py-3 border border-neutral-300">Seleccionar una plataforma como Google, Facebook o Instagram para que muestren anuncios a un grupo de personas específico.</td>

                    <td className="px-4 py-3 border border-neutral-300">Una empresa de ropa ha invertido $100.000 en una campaña en Facebook Ads, para promocionar su oferta de 2*1 en chaquetas para invierno.</td>

                  </tr>

                  <tr className="bg-neutral-50">

                    <td className="px-4 py-3 font-semibold border border-neutral-300">SEO (Optimización en buscadores)</td>

                    <td className="px-4 py-3 border border-neutral-300">Mejora el posicionamiento orgánico en Google y otros buscadores.</td>

                    <td className="px-4 py-3 border border-neutral-300">Crear contenido con palabras clave relevantes para aparecer en búsquedas.</td>

                    <td className="px-4 py-3 border border-neutral-300">Una empresa que vende productos de cuidado capilar, investiga palabras clave y optimiza su sitio web con esas palabras, en títulos, descripciones y contenido.</td>

                  </tr>

                  <tr>

                    <td className="px-4 py-3 font-semibold border border-neutral-300">SEM (Publicidad en buscadores)</td>

                    <td className="px-4 py-3 border border-neutral-300">Campañas pagadas para aparecer en los primeros resultados.</td>

                    <td className="px-4 py-3 border border-neutral-300">Usar Google Ads para promocionar un producto.</td>

                    <td className="px-4 py-3 border border-neutral-300">Una agencia de viajes crea una campaña que se active cuando alguien busque "paquetes de viaje a Cartagena económicos", segmentada para personas entre los 20 a 40 años.</td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

{/* Estudio de caso: LA CUMBRE */}

          <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h3 className="text-xl font-semibold text-neutral-900 mb-4">3.2.3 Estudio de caso: estrategia de marketing digital "LA CUMBRE"</h3>

            <p className="text-sm md:text-base mb-4 text-neutral-700">

              A continuación, encontrarás un ejemplo práctico de cómo se desarrollan estrategias de marketing digital:

            </p>

<div className="space-y-4 mb-6">

              <div className="bg-blue-50 border-l-4 border-blue-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">Diagnóstico de presencia digital - Hallazgos:</h4>

                <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-neutral-700">

                  <li>Sus redes sociales son deficientes de contenido.</li>

                  <li>En el estudio de la competencia se observa que el segmento más fuerte para la venta de este tipo de productos está en los jóvenes entre los 18 a los 25 años.</li>

                  <li>Finalmente se encuentra que la página web de la "CUMBRE" tiene poco posicionamiento en buscadores.</li>

                </ul>

              </div>

<div className="bg-green-50 border-l-4 border-green-600 pl-4 py-3 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">Metas de marketing digital definidas:</h4>

                <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-neutral-700">

                  <li>Publicar contenidos semanales en los canales digitales donde hace presencia la "CUMBRE" para aumentar la interacción de los clientes en un 30% en los próximos 3 meses.</li>

                  <li>Incrementar los clientes jóvenes entre los 18 a los 25 años en un 20% en los próximos 3 meses.</li>

                  <li>Aumentar el tráfico del sitio web de la "CUMBRE" en un 20% en los próximos 3 meses.</li>

                </ul>

              </div>

            </div>

<div className="bg-neutral-50 border-2 border-neutral-300 rounded-lg p-4">

              <h4 className="font-semibold text-neutral-900 mb-3">Estrategias de marketing digital planteadas:</h4>

              <div className="space-y-3 text-sm md:text-base text-neutral-700">

                <div>

                  <p className="font-semibold mb-1">• Marketing de contenidos:</p>

                  <p className="ml-4">Centrándose en compartir Videos, Imágenes, Infografías, etc. que describan los beneficios de realizar deporte y los beneficios que poseen los artículos ofertados por "LA CUMBRE" para el desarrollo de estas actividades. La frecuencia de publicación será de 3 contenidos semanales en los canales digitales disponibles.</p>

                </div>

                <div>

                  <p className="font-semibold mb-1">• Marketing de influencers:</p>

                  <p className="ml-4">Considerando que el segmento más atractivo para la venta de artículos deportivos se encuentra entre los jóvenes de 18 a los 25 años, se realizará una colaboración con un reconocido influencer de la región, organizando un evento de ciclismo el cual es de libre participación. El influencer utilizará indumentaria de la marca "LA CUMBRE", bicicleta de la empresa. De esta manera se dará visibilidad a la marca y se captarán clientes potenciales.</p>

                </div>

                <div>

                  <p className="font-semibold mb-1">• SEO:</p>

                  <p className="ml-4">El contenido de la página web se fortalecerá con palabras clave atractivas para el sector deportivo en pro de mejorar el posicionamiento orgánico en los buscadores.</p>

                </div>

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

            navigate('/student/marketing-digital/unidad3/inicio');

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

export default MarketingDigitalUnidad3DesarrolloPage;


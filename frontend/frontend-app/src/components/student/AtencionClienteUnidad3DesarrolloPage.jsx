import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const AtencionClienteUnidad3DesarrolloPage = () => {

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

          paso_nombre: 'Unidad 3: Fundamentación',

          curso_nombre: 'Atención al Cliente'

        })

      });

      navigate('/student/atencion-cliente/unidad3/taller');

    } catch (error) {

      navigate('/student/atencion-cliente/unidad3/taller');

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

              onClick={() => navigate('/student/atencion-cliente')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Atención al Cliente

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Resolución de Conflictos

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

              Resolución de Conflictos y Manejo de Clientes Difíciles

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

            <h2 className="text-2xl font-bold text-neutral-900">3.2.1 Fundamentos sobre resolución de conflictos y manejo de clientes difíciles</h2>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Canales oficiales de atención a quejas y reclamaciones</h3>

              <p className="text-sm md:text-base mb-4">

                Para garantizar accesibilidad y transparencia, el emprendimiento debe ofrecer canales claros y visibles para recibir

                quejas y reclamaciones. Estos canales deben estar publicados en lugares como la factura, página web, puntos de atención o redes sociales.

              </p>

              <p className="text-sm md:text-base mb-4">

                En la siguiente tabla podrás verificar los canales oficiales recomendados:

              </p>

<div className="overflow-x-auto mt-6">

                <table className="min-w-full border border-neutral-300 rounded-lg text-sm">

                  <thead className="bg-neutral-900 text-white">

                    <tr>

                      <th className="px-4 py-3 text-left border border-neutral-300">CANAL</th>

                      <th className="px-4 py-3 text-left border border-neutral-300">CÓMO HACERLO</th>

                      <th className="px-4 py-3 text-left border border-neutral-300">REQUISITOS DE LOS CANALES</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-neutral-200">

                    <tr className="bg-white">

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Atención presencial</td>

                      <td className="px-4 py-3 border border-neutral-300">

                        • Oficinas o puntos de servicio donde el cliente puede exponer su caso.<br />

                        • Requiere personal capacitado en trato, escucha activa y resolución de conflictos.<br />

                        • Visibles en redes sociales, página web y documentos comerciales.

                      </td>

                      <td className="px-4 py-3 border border-neutral-300">

                        • Fácilmente accesibles para cualquier usuario.<br />

                        • Debidamente monitoreados con tiempos de respuesta establecidos.<br />

                        • Estándares de atención uniformes en todos los canales (protocolo omnicanal).

                      </td>

                    </tr>

                    <tr className="bg-neutral-50">

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Línea telefónica o WhatsApp empresarial</td>

                      <td className="px-4 py-3 border border-neutral-300">

                        • Debe ser una línea exclusiva o prioritaria para servicio al cliente.<br />

                        • WhatsApp permite trazabilidad, envío de evidencia y respuestas rápidas.

                      </td>

                      <td className="px-4 py-3 border border-neutral-300">

                        • Fácilmente accesibles para cualquier usuario.<br />

                        • Debidamente monitoreados con tiempos de respuesta establecidos.<br />

                        • Estándares de atención uniformes en todos los canales (protocolo omnicanal).

                      </td>

                    </tr>

                    <tr className="bg-white">

                      <td className="px-4 py-3 font-semibold border border-neutral-300">Correo electrónico institucional</td>

                      <td className="px-4 py-3 border border-neutral-300">

                        • Debe ser revisado diariamente por personal responsable.<br />

                        • Permite documentación formal, seguimiento y archivo.

                      </td>

                      <td className="px-4 py-3 border border-neutral-300">

                        • Fácilmente accesibles para cualquier usuario.<br />

                        • Debidamente monitoreados con tiempos de respuesta establecidos.<br />

                        • Estándares de atención uniformes en todos los canales (protocolo omnicanal).

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Tipos de clientes difíciles y pautas de actuación</h3>

              <p className="text-sm md:text-base mb-4">

                En los entornos de servicio, especialmente en pequeños negocios y emprendimientos, es habitual enfrentarse a

                clientes cuyo comportamiento presenta retos adicionales para el personal.

              </p>

              <p className="text-sm md:text-base mb-4">

                Estos perfiles, conocidos como clientes difíciles, no deben interpretarse como amenazas, sino como

                oportunidades para demostrar profesionalismo, fortalecer la reputación del negocio y generar aprendizajes

                valiosos para la mejora continua.

              </p>

              <p className="text-sm md:text-base mb-4">

                Una atención profesional no consiste en "soportar" al cliente difícil, sino en gestionar su comportamiento para

                reconducir la interacción hacia la solución.

              </p>

              <p className="text-sm md:text-base mb-6">

                Veamos algunos tipos de clientes que puedes encontrar en el día a día de tu emprendimiento y cómo atender sus reclamaciones:

              </p>

<div className="space-y-6">

                <div className="bg-neutral-50 border-2 border-neutral-300 rounded-lg p-6">

                  <h4 className="text-lg font-semibold text-neutral-900 mb-3">1) Cliente exigente</h4>

                  <p className="text-sm md:text-base mb-4 italic">

                    Tiene expectativas muy altas respecto al servicio, los tiempos, los procesos y la calidad. Detesta los errores y espera precisión absoluta. Examina el servicio al detalle.

                  </p>

                  <p className="text-sm md:text-base mb-3 font-semibold text-neutral-700">Cómo atender su reclamo:</p>

                  <ul className="list-none space-y-2 text-sm md:text-base">

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Escuchar atentamente sin interrumpir.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Reconocer explícitamente la importancia de lo que señala.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Responder con datos, claridad y seguridad técnica.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Ofrecer soluciones rápidas y concretas.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Validar la satisfacción antes de cerrar el caso.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Documentar para evitar repetición del error.</span>

                    </li>

                  </ul>

                </div>

<div className="bg-neutral-50 border-2 border-neutral-300 rounded-lg p-6">

                  <h4 className="text-lg font-semibold text-neutral-900 mb-3">2) Cliente indeciso</h4>

                  <p className="text-sm md:text-base mb-4 italic">

                    Muestra dudas constantes, cambia de opinión, pregunta mucho y necesita orientación. Cuando algo sale mal, puede culpar al negocio por "no haberlo guiado bien".

                  </p>

                  <p className="text-sm md:text-base mb-3 font-semibold text-neutral-700">Cómo atender su reclamo:</p>

                  <ul className="list-none space-y-2 text-sm md:text-base">

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Proveer información clara y estructurada.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Evitar tecnicismos confusos.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Utilizar preguntas cerradas para precisar lo que necesita.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Confirmar varias veces los acuerdos.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Proponer soluciones concretas y fáciles de entender.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Mantener un tono calmado y paciente.</span>

                    </li>

                  </ul>

                </div>

<div className="bg-neutral-50 border-2 border-neutral-300 rounded-lg p-6">

                  <h4 className="text-lg font-semibold text-neutral-900 mb-3">3) Cliente perfeccionista</h4>

                  <p className="text-sm md:text-base mb-4 italic">

                    Observa minuciosamente cada detalle y considera fallas incluso aspectos pequeños. El mínimo error afecta su experiencia.

                  </p>

                  <p className="text-sm md:text-base mb-3 font-semibold text-neutral-700">Cómo atender su reclamo:</p>

                  <ul className="list-none space-y-2 text-sm md:text-base">

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Agradecer su nivel de detalle.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Revisar cuidadosamente la situación antes de responder.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Proponer soluciones que restauren la calidad exacta que exige.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Anticiparse a sus preguntas aclarando puntos sensibles.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Garantizar el control del proceso para evitar nuevas fallas.</span>

                    </li>

                  </ul>

                </div>

<div className="bg-neutral-50 border-2 border-neutral-300 rounded-lg p-6">

                  <h4 className="text-lg font-semibold text-neutral-900 mb-3">4) Cliente insatisfecho recurrente</h4>

                  <p className="text-sm md:text-base mb-4 italic">

                    Ha tenido varias experiencias negativas previas (reales o percibidas). Vuelve predispuesta a que el servicio fallará nuevamente.

                  </p>

                  <p className="text-sm md:text-base mb-3 font-semibold text-neutral-700">Cómo atender su reclamo:</p>

                  <ul className="list-none space-y-2 text-sm md:text-base">

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Revisar su historial antes de responder.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Reconocer explícitamente los incidentes anteriores.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Asignar seguimiento personalizado.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>mostrar cambios reales realizados por el negocio.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Ofrecer garantías adicionales cuando corresponda.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Pedir confirmación clara de satisfacción al cierre.</span>

                    </li>

                  </ul>

                </div>

<div className="bg-neutral-50 border-2 border-neutral-300 rounded-lg p-6">

                  <h4 className="text-lg font-semibold text-neutral-900 mb-3">5) Cliente silencioso o poco expresivo</h4>

                  <p className="text-sm md:text-base mb-4 italic">

                    No habla mucho, no expresa emociones y puede no manifestar molestia directamente. Si su experiencia es mala, simplemente no vuelve.

                  </p>

                  <p className="text-sm md:text-base mb-3 font-semibold text-neutral-700">Cómo atender su reclamo:</p>

                  <ul className="list-none space-y-2 text-sm md:text-base">

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Hacer preguntas abiertas para identificar el problema.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>mostrar disposición absoluta para escuchar.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Confirmar varias veces que la solución propuesta es la correcta.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Ser detallado al explicar lo que se hará.</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <span className="text-green-600 font-bold mt-1">✓</span>

                      <span>Crear un ambiente de confianza para que se sienta cómodo expresando su inconformidad.</span>

                    </li>

                  </ul>

                </div>

              </div>

            </div>

<div className="bg-white border-2 border-neutral-200 rounded-lg p-6">

              <h3 className="text-xl font-semibold text-neutral-900 mb-4">3.2.2 Estudio de caso: "Panadería la Montaña" en Túquerres</h3>

              <p className="text-sm md:text-base mb-4">

                A continuación, vamos a analizar un caso donde podremos evidenciar cómo se gestionan los clientes difíciles.

              </p>

{/* Contexto */}

              <div className="mb-6">

                <h4 className="text-lg font-semibold text-neutral-900 mb-3">Contexto:</h4>

                <p className="text-sm md:text-base mb-3">

                  "Panadería La Montaña" es un emprendimiento familiar ubicado en el municipio de Túquerres, especializado en pan artesanal y productos típicos de la región. Su objetivo es consolidarse como un referente de calidad y cercanía con la comunidad, pero en su día a día enfrenta distintos perfiles de clientes, incluyendo aquellos considerados difíciles.

                </p>

                <p className="text-sm md:text-base">

                  Durante una semana de alta demanda, el personal de "Panadería La Montaña" se encontró con cinco casos representativos:

                </p>

              </div>

{/* Casos */}

              <div className="space-y-6">

                {/* Caso 1 */}

                <div className="border-l-4 border-blue-600 pl-4 py-3 bg-blue-50 rounded">

                  <h4 className="font-semibold text-neutral-900 mb-2">1. Cliente exigente</h4>

                  <p className="text-sm md:text-base mb-3">

                    Un cliente pidió una pizza recién horneada y exigió precisión absoluta en el tiempo de entrega y la textura.

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-2">Actuación:</p>

                  <p className="text-sm md:text-base">

                    La encargada escuchó sin interrumpir, reconoció la importancia de su observación y respondió con datos técnicos sobre el horneado. Preparó una nueva pieza en pocos minutos y validó su satisfacción antes de cerrar el caso.

                  </p>

                </div>

{/* Caso 2 */}

                <div className="border-l-4 border-purple-600 pl-4 py-3 bg-purple-50 rounded">

                  <h4 className="font-semibold text-neutral-900 mb-2">2. Cliente indeciso</h4>

                  <p className="text-sm md:text-base mb-3">

                    Una señora dudaba entre varios tipos de pan y cambiaba de opinión constantemente. Al recibir un producto distinto al esperado, culpó al negocio por "no haberla orientado bien".

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-2">Actuación:</p>

                  <p className="text-sm md:text-base">

                    El vendedor brindó información clara y estructurada, evitó tecnicismos y utilizó preguntas cerradas para precisar la elección. Confirmó varias veces el acuerdo y entregó una solución concreta, manteniendo un tono calmado y paciente.

                  </p>

                </div>

{/* Caso 3 */}

                <div className="border-l-4 border-green-600 pl-4 py-3 bg-green-50 rounded">

                  <h4 className="font-semibold text-neutral-900 mb-2">3. Cliente perfeccionista</h4>

                  <p className="text-sm md:text-base mb-3">

                    Un cliente habitual observó que la corteza del pan no estaba perfectamente dorada y lo consideró una falla.

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-2">Actuación:</p>

                  <p className="text-sm md:text-base">

                    El personal agradeció su nivel de detalle, revisó cuidadosamente la situación y ofreció una nueva preparación con la calidad exacta que exigía. Además, explicó cómo se controlan los procesos para evitar fallas.

                  </p>

                </div>

{/* Caso 4 */}

                <div className="border-l-4 border-orange-600 pl-4 py-3 bg-orange-50 rounded">

                  <h4 className="font-semibold text-neutral-900 mb-2">4. Cliente insatisfecho recurrente</h4>

                  <p className="text-sm md:text-base mb-3">

                    Un cliente que había tenido experiencias previas negativas regresó predispuesta a que el servicio fallaría otra vez.

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-2">Actuación:</p>

                  <p className="text-sm md:text-base">

                    La administradora revisó su historial, reconoció explícitamente los incidentes anteriores y asignó un seguimiento personalizado. Mostró cambios reales implementados en el negocio (nuevo protocolo de atención) y ofreció garantías adicionales, pidiendo confirmación clara de satisfacción al cierre.

                  </p>

                </div>

{/* Caso 5 */}

                <div className="border-l-4 border-red-600 pl-4 py-3 bg-red-50 rounded">

                  <h4 className="font-semibold text-neutral-900 mb-2">5. Cliente silencioso o poco expresivo</h4>

                  <p className="text-sm md:text-base mb-3">

                    Un joven compró pan y un pastel, pero no manifestá inconformidad cuando el pastel llegó frío.

                  </p>

                  <p className="text-sm md:text-base font-semibold mb-2">Actuación:</p>

                  <p className="text-sm md:text-base">

                    El vendedor hizo preguntas abiertas para identificar el problema, mostró disposición absoluta para escuchar y explicó detalladamente cómo se calentaría el producto. Se creó un ambiente de confianza para que el cliente expresara su inconformidad, logrando que compartiera su experiencia y se sintiera atendido.

                  </p>

                </div>

              </div>

{/* Conclusión del caso */}

              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 pl-4 py-4 rounded">

                <h4 className="font-semibold text-neutral-900 mb-2">Conclusión del caso:</h4>

                <p className="text-sm md:text-base">

                  El ejemplo de "Panadería La Montaña" evidencia que los clientes difíciles no son amenazas, sino oportunidades para demostrar profesionalismo y fortalecer la reputación del negocio. La aplicación de pautas específicas para cada perfil permitió reconducir las interacciones hacia soluciones efectivas, consolidando la confianza y generando aprendizajes valiosos para la mejora continua.

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

            navigate('/student/atencion-cliente/unidad3/inicio');

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

export default AtencionClienteUnidad3DesarrolloPage;


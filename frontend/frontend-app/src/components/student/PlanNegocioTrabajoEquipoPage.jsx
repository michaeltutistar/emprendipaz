import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const PlanNegocioTrabajoEquipoPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const isScrolledRef = useRef(false);

  const [equipo, setEquipo] = useState(() => {

    const saved = localStorage.getItem('plan_negocio_equipo');

    return saved ? JSON.parse(saved) : {

      nombre1: '', // Administrativas

      nombre2: '', // Operativas

      nombre3: '', // Comerciales

      nombre4: '', // Creativas

      nombre5: ''  // Estratégicas

    };

  });

  const [mostrarResultados, setmostrarResultados] = useState(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    localStorage.setItem('plan_negocio_equipo', JSON.stringify(equipo));

  }, [equipo]);

// Sincronizar el ref con el estado

  useEffect(() => {

    isScrolledRef.current = isScrolled;

  }, [isScrolled]);

// Detectar scroll para animar el header

  useEffect(() => {

    let ticking = false;

const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          const scrollPosition = window.scrollY;

if (isScrolledRef.current) {

            if (scrollPosition < 30) {

              isScrolledRef.current = false;

              setIsScrolled(false);

            }

          } else {

            if (scrollPosition > 70) {

              isScrolledRef.current = true;

              setIsScrolled(true);

            }

          }

ticking = false;

        });

        ticking = true;

      }

    };

window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

const handleInputChange = (field, value) => {

    setEquipo(prev => ({

      ...prev,

      [field]: value

    }));

  };

// Función para calcular puntos según las funciones diligenciadas

  const calcularPuntos = () => {

    // Contar cuántos tipos de funciones tienen nombres (excluyendo "NO APLICA" y campos vacíos)

    const funcionesCompletadas = Object.values(equipo).filter(

      nombre => nombre.trim() !== '' && nombre.trim().toUpperCase() !== 'NO APLICA'

    ).length;

// Los puntos son iguales al número de funciones completadas (1-5 puntos)

    return funcionesCompletadas;

  };

const handleGenerar = () => {

    const nombresCompletos = Object.values(equipo).filter(nombre => nombre.trim() !== '' && nombre.trim().toUpperCase() !== 'NO APLICA');

    if (nombresCompletos.length >= 1) {

      setmostrarResultados(true);

    } else {

      alert('Por favor ingresa al menos un nombre del equipo o escribe "NO APLICA" en los campos correspondientes');

    }

  };

const funciones = [

    { key: 'nombre1', label: 'Administrativas' },

    { key: 'nombre2', label: 'Operativas' },

    { key: 'nombre3', label: 'Comerciales' },

    { key: 'nombre4', label: 'Creativas' },

    { key: 'nombre5', label: 'Estratégicas' }

  ];

const nombresFiltrados = funciones

    .filter(func => equipo[func.key] && equipo[func.key].trim() !== '' && equipo[func.key].trim().toUpperCase() !== 'NO APLICA')

    .map(func => ({

      nombre: equipo[func.key],

      funcion: func.label

    }));

return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* Header con scroll dinámico */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-8 overflow-hidden min-h-[60px]"

          animate={{

            minHeight: isScrolled ? '60px' : '60px',

            paddingTop: isScrolled ? '0.5rem' : '0.5rem',

            paddingBottom: isScrolled ? '0.5rem' : '0.5rem',

          }}

          transition={{ duration: 0.3 }}

        >

          {/* CAPA FONDO 1: Degradado animado */}

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

              ease: "easeInOut",

              repeat: Infinity,

            }}

          />

{/* CAPA FONDO 2: Patrón de hojas verdes */}

          <div

            className="absolute inset-0 flex items-center justify-center"

            style={{

              mixBlendMode: 'overlay',

              opacity: 0.4,

            }}

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

            animate={{

              x: [0, 140],

              y: [80, -36],

              opacity: [0, 0.9, 0.9, 0],

            }}

            transition={{

              duration: 3.5,

              repeat: Infinity,

              ease: "linear",

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[28%] w-10 h-10"

            animate={{

              x: [0, 133],

              y: [80, -30],

              opacity: [0, 0.7, 0.7, 0],

            }}

            transition={{

              duration: 4.5,

              repeat: Infinity,

              ease: "linear",

              delay: 1,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[10%] w-11 h-11"

            animate={{

              x: [0, 137],

              y: [80, -33],

              opacity: [0, 0.85, 0.85, 0],

            }}

            transition={{

              duration: 4,

              repeat: Infinity,

              ease: "linear",

              delay: 0.5,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[5%] w-13 h-13"

            animate={{

              x: [0, 146],

              y: [80, -42],

              opacity: [0, 0.6, 0.6, 0],

            }}

            transition={{

              duration: 5,

              repeat: Infinity,

              ease: "linear",

              delay: 1.5,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute left-[15%] w-8 h-8"

            animate={{

              x: [0, 127],

              y: [80, -27],

              opacity: [0, 0.75, 0.75, 0],

            }}

            transition={{

              duration: 3,

              repeat: Infinity,

              ease: "linear",

              delay: 2,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute right-[40%] w-7 h-7"

            animate={{

              x: [0, 120],

              y: [80, -24],

              opacity: [0, 0.8, 0.8, 0],

            }}

            transition={{

              duration: 3.8,

              repeat: Infinity,

              ease: "linear",

              delay: 0.8,

              times: [0, 0.1, 0.85, 1],

            }}

          />

{/* CAPA FRONTAL: Contenido */}

          <div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              {/* Logo */}

              <div>

                <motion.div

                  className="flex items-center justify-start"

                  initial={{ opacity: 0, x: -20 }}

                  animate={{ opacity: 1, x: 0 }}

                  transition={{ duration: 0.8, ease: "easeOut" }}

                >

                  <img

                    src="/formacion.png"

                    alt="Formación Logo"

                    onClick={() => navigate('/student/dashboard')}

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

                      Trabajo en Equipo

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Plan de Negocio

                    </p>

                  </div>

                </motion.div>

              )}

{/* Menú de usuario - Derecha */}

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

{/* Breadcrumb sticky cuando hay scroll */}

      {isScrolled && (

        <motion.div

          className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

          initial={{ opacity: 0, y: -10 }}

          animate={{ opacity: 1, y: 0 }}

        >

          <div className="max-w-7xl mx-auto px-8 py-3">

            <div className="flex items-center gap-2 text-sm">

              <button onClick={() => navigate('/student/dashboard')} className="text-gray-600 hover:text-[#AA27B9] transition-colors flex items-center gap-1">

                <Home className="w-3.5 h-3.5" />

                Inicio

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/modulos')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Módulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/trabajo-equipo')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Trabajo en Equipo

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Plan de Negocio

              </span>

            </div>

          </div>

        </motion.div>

      )}

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

          {/* Breadcrumás - Solo visible cuando NO hay scroll */}

          {!isScrolled && (

            <motion.div

              initial={{ opacity: 0, y: -10 }}

              animate={{ opacity: 1, y: 0 }}

              className="flex items-center gap-2 text-white/80 mb-6"

            >

              <button onClick={() => navigate('/student/dashboard')} className="hover:text-white transition-colors flex items-center gap-1">

                <Home className="w-4 h-4" />

                Inicio

              </button>

              <ChevronRight className="w-4 h-4" />

              <button onClick={() => navigate('/student/modulos')} className="hover:text-white transition-colors">

                Módulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button onClick={() => navigate('/student/trabajo-equipo')} className="hover:text-white transition-colors">

                Trabajo en Equipo

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Plan de Negocio</span>

            </motion.div>

          )}

{/* Title */}

          <motion.div

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.6 }}

          >

            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">

              <span className="text-white text-sm font-medium">MÓDULO 7</span>

            </div>

<h1

              className="text-white"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Plan de Negocio - Trabajo en Equipo

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

<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-8">

          {/* Contenido Páginas 1 y 2 */}

          <div className="space-y-6">

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Competencias psicosociales: "Mi equipo de trabajo"</h2>

<div className="prose max-w-none space-y-4">

              <p className="text-gray-700 text-base leading-relaxed">

                En esta sección complementaria del módulo de trabajo en equipo, vamos a desarrollar una actividad que servirá como insumo o aporte a tu plan de negocio.

              </p>

              <p className="text-gray-700 text-base leading-relaxed">

                Antes de iniciar con la actividad, recuerda que establecer claramente las funciones de tu equipo de trabajo no solo garantiza orden, sino que además permite que el emprendimiento alcance sus metas eficientemente.

              </p>

<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Funciones de mi equipo de trabajo</h3>

              <p className="text-gray-700 text-base leading-relaxed">

                Escribe los nombres de las personas que cumplen las siguientes funciones en tu emprendimiento. Si, por ejemplo, no tienes personal que cumpla funciones comerciales o de otro tipo, simplemente escribe la frase <strong>NO APLICA</strong>.

              </p>

            </div>

          </div>

{/* Formulario de Equipo de Trabajo */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Equipo de Trabajo</h3>

<div className="space-y-6 mb-6">

              {/* Funciones Administrativas */}

              <div>

                <label className="block text-sm font-semibold text-gray-900 mb-2">

                  Funciones administrativas:

                </label>

                <p className="text-sm text-gray-600 mb-2">

                  Escribe en el siguiente cuadro de texto el nombre de la persona o las personas que en tu emprendimiento cumplen funciones como: manejar la contabilidad, gestionar los proveedores, manejar el dinero del emprendimiento.

                </p>

                <p className="text-xs text-gray-500 mb-3 italic">

                  Si no cuentas con personal que desempeñe este tipo de funciones, escribe en el cuadro la frase NO APLICA.

                </p>

                <input

                  type="text"

                  value={equipo.nombre1}

                  onChange={(e) => handleInputChange('nombre1', e.target.value)}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  placeholder="Escribe el nombre(s) de quien(es) cumple(n) funciones administrativas"

                />

              </div>

{/* Funciones Operativas */}

              <div>

                <label className="block text-sm font-semibold text-gray-900 mb-2">

                  Funciones operativas:

                </label>

                <p className="text-sm text-gray-600 mb-2">

                  Escribe en el siguiente cuadro de texto el nombre de la persona o las personas que en tu emprendimiento cumplen funciones como: producir el producto, realizar mantenimiento de maquinaria o equipos.

                </p>

                <p className="text-xs text-gray-500 mb-3 italic">

                  Si no cuentas con personal que desempeñe este tipo de funciones, escribe en el cuadro la frase NO APLICA.

                </p>

                <input

                  type="text"

                  value={equipo.nombre2}

                  onChange={(e) => handleInputChange('nombre2', e.target.value)}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  placeholder="Escribe el nombre(s) de quien(es) cumple(n) funciones operativas"

                />

              </div>

{/* Funciones Comerciales */}

              <div>

                <label className="block text-sm font-semibold text-gray-900 mb-2">

                  Funciones comerciales:

                </label>

                <p className="text-sm text-gray-600 mb-2">

                  Escribe en el siguiente cuadro de texto el nombre de la persona o las personas que en tu emprendimiento cumplen funciones como: atención al cliente, manejo de redes sociales, ventas.

                </p>

                <p className="text-xs text-gray-500 mb-3 italic">

                  Si no cuentas con personal que desempeñe este tipo de funciones, escribe en el cuadro la frase NO APLICA.

                </p>

                <input

                  type="text"

                  value={equipo.nombre3}

                  onChange={(e) => handleInputChange('nombre3', e.target.value)}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  placeholder="Escribe el nombre(s) de quien(es) cumple(n) funciones comerciales"

                />

              </div>

{/* Funciones Creativas */}

              <div>

                <label className="block text-sm font-semibold text-gray-900 mb-2">

                  Funciones creativas:

                </label>

                <p className="text-sm text-gray-600 mb-2">

                  Escribe en el siguiente cuadro de texto el nombre de la persona o las personas que en tu emprendimiento cumplen funciones como: Proponer ideas de diseños para los productos.

                </p>

                <p className="text-xs text-gray-500 mb-3 italic">

                  Si no cuentas con personal que desempeñe este tipo de funciones, escribe en el cuadro la frase NO APLICA.

                </p>

                <input

                  type="text"

                  value={equipo.nombre4}

                  onChange={(e) => handleInputChange('nombre4', e.target.value)}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  placeholder="Escribe el nombre(s) de quien(es) cumple(n) funciones creativas"

                />

              </div>

{/* Funciones Estratégicas */}

              <div>

                <label className="block text-sm font-semibold text-gray-900 mb-2">

                  Funciones Estratégicas:

                </label>

                <p className="text-sm text-gray-600 mb-2">

                  Escribe en el siguiente cuadro de texto el nombre de la persona o las personas que en tu emprendimiento cumplen funciones como: tomar las decisiones más importantes del emprendimiento, ser el jefe.

                </p>

                <p className="text-xs text-gray-500 mb-3 italic">

                  Si no cuentas con personal que desempeñe este tipo de funciones, escribe en el cuadro la frase NO APLICA.

                </p>

                <input

                  type="text"

                  value={equipo.nombre5}

                  onChange={(e) => handleInputChange('nombre5', e.target.value)}

                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  placeholder="Escribe el nombre(s) de quien(es) cumple(n) funciones estratégicas"

                />

              </div>

            </div>

<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">

              <p className="text-blue-900 font-semibold mb-2">RESULTADO ESPERADO</p>

              <p className="text-blue-800 text-sm">Organigrama circular de tu emprendimiento</p>

            </div>

<Button

              onClick={handleGenerar}

              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"

            >

              Generar Organigrama

            </Button>

          </div>

{/* Tabla y Organigrama Circular (Página 3) */}

          {mostrarResultados && nombresFiltrados.length >= 1 && (

            <div className="border-t pt-8 space-y-8">

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Estructura del Equipo</h3>

{/* Tabla */}

              <div className="overflow-x-auto">

                <table className="w-full border-collapse border border-gray-300 text-sm">

                  <thead>

                    <tr className="bg-blue-100">

                      <th className="border border-gray-300 p-3 text-left font-bold">Funciones</th>

                      <th className="border border-gray-300 p-3 text-left font-bold">Nombre del colaborador(es) que la cumple(n)</th>

                    </tr>

                  </thead>

                  <tbody>

                    {funciones.map((func, index) => {

                      const valor = equipo[func.key] || '';

                      const mostrar = valor.trim() !== '' && valor.trim().toUpperCase() !== 'NO APLICA';

                      return (

                        <tr key={index} className={mostrar ? 'hover:bg-gray-50' : 'bg-gray-100'}>

                          <td className="border border-gray-300 p-3 font-semibold">{func.label}</td>

                          <td className="border border-gray-300 p-3">

                            {mostrar ? (

                              <span className="font-medium">{valor}</span>

                            ) : (

                              <span className="text-gray-400 italic">NO APLICA</span>

                            )}

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

{/* Organigrama Circular */}

              <div className="mt-8">

                <h4 className="text-lg font-semibold text-gray-900 mb-4">Organigrama Circular</h4>

                <div className="flex justify-center items-center py-8 overflow-x-auto">

                  <div className="relative flex-shrink-0" style={{ width: '500px', height: '500px', minWidth: '500px' }}>

                    {/* Centro */}

                    <div className="absolute" style={{

                      top: '250px',

                      left: '250px',

                      transform: 'translate(-50%, -50%)',

                      width: '120px',

                      height: '120px',

                      backgroundColor: '#2563eb',

                      borderRadius: '50%',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      color: 'white',

                      fontWeight: 'bold',

                      fontSize: '12px',

                      zIndex: 10,

                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'

                    }}>

                      <div className="text-center">

                        <div className="text-xs mb-1">EQUIPO</div>

                        <div className="text-xs">DE TRABAJO</div>

                      </div>

                    </div>

{/* Miembros alrededor */}

                    {nombresFiltrados.map((item, index) => {

                      const total = nombresFiltrados.length;

                      const angle = (index * 360) / total - 90; // -90 para empezar arriba

                      const radius = 190;

                      const x = Math.cos((angle * Math.PI) / 180) * radius;

                      const y = Math.sin((angle * Math.PI) / 180) * radius;

return (

                        <div

                          key={index}

                          className="absolute"

                          style={{

                            top: `${250 + y}px`,

                            left: `${250 + x}px`,

                            transform: 'translate(-50%, -50%)',

                            width: '110px',

                            height: '110px',

                            backgroundColor: '#7c3aed',

                            borderRadius: '50%',

                            display: 'flex',

                            flexDirection: 'column',

                            alignItems: 'center',

                            justifyContent: 'center',

                            color: 'white',

                            fontWeight: '600',

                            fontSize: '10px',

                            textAlign: 'center',

                            padding: '6px',

                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',

                            border: '3px solid white',

                            zIndex: 10

                          }}

                          title={item.nombre}

                        >

                          <div className="font-semibold mb-1">{item.nombre.split(' ').slice(0, 2).join(' ')}</div>

                          <div className="text-xs opacity-90">{item.funcion}</div>

                        </div>

                      );

                    })}

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

{/* Botón para finalizar plan de negocio */}

        {mostrarResultados && (

          <div className="mt-8 text-center">

            <Button

              onClick={async () => {

                try {

                  const token = getAuthToken();

// Calcular puntos según las funciones diligenciadas

                  // Por cada espacio diligenciado = 1 punto, máximo 5 puntos

                  const funcionesCompletadas = Object.values(equipo).filter(

                    nombre => nombre.trim() !== '' && nombre.trim().toUpperCase() !== 'NO APLICA'

                  ).length;

const puntosTotales = funcionesCompletadas; // Los puntos son iguales al número de funciones completadas (máximo 5)

// Preparar respuestas con puntos para enviar al backend

                  // IMPORTANTE: Solo enviar UNA entrada con el total de puntos, no cada función individual

                  // porque el backend suma TODOS los puntos de todas las entradas

                  const respuestasConPuntos = [];

// Construir una descripción corta de las funciones completadas (máximo 200 caracteres)

                  const funcionesLabels = funciones

                    .map((func, index) => {

                      const valor = equipo[func.key] || '';

                      const tieneValor = valor.trim() !== '' && valor.trim().toUpperCase() !== 'NO APLICA';

                      if (tieneValor) {

                        // Solo usar el nombre corto de la función (ej: "Administrativas", "Operativas")

                        return func.label;

                      }

                      return null;

                    })

                    .filter(label => label !== null)

                    .join(', ');

// Crear descripción final simplificada (máximo 180 caracteres para dejar margen)

                  let descripcionFinal = `${funcionesCompletadas}/5 funciones: ${funcionesLabels}`;

                  if (descripcionFinal.length > 180) {

                    // Si aún es muy largo, truncar solo los nombres de las funciones

                    const maxLength = 180 - `Funciones (${funcionesCompletadas}/5): `.length;

                    const funcionesCortas = funcionesLabels.substring(0, maxLength) + '...';

                    descripcionFinal = `Funciones (${funcionesCompletadas}/5): ${funcionesCortas}`;

                  }

// Asegurar que no exceda 200 caracteres

                  if (descripcionFinal.length > 200) {

                    descripcionFinal = descripcionFinal.substring(0, 197) + '...';

                  }

// Registrar SOLO el total de puntos (una sola entrada)

                  respuestasConPuntos.push({

                    pregunta: 'total_funciones',

                    respuesta: descripcionFinal,

                    puntos: puntosTotales // Solo enviar el total, no sumar puntos individuales

                  });

// Registrar puntos del plan de negocio

                  if (respuestasConPuntos.length > 0) {

                    await fetch(`${API_BASE_URL}/registrar-puntos-plan-negocio`, {

                      method: 'POST',

                      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                      body: JSON.stringify({

                        modulo_nombre: 'Trabajo en Equipo',

                        estrategias: respuestasConPuntos.map(r => ({

                          etapa: r.pregunta,

                          estrategia: r.respuesta,

                          puntos: r.puntos

                        }))

                      })

                    });

                  }

// Guardar respuestas en el backend para el Plan de Negocio central

                  await fetch(`${API_BASE_URL}/save-respuestas-plan`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify({

                      modulo_nombre: 'Trabajo en Equipo',

                      respuestas: equipo

                    })

                  });

// Registrar progreso del modulo

                  await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify({

                      modulo_nombre: 'Trabajo en Equipo',

                      paso_nombre: 'Plan de Negocio',

                      curso_nombre: 'Trabajo en Equipo'

                    })

                  });

// Limpiar localStorage

                  localStorage.removeItem('plan_negocio_equipo');

localStorage.setItem('trabajo_equipo_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  alert('¡Plan de Negocio completado! El siguiente módulo ha sido desbloqueado.');

                  navigate('/student/modulos');

                } catch (error) {

                  console.error('Error al registrar progreso:', error);

                  localStorage.setItem('trabajo_equipo_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  navigate('/student/modulos');

                }

              }}

              className="bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] hover:from-[#FFEB3B] hover:to-[#AA27B9] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105"

            >

              Finalizar Plan de Negocio

            </Button>

          </div>

        )}

      </div>

<motion.div

        initial={{ opacity: 0, x: -20 }}

        animate={{ opacity: 1, x: 0 }}

        className="fixed bottom-8 left-8 z-40"

      >

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/trabajo-equipo');

          }}

          className="bg-white hover:bg-gray-100 text-[#AA27B9] border-2 border-[#AA27B9] rounded-full px-6 py-3 flex items-center gap-2 shadow-2xl font-bold transition-all transform hover:scale-105"

        >

          <ArrowLeft className="w-5 h-5" />

          Atrás

        </Button>

      </motion.div>

<Footer />

    </div>

  );

};

export default PlanNegocioTrabajoEquipoPage;


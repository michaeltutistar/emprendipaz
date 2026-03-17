import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, CheckCircle, XCircle, RotateCcw, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Respuestas correctas

const respuestasCorrectas = {

  objetivo2: {

    estrategia: 'Marketing de influencers',

    ejemplo: 'Se contrata un influencer que promocione los productos de la marca en sus redes sociales'

  },

  objetivo3: {

    estrategia: 'Marketing de contenidos',

    ejemplo: 'Se comparten videos cortos de como se utiliza el producto de manera adecuada y sus beneficios.'

  }

};

// Elementos disponibles para arrastrar

const elementosDisponibles = [

  { id: 'elem1', texto: 'Marketing de influencers', tipo: 'estrategia', objetivo: 'objetivo2' },

  { id: 'elem2', texto: 'Se contrata un influencer que promocione los productos de la marca en sus redes sociales', tipo: 'ejemplo', objetivo: 'objetivo2' },

  { id: 'elem3', texto: 'Marketing de contenidos', tipo: 'estrategia', objetivo: 'objetivo3' },

  { id: 'elem4', texto: 'Se comparten videos cortos de como se utiliza el producto de manera adecuada y sus beneficios.', tipo: 'ejemplo', objetivo: 'objetivo3' },

  { id: 'elem5', texto: 'Utilizar palabras clave para aparecer en los primeros resultados de búsqueda y posicionar el blog', tipo: 'incorrecto', objetivo: null }

];

const objetivos = [

  {

    id: 'objetivo1',

    texto: 'Incrementar las interacciones en las redes sociales en un 20% en los próximos dos meses.',

    pista: 'Pista: debe haber participación activa del cliente en alguna pieza promocional.',

    estrategia: 'Contenido generado por el cliente',

    ejemplo: 'Los clientes que compartan un reel etiquetando a la empresa, en el que se les vea utilizando algún producto de la marca participarán en un sorteo por premio sorpresa.',

    bloqueado: true

  },

  {

    id: 'objetivo2',

    texto: 'Aumentar el alcance mensual de marca en Facebook en un 35% en los próximos 3 meses.',

    pista: 'Pista: se identificó que los clientes de la empresa son receptivos al contenido de influencers.',

    bloqueado: false

  },

  {

    id: 'objetivo3',

    texto: 'Aumentar 500 seguidores en Instagram en los próximos 2 meses, a través de contenido atractivo.',

    pista: 'Pista: al público objetivo le gusta el contenido divertido, espontáneo y de valor.',

    bloqueado: false

  }

];

const MarketingDigitalUnidad3TallerPage = () => {

  const navigate = useNavigate();

  const [asignaciones, setAsignaciones] = useState(() => {

    const saved = localStorage.getItem('md_u3_taller_asignaciones');

    if (saved) {

      return JSON.parse(saved);

    }

    // Inicializar con objetivo1 bloqueado

    return {

      objetivo1: {

        estrategia: 'Contenido generado por el cliente',

        ejemplo: 'Los clientes que compartan un reel etiquetando a la empresa, en el que se les vea utilizando algún producto de la marca participarán en un sorteo por premio sorpresa.'

      },

      objetivo2: {

        estrategia: '',

        ejemplo: ''

      },

      objetivo3: {

        estrategia: '',

        ejemplo: ''

      }

    };

  });

  const [itemsDisponibles, setItemsDisponibles] = useState(() => {

    const saved = localStorage.getItem('md_u3_taller_disponibles');

    if (saved) {

      return JSON.parse(saved);

    }

    // Inicializar con todos los elementos excepto los del objetivo1

    return elementosDisponibles.map(item => item.id);

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('md_u3_taller_validado');

    return saved === 'true';

  });

  const [draggedItem, setDraggedItem] = useState(null);

  const [dragOver, setDragOver] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const isScrolledRef = useRef(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    let ticking = false;

    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          const scrollPosition = window.scrollY;

          const newIsScrolled = scrollPosition > 70;

if (newIsScrolled !== isScrolledRef.current) {

            isScrolledRef.current = newIsScrolled;

            setIsScrolled(newIsScrolled);

          }

ticking = false;

        });

        ticking = true;

      }

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

useEffect(() => {

    localStorage.setItem('md_u3_taller_asignaciones', JSON.stringify(asignaciones));

  }, [asignaciones]);

useEffect(() => {

    localStorage.setItem('md_u3_taller_disponibles', JSON.stringify(itemsDisponibles));

  }, [itemsDisponibles]);

useEffect(() => {

    localStorage.setItem('md_u3_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, itemId) => {

    setDraggedItem(itemId);

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, objetivoId, tipo) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(`${objetivoId}-${tipo}`);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, objetivoId, tipo) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedItem) return;

const item = elementosDisponibles.find(el => el.id === draggedItem);

    if (!item) return;

// Permitir arrastrar elementos incorrectos a cualquier lugar

    if (item.tipo === 'incorrecto') {

      // Permitir arrastrar elemento incorrecto

    } else {

      // Solo permitir arrastrar a los objetivos correctos

      if (item.objetivo && item.objetivo !== objetivoId) return;

      // Solo permitir arrastrar el tipo correcto (estrategia o ejemplo)

      if (item.tipo !== tipo) return;

    }

// Si ya hay una respuesta, devolver el elemento anterior a disponibles

    if (asignaciones[objetivoId]?.[tipo]) {

      const elementoAnterior = elementosDisponibles.find(

        el => el.texto === asignaciones[objetivoId][tipo]

      );

      if (elementoAnterior && !itemsDisponibles.includes(elementoAnterior.id)) {

        setItemsDisponibles(prev => [...prev, elementoAnterior.id]);

      }

    }

// Asignar el nuevo elemento

    setAsignaciones(prev => ({

      ...prev,

      [objetivoId]: {

        ...prev[objetivoId],

        [tipo]: item.texto

      }

    }));

// Remover de disponibles

    setItemsDisponibles(prev => prev.filter(id => id !== draggedItem));

setDraggedItem(null);

    setValidado(false);

  };

const handleRemove = (objetivoId, tipo) => {

    const texto = asignaciones[objetivoId]?.[tipo];

    if (!texto) return;

const item = elementosDisponibles.find(el => el.texto === texto);

    if (item) {

      setItemsDisponibles(prev => [...prev, item.id]);

    }

setAsignaciones(prev => {

      const updated = { ...prev };

      updated[objetivoId][tipo] = '';

      return updated;

    });

    setValidado(false);

  };

const handleValidate = () => {

    setValidado(true);

  };

const handleReintentar = () => {

    // Solo limpiar las respuestas incorrectas

    const nuevasAsignaciones = { ...asignaciones };

    const nuevosDisponibles = [...itemsDisponibles];

['objetivo2', 'objetivo3'].forEach(objId => {

      const correctas = respuestasCorrectas[objId];

      ['estrategia', 'ejemplo'].forEach(tipo => {

        if (nuevasAsignaciones[objId]?.[tipo] !== correctas[tipo]) {

          // Es incorrecta, devolver a disponibles

          const texto = nuevasAsignaciones[objId]?.[tipo];

          if (texto) {

            const item = elementosDisponibles.find(el => el.texto === texto);

            if (item && !nuevosDisponibles.includes(item.id)) {

              nuevosDisponibles.push(item.id);

            }

          }

          // Eliminar de asignaciones

          nuevasAsignaciones[objId][tipo] = '';

        }

      });

    });

setAsignaciones(nuevasAsignaciones);

    setItemsDisponibles(nuevosDisponibles);

    setValidado(false);

  };

const isCorrecto = (objetivoId, tipo) => {

    if (!validado || objetivoId === 'objetivo1') return null;

    return asignaciones[objetivoId]?.[tipo] === respuestasCorrectas[objetivoId]?.[tipo];

  };

const isIncorrecto = (objetivoId, tipo) => {

    if (!validado || objetivoId === 'objetivo1') return false;

    const asignado = asignaciones[objetivoId]?.[tipo];

    return asignado && asignado !== respuestasCorrectas[objetivoId]?.[tipo];

  };

const isEditable = (objetivoId, tipo) => {

    if (objetivoId === 'objetivo1') return false;

    if (!validado) return true;

    return !isCorrecto(objetivoId, tipo);

  };

const allCompletos = () => {

    return objetivos.every(obj => {

      if (obj.bloqueado) return true;

      return asignaciones[obj.id]?.estrategia && asignaciones[obj.id]?.ejemplo;

    });

  };

const handleCompleteStep = async () => {

    if (!allCompletos()) {

      alert('Por favor completa todos los campos de los tres objetivos antes de continuar.');

      return;

    }

try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing Digital',

          paso_nombre: 'Unidad 3: Taller',

          curso_nombre: 'Marketing Digital'

        })

      });

      navigate('/student/marketing-digital/unidad3/cierre');

    } catch (error) {

      navigate('/student/marketing-digital/unidad3/cierre');

    }

  };

const elementosObj = elementosDisponibles.filter(item => itemsDisponibles.includes(item.id));

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

                    Marketing Digital

                  </h1>

                  <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                    Unidad 3 · Taller

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

                onClick={() => navigate('/student/marketing-digital')}

                className="hover:text-white transition-colors"

              >

                Marketing Digital

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 3 · Taller</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Marketing Digital

            </p>

            <h1

              className="text-white mb-3"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Estrategias de Marketing Digital · Taller

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Asocia estrategias y ejemplos a los objetivos de marketing digital mediante un ejercicio interactivo de arrastrar y soltar.

            </p>

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

{/* Progress Steps - STICKY */}

      <div className="z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm py-2">

        <div className="max-w-3xl mx-auto px-8">

          <div className="flex items-center justify-between relative">

            {/* Progress Line */}

            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

            <motion.div

              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#AA27B9] to-[#d946ef] z-0"

              initial={{ width: 0 }}

              animate={{ width: '75%' }}

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

{/* Step 2 - Completado */}

            <div className="flex flex-col items-center relative z-10 bg-white px-1">

              <p className="text-[9px] text-gray-500 mb-0.5">Paso</p>

              <div className="bg-gradient-to-br from-[#AA27B9] to-[#d946ef] text-white rounded-full w-6 h-6 flex items-center justify-center mb-0.5 shadow-md text-xs font-bold">

                2

              </div>

              <p className="text-[10px] text-gray-500">Fundamentación</p>

            </div>

{/* Step 3 - Active */}

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

<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-6">

            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Taller: "Desarrollando la estrategia"</h2>

            <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded">

              <p className="text-neutral-700 text-sm md:text-base mb-2">

                <strong>📌 Instrucciones:</strong> Arrastra cada elemento hacia la estrategia o ejemplo correspondiente según el objetivo.

              </p>

              <p className="text-neutral-700 text-sm md:text-base">

                En la primera fila encontrarás un ejemplo de cómo se desarrolla la actividad.

              </p>

            </div>

          </div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Tabla de objetivos */}

            <div className="lg:col-span-2">

              <div className="overflow-x-auto">

                <table className="min-w-full border border-neutral-300 rounded-lg text-sm">

                  <thead className="bg-neutral-900 text-white">

                    <tr>

                      <th className="px-4 py-3 text-left border border-neutral-300">Objetivo SMART</th>

                      <th className="px-4 py-3 text-left border border-neutral-300">Estrategia seleccionada</th>

                      <th className="px-4 py-3 text-left border border-neutral-300">Ejemplo de cómo se desarrollaría</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-neutral-200">

                    {objetivos.map((obj, index) => {
                      const respuesta = asignaciones[obj.id];
                      const completo = obj.bloqueado || (respuesta?.estrategia && respuesta?.ejemplo);

return (

                        <tr key={obj.id} className={completo ? 'bg-green-50' : ''}>

                          <td className="px-4 py-3 border border-neutral-300">

                            <div className="space-y-2">

                              <p className="font-semibold text-neutral-900">{index + 1}. {obj.texto}</p>

                              <p className="text-xs text-neutral-600 italic">{obj.pista}</p>

                            </div>

                          </td>

                          <td className="px-4 py-3 border border-neutral-300">

                            {obj.bloqueado ? (

                              <p className="text-neutral-700 bg-neutral-100 px-3 py-2 rounded">{respuesta.estrategia}</p>

                            ) : (

                              <div

                                onDragOver={(e) => isEditable(obj.id, 'estrategia') && handleDragOver(e, obj.id, 'estrategia')}

                                onDragLeave={handleDragLeave}

                                onDrop={(e) => isEditable(obj.id, 'estrategia') && handleDrop(e, obj.id, 'estrategia')}

                                onContextMenu={handleContextMenu}

                                className={`min-h-[60px] p-3 rounded-lg border-2 transition-all select-none ${dragOver === `${obj.id}-estrategia`

                                    ? 'border-neutral-900 bg-neutral-100 border-dashed'

                                    : isCorrecto(obj.id, 'estrategia')

                                      ? 'border-green-500 bg-green-50'

                                      : isIncorrecto(obj.id, 'estrategia')

                                        ? 'border-red-500 bg-red-50'

                                        : respuesta?.estrategia

                                          ? 'border-neutral-300 bg-neutral-50'

                                          : 'border-neutral-200 bg-white border-dashed'

                                  }`}

                              >

                                {respuesta?.estrategia ? (

                                  <div className="flex items-center justify-between">

                                    <div className={`flex items-center gap-2 px-2 py-1 rounded flex-1 ${isCorrecto(obj.id, 'estrategia')

                                        ? 'bg-green-100 text-green-800'

                                        : isIncorrecto(obj.id, 'estrategia')

                                          ? 'bg-red-100 text-red-800'

                                          : 'bg-neutral-200 text-neutral-700'

                                      }`}>

                                      {validado && (

                                        <>

                                          {isCorrecto(obj.id, 'estrategia') ? (

                                            <CheckCircle className="w-4 h-4" />

                                          ) : (

                                            <XCircle className="w-4 h-4" />

                                          )}

                                        </>

                                      )}

                                      <span className="text-sm font-semibold">{respuesta.estrategia}</span>

                                    </div>

                                    {!validado && (

                                      <button

                                        onClick={() => handleRemove(obj.id, 'estrategia')}

                                        className="text-xs text-neutral-500 hover:text-neutral-700 underline ml-2"

                                      >

                                        Quitar

                                      </button>

                                    )}

                                  </div>

                                ) : (

                                  <p className="text-xs text-neutral-400 italic">Arrastra una estrategia aquí</p>

                                )}

                                {validado && isIncorrecto(obj.id, 'estrategia') && (

                                  <p className="text-xs text-green-700 mt-2 font-semibold">

                                    Correcto: {respuestasCorrectas[obj.id]?.estrategia}

                                  </p>

                                )}

                              </div>

                            )}

                          </td>

                          <td className="px-4 py-3 border border-neutral-300">

                            {obj.bloqueado ? (

                              <p className="text-neutral-700 italic bg-neutral-100 px-3 py-2 rounded">{respuesta.ejemplo}</p>

                            ) : (

                              <div

                                onDragOver={(e) => isEditable(obj.id, 'ejemplo') && handleDragOver(e, obj.id, 'ejemplo')}

                                onDragLeave={handleDragLeave}

                                onDrop={(e) => isEditable(obj.id, 'ejemplo') && handleDrop(e, obj.id, 'ejemplo')}

                                onContextMenu={handleContextMenu}

                                className={`min-h-[80px] p-3 rounded-lg border-2 transition-all select-none ${dragOver === `${obj.id}-ejemplo`

                                    ? 'border-neutral-900 bg-neutral-100 border-dashed'

                                    : isCorrecto(obj.id, 'ejemplo')

                                      ? 'border-green-500 bg-green-50'

                                      : isIncorrecto(obj.id, 'ejemplo')

                                        ? 'border-red-500 bg-red-50'

                                        : respuesta?.ejemplo

                                          ? 'border-neutral-300 bg-neutral-50'

                                          : 'border-neutral-200 bg-white border-dashed'

                                  }`}

                              >

                                {respuesta?.ejemplo ? (

                                  <div className="flex items-start justify-between">

                                    <div className={`flex items-start gap-2 px-2 py-1 rounded flex-1 ${isCorrecto(obj.id, 'ejemplo')

                                        ? 'bg-green-100 text-green-800'

                                        : isIncorrecto(obj.id, 'ejemplo')

                                          ? 'bg-red-100 text-red-800'

                                          : 'bg-neutral-200 text-neutral-700'

                                      }`}>

                                      {validado && (

                                        <>

                                          {isCorrecto(obj.id, 'ejemplo') ? (

                                            <CheckCircle className="w-4 h-4 mt-0.5" />

                                          ) : (

                                            <XCircle className="w-4 h-4 mt-0.5" />

                                          )}

                                        </>

                                      )}

                                      <span className="text-sm font-semibold">{respuesta.ejemplo}</span>

                                    </div>

                                    {!validado && (

                                      <button

                                        onClick={() => handleRemove(obj.id, 'ejemplo')}

                                        className="text-xs text-neutral-500 hover:text-neutral-700 underline ml-2"

                                      >

                                        Quitar

                                      </button>

                                    )}

                                  </div>

                                ) : (

                                  <p className="text-xs text-neutral-400 italic">Arrastra un ejemplo aquí</p>

                                )}

                                {validado && isIncorrecto(obj.id, 'ejemplo') && (

                                  <p className="text-xs text-green-700 mt-2 font-semibold">

                                    Correcto: {respuestasCorrectas[obj.id]?.ejemplo}

                                  </p>

                                )}

                              </div>

                            )}

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            </div>

{/* Elementos disponibles */}

            <div className="space-y-4">

              <h3 className="font-semibold text-neutral-900 mb-3">Elementos disponibles</h3>

              <div className="space-y-3">

                {elementosObj.map((item) => (

                  <div

                    key={item.id}

                    draggable={true}

                    onDragStart={(e) => handleDragStart(e, item.id)}

                    onContextMenu={handleContextMenu}

                    className="px-4 py-3 rounded-lg border-2 border-neutral-300 bg-white hover:border-neutral-900 hover:shadow-md cursor-move transition-all active:opacity-70 select-none"

                  >

                    <span className="text-sm text-neutral-900">

                      {item.texto}

                    </span>

                  </div>

                ))}

                {elementosObj.length === 0 && (

                  <p className="text-xs text-neutral-400 italic text-center py-4">

                    Todos los elementos han sido asignados

                  </p>

                )}

              </div>

            </div>

          </div>

{/* Botones de acción */}

          <div className="flex flex-col sm:flex-row gap-4 mb-8 pt-6 border-t border-neutral-200">

            <Button

              onClick={handleValidate}

              disabled={!allCompletos() || validado}

              className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"

            >

              Validar respuestas

            </Button>

            {validado && (

              <Button

                onClick={handleReintentar}

                variant="outline"

                className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 px-6 py-3 flex items-center gap-2"

              >

                <RotateCcw className="w-4 h-4" />

                Reintentar incorrectas

              </Button>

            )}

          </div>

{/* Reflexión final y recomendaciones */}

          <div className="mt-10 bg-white border-2 border-neutral-200 rounded-lg p-6">

            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3.2.5 Reflexión final y recomendaciones</h2>

            <div className="space-y-4 text-sm md:text-base text-neutral-700 leading-relaxed">

              <p>

                La selección de las estrategias adecuadas para cumplir los objetivos que componen a nuestro Plan de Marketing Digital, determinará el éxito de nuestra gestión. Recordemos que la estrategia es el camino que nos conduce hacia la meta. Elegir la ruta equivocada puede generar resultados adversos para nuestro emprendimiento.

              </p>

              <p>

                Por otra parte, recuerda que, para cumplir un objetivo de marketing digital, se pueden implementar varias estrategias de forma simultánea; lo importante es ser coherentes con las capacidades de nuestro emprendimiento para el desarrollo de una estrategia de forma eficiente. Por ejemplo, habrá emprendimientos que tengan la capacidad de realizar "Publicidad pago" a través de plataformas como Facebook Ads o Instagram Ads para que su contenido sea promocionado de forma masiva y estableciendo parámetros específicos (la edad, región). Por otra parte, los emprendimientos que no tengan esa posibilidad, deberán centrar sus esfuerzos en contenido orgánico de alto valor y consecuente a las expectativas y necesidades de sus clientes.

              </p>

              <p>

                Todas las estrategias desarrolladas adecuadamente son válidas, en la medida que vayan en armonía con nuestro objetivo, y aunque no exista una fórmula secreta para desarrollar la estrategia infalible que nos garantice el éxito total de nuestras campañas, lo importante es realizar seguimientos periódicos y tener la disposición de ajustar lo que sea necesario sobre la marcha.

              </p>

            </div>

          </div>

<div className="mt-8 flex justify-end">

            <Button

              onClick={handleCompleteStep}

              disabled={!allCompletos()}

              className={`px-8 py-4 flex items-center gap-2 ${allCompletos()

                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white'

                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'

                }`}

            >

              Continuar a Evaluación

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        </div>

      </div>

<div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/marketing-digital/unidad3')}

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

export default MarketingDigitalUnidad3TallerPage;


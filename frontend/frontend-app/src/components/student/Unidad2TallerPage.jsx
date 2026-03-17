import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ClipboardList, ArrowLeft, X, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const ResumenDireccionamientoModal = ({ data, onClose }) => (

  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs uppercase tracking-widest text-neutral-500">Resumen del taller</p>

          <h2 className="text-2xl font-bold text-neutral-900">{data.organizacion}</h2>

        </div>

        <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">

          <X className="w-6 h-6" />

        </button>

      </div>

<div className="space-y-4">

        <div>

          <p className="text-neutral-900 font-semibold">Misión</p>

          <p className="text-neutral-700 text-sm">{data.mision}</p>

        </div>

        <div>

          <p className="text-neutral-900 font-semibold">Visión</p>

          <p className="text-neutral-700 text-sm">{data.vision}</p>

        </div>

        <div>

          <p className="text-neutral-900 font-semibold">Estrategias</p>

          <ul className="list-disc list-inside text-neutral-700 text-sm space-y-1">

            {data.estrategias.map((estrategia, idx) => (

              <li key={idx}>{estrategia}</li>

            ))}

          </ul>

        </div>

      </div>

<div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm">

        ¡Excelente! Lleva está carta de navegación a tus canales, equipo y clientes.

      </div>

<div className="flex justify-end">

        <Button onClick={onClose} className="bg-[#AA27B9] hover:bg-[#9d24ab] text-white px-8">

          Cerrar

        </Button>

      </div>

    </div>

  </div>

);

const Unidad2TallerPage = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {

    const saved = localStorage.getItem('unidad2_taller_formData');

    if (saved) {

      try {

        const parsed = JSON.parse(saved);

        return {

          organizacion: parsed.organizacion || '',

          mision: parsed.mision || parsed.másion || '',

          vision: parsed.vision || '',

          estrategia1: parsed.estrategia1 || '',

          estrategia2: parsed.estrategia2 || ''

        };

      } catch (e) {

        return {

          organizacion: '',

          mision: '',

          vision: '',

          estrategia1: '',

          estrategia2: ''

        };

      }

    }

    return {

      organizacion: '',

      mision: '',

      vision: '',

      estrategia1: '',

      estrategia2: ''

    };

  });

  const [errors, setErrors] = useState({});

  const [summaryData, setSummaryData] = useState(null);

  const [modalClosed, setModalClosed] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const isScrolledRef = useRef(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

// Guardar formData en localStorage cada vez que cambie

  useEffect(() => {

    localStorage.setItem('unidad2_taller_formData', JSON.stringify(formData));

  }, [formData]);

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

const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

  };

const validateForm = () => {

    const newErrors = {};

    if (!formData.organizacion.trim()) newErrors.organizacion = 'Escribe el nombre de la organización o idea de negocio.';

    if (formData.mision.trim().length < 20) newErrors.mision = 'Describe tu misión en al menos 20 caracteres.';

    if (formData.vision.trim().length < 20) newErrors.vision = 'Describe tu visión en al menos 20 caracteres.';

    if (!formData.estrategia1.trim()) newErrors.estrategia1 = 'Registra la primera estrategia.';

    if (!formData.estrategia2.trim()) newErrors.estrategia2 = 'Registra la segunda estrategia.';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

const handleSubmit = () => {

    if (!validateForm()) return;

    setSummaryData({

      organizacion: formData.organizacion.trim(),

      mision: formData.mision.trim(),

      vision: formData.vision.trim(),

      estrategias: [formData.estrategia1.trim(), formData.estrategia2.trim()]

    });

    setModalClosed(false);

  };

const handleCloseModal = () => {

    setSummaryData(null);

    setModalClosed(true);

  };

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Marketing y Comercialización',

          paso_nombre: 'Unidad 2: Taller',

          curso_nombre: 'Marketing y Comercialización'

        })

      });

      navigate('/student/unidad2/cierre');

    } catch (error) {

      navigate('/student/unidad2/cierre');

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

{/* CAPA INTERMEDIA: Elementos flotantes ascendiendo en diagonal -48 grados */}

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

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[12%] w-11 h-11"

            animate={{

              x: [0, 137],

              y: [80, -33],

              opacity: [0, 0.65, 0.65, 0],

            }}

            transition={{

              duration: 4.2,

              repeat: Infinity,

              ease: "linear",

              delay: 0.3,

              times: [0, 0.1, 0.85, 1],

            }}

          />

{/* CAPA FRONTAL: Contenido estático y UI nítido */}

          <div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              {/* Logo */}

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

                      Marketing y Comercialización

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Unidad 2 · Taller

                    </p>

                  </div>

                </motion.div>

              )}

{/* Usuario */}

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

              onClick={() => navigate('/student/presentacion-modulo')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Marketing y Comercialización

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Bases del direccionamiento estratégico

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

                onClick={() => navigate('/student/presentacion-modulo')}

                className="hover:text-white transition-colors"

              >

                Marketing y Comercialización

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Unidad 2 · Taller</span>

            </motion.div>

          )}

<motion.div

            initial={{ opacity: 0, y: 20 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

          >

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">

              MÓDULO: Marketing y Comercialización

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

              Bases del direccionamiento estratégico · Taller

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Define la misión, visión y estrategias de tu organización o idea de negocio aplicando los conceptos aprendidos.

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

{/* Content */}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

          <div className="mb-8 space-y-4">

            <div className="flex items-center gap-3">

              <ClipboardList className="w-6 h-6 text-neutral-700" />

              <h3 className="text-xl md:text-2xl font-bold text-neutral-800">Taller: direccionamiento estratégico</h3>

            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">

              <p className="text-neutral-700 font-semibold">Definiciones breves:</p>

              <ul className="space-y-2 text-neutral-700 text-sm">

                <li><strong>Misión:</strong> Propósito fundamental de la organización, razón de ser.</li>

                <li><strong>Visión:</strong> Imagen del futuro deseado a mediano o largo plazo.</li>

                <li><strong>Estrategias:</strong> Acciones generales para alcanzar objetivos y materializar la visión.</li>

              </ul>

            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">

              <p className="text-neutral-700 font-semibold">Ejemplo corto:</p>

              <ul className="space-y-1 text-neutral-700 text-sm">

                <li><strong>Misión:</strong> “Ofrecer productos alimenticios saludables y asequibles para familias locales.”</li>

                <li><strong>Visión:</strong> “Ser la marca líder de alimentos saludables en la región para 2030.”</li>

                <li><strong>Estrategia:</strong> “Desarrollar nuevas líneas de productos orgánicos y alianzas con agricultores locales.”</li>

              </ul>

            </div>

            <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded space-y-3">

              <p className="text-sm text-neutral-700">

                <strong>Instrucción:</strong>

              </p>

              <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700">

                <li>

                  Sobre tu emprendimiento real redacta:

                  <ul className="list-disc list-inside pl-4 space-y-1 mt-2">

                    <li>Una misión clara y breve (1–2 oraciones).</li>

                    <li>Una visión ambiciosa pero alcanzable (1–2 oraciones).</li>

                    <li>Dos estrategias concretas para lograr esa visión.</li>

                  </ul>

                </li>

              </ol>

            </div>

          </div>

<div className="space-y-6">

            <div>

              <label htmlFor="organizacion" className="block text-sm font-semibold text-neutral-800 mb-1">

                1. Nombre del emprendimiento u organización *

              </label>

              <input

                id="organizacion"

                name="organizacion"

                type="text"

                value={formData.organizacion}

                onChange={handleChange}

                className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900"

                placeholder="Ej. Salud Vital SAS"

              />

              {errors.organizacion && <p className="text-xs text-red-500 mt-1">{errors.organizacion}</p>}

            </div>

<div>

              <label htmlFor="mision" className="block text-sm font-semibold text-neutral-800 mb-1">

                2. Misión (máximo 3 oraciones) *

              </label>

              <textarea

                id="mision"

                name="mision"

                rows={4}

                value={formData.mision}

                onChange={handleChange}

                className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900"

                placeholder="Describe qué haces hoy, para quién y con qué valor"

              ></textarea>

              {errors.mision && <p className="text-xs text-red-500 mt-1">{errors.mision}</p>}

            </div>

<div>

              <label htmlFor="vision" className="block text-sm font-semibold text-neutral-800 mb-1">

                3. Visión (máximo 3 oraciones) *

              </label>

              <textarea

                id="vision"

                name="vision"

                rows={4}

                value={formData.vision}

                onChange={handleChange}

                className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900"

                placeholder="Describe el futuro deseado de tu emprendimiento"

              ></textarea>

              {errors.vision && <p className="text-xs text-red-500 mt-1">{errors.vision}</p>}

            </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label htmlFor="estrategia1" className="block text-sm font-semibold text-neutral-800 mb-1">

                  4. Estrategia 1 *

                </label>

                <textarea

                  id="estrategia1"

                  name="estrategia1"

                  rows={3}

                  value={formData.estrategia1}

                  onChange={handleChange}

                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900"

                  placeholder="Ej. Crear alianzas con proveedores locales"

                ></textarea>

                {errors.estrategia1 && <p className="text-xs text-red-500 mt-1">{errors.estrategia1}</p>}

              </div>

              <div>

                <label htmlFor="estrategia2" className="block text-sm font-semibold text-neutral-800 mb-1">

                  5. Estrategia 2 *

                </label>

                <textarea

                  id="estrategia2"

                  name="estrategia2"

                  rows={3}

                  value={formData.estrategia2}

                  onChange={handleChange}

                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900"

                  placeholder="Ej. Implementar programa de fidelización digital"

                ></textarea>

                {errors.estrategia2 && <p className="text-xs text-red-500 mt-1">{errors.estrategia2}</p>}

              </div>

            </div>

          </div>

<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10">

            <Button

              onClick={handleSubmit}

              className="bg-[#AA27B9] hover:bg-[#9d24ab] text-white px-8 py-4"

            >

              Guardar resumen

            </Button>

            <Button

              onClick={handleCompleteStep}

              disabled={!modalClosed}

              className={`bg-[#AA27B9] hover:bg-[#9d24ab] text-white px-8 py-4 flex items-center gap-2 ${!modalClosed ? 'opacity-40 cursor-not-allowed' : ''

                }`}

            >

              Siguiente Paso

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

<div className="mt-10 space-y-4 bg-neutral-50 border border-neutral-200 rounded-xl p-6">

            <h4 className="text-neutral-900 font-bold">1.2.4 Reflexión final y recomendaciones</h4>

            <p className="text-neutral-700 text-sm">

              Es importante tener en cuenta que, al caracterizar el negocio desde el DOFA, se cuenta con información para establecer el direccionamiento estratégico,

              desde la misión, visión y estrategias, como una carta de navegación para lo que es la empresa hoy y se proyecta el futuro deseado; además permite realizar estrategias

              para diferenciarse de la competencia y potencializar el emprendimiento, con este enfoque atender al consumidor con calidad y buen servicio.

            </p>

            <p className="text-neutral-700 text-sm">

              Ahora que ya comprende la importancia de establecer el direccionamiento estratégico y sus principales aspectos, puede aplicarlo en su emprendimiento de una manera

              organizada y comprometida con su desarrollo empresarial.

            </p>

            <p className="text-neutral-700 text-sm">

              Con los conocimientos adquiridos sobre caracterización del negocio, en la unidad 3 se estudiarán las estrategias de comercialización y marketing mix para posicionar

              mejor la empresa en el mercado.

            </p>

          </div>

        </div>

      </div>

{/* Back button */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/unidad2/desarrollo')}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </div>

<Footer />

{summaryData && (

        <ResumenDireccionamientoModal

          data={summaryData}

          onClose={handleCloseModal}

        />

      )}

    </div>

  );

};

export default Unidad2TallerPage;


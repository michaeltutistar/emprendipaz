import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, ChevronDown, LogOut, Check, X, RotateCcw } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

const PlanInversionUnidad2TallerPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

// Datos del ejercicio

  const ejercicio1Categorias = [

    { id: 'ej1_cat1', texto: 'Fuente de financiamiento' },

    { id: 'ej1_cat2', texto: 'Componente del flujo de caja' },

    { id: 'ej1_cat3', texto: 'Indicador financiero' },

    { id: 'ej1_cat4', texto: 'Escenario de sensibilidad' }

  ];

const ejercicio1Elementos = [

    { id: 'ej1_elem1', texto: 'Ingresos por ventas', respuestaCorrecta: 'ej1_cat2' },

    { id: 'ej1_elem2', texto: 'VAN', respuestaCorrecta: 'ej1_cat3' },

    { id: 'ej1_elem3', texto: 'Pesimista', respuestaCorrecta: 'ej1_cat4' },

    { id: 'ej1_elem4', texto: 'Capital propio', respuestaCorrecta: 'ej1_cat1' }

  ];

const ejercicio2Categorias = [

    { id: 'ej2_cat1', texto: 'Fuente de financiamiento' },

    { id: 'ej2_cat2', texto: 'Componente del flujo de caja' },

    { id: 'ej2_cat3', texto: 'Indicador financiero' },

    { id: 'ej2_cat4', texto: 'Escenario de sensibilidad' }

  ];

const ejercicio2Elementos = [

    { id: 'ej2_elem1', texto: 'TIR', respuestaCorrecta: 'ej2_cat3' },

    { id: 'ej2_elem2', texto: 'Crédito bancario', respuestaCorrecta: 'ej2_cat1' },

    { id: 'ej2_elem3', texto: 'Optimista', respuestaCorrecta: 'ej2_cat4' },

    { id: 'ej2_elem4', texto: 'Costos variables', respuestaCorrecta: 'ej2_cat2' }

  ];

const [respuestasEj1, setRespuestasEj1] = useState(() => {

    const saved = localStorage.getItem('plan_inversion_u2_taller_ej1');

    return saved ? JSON.parse(saved) : {};

  });

const [respuestasEj2, setRespuestasEj2] = useState(() => {

    const saved = localStorage.getItem('plan_inversion_u2_taller_ej2');

    return saved ? JSON.parse(saved) : {};

  });

const [validadoEj1, setValidadoEj1] = useState(false);

  const [validadoEj2, setValidadoEj2] = useState(false);

  const [completado, setCompletado] = useState(false);

  const [draggedItem, setDraggedItem] = useState(null);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 100);

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

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

const handleLogout = async () => {

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

  };

useEffect(() => {

    localStorage.setItem('plan_inversion_u2_taller_ej1', JSON.stringify(respuestasEj1));

  }, [respuestasEj1]);

useEffect(() => {

    localStorage.setItem('plan_inversion_u2_taller_ej2', JSON.stringify(respuestasEj2));

  }, [respuestasEj2]);

const handleDragStart = (e, elementoId, ejercicio) => {

    setDraggedItem({ id: elementoId, ejercicio });

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

  };

const handleDrop = (e, categoriaId, ejercicio) => {

    e.preventDefault();

    if (draggedItem && draggedItem.ejercicio === ejercicio) {

      if (ejercicio === 1) {

        setRespuestasEj1(prev => ({

          ...prev,

          [categoriaId]: draggedItem.id

        }));

      } else {

        setRespuestasEj2(prev => ({

          ...prev,

          [categoriaId]: draggedItem.id

        }));

      }

    }

    setDraggedItem(null);

  };

const handleRemoveAnswer = (categoriaId, ejercicio) => {

    if (ejercicio === 1) {

      setRespuestasEj1(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[categoriaId];

        return newRespuestas;

      });

    } else {

      setRespuestasEj2(prev => {

        const newRespuestas = { ...prev };

        delete newRespuestas[categoriaId];

        return newRespuestas;

      });

    }

  };

const esCorrecta = (categoriaId, ejercicio) => {

    if (ejercicio === 1) {

      const respuesta = respuestasEj1[categoriaId];
      const elemento = ejercicio1Elementos.find(e => e.id === respuesta);
      return elemento && elemento.respuestaCorrecta === categoriaId;
    } else {
      const respuesta = respuestasEj2[categoriaId];
      const elemento = ejercicio2Elementos.find(e => e.id === respuesta);
      return elemento && elemento.respuestaCorrecta === categoriaId;
    }

  };

const validarEjercicio = (ejercicio) => {

    if (ejercicio === 1) {

      const todasRespondidas = ejercicio1Categorias.every(c => respuestasEj1[c.id]);

      if (!todasRespondidas) {

        alert('Por favor completa todas las respuestas antes de verificar.');

        return;

      }

      setValidadoEj1(true);

    } else {

      const todasRespondidas = ejercicio2Categorias.every(c => respuestasEj2[c.id]);

      if (!todasRespondidas) {

        alert('Por favor completa todas las respuestas antes de verificar.');

        return;

      }

      setValidadoEj2(true);

    }

  };

useEffect(() => {

    if (validadoEj1 && validadoEj2) {

      const todasCorrectasEj1 = ejercicio1Categorias.every(c => {

        const respuesta = respuestasEj1[c.id];
        const elemento = ejercicio1Elementos.find(e => e.id === respuesta);
        return elemento && elemento.respuestaCorrecta === c.id;
      });
      const todasCorrectasEj2 = ejercicio2Categorias.every(c => {
        const respuesta = respuestasEj2[c.id];
        const elemento = ejercicio2Elementos.find(e => e.id === respuesta);
        return elemento && elemento.respuestaCorrecta === c.id;
      });

      if (todasCorrectasEj1 && todasCorrectasEj2) {

        setCompletado(true);

      } else {

        setCompletado(false);

      }

    } else {

      setCompletado(false);

    }

  }, [validadoEj1, validadoEj2, respuestasEj1, respuestasEj2]);

const handleReintentar = (ejercicio) => {

    if (ejercicio === 1) {

      const nuevasRespuestas = {};

      ejercicio1Categorias.forEach(c => {

        if (esCorrecta(c.id, 1)) {

          nuevasRespuestas[c.id] = respuestasEj1[c.id];

        }

      });

      setRespuestasEj1(nuevasRespuestas);

      setValidadoEj1(false);

    } else {

      const nuevasRespuestas = {};

      ejercicio2Categorias.forEach(c => {

        if (esCorrecta(c.id, 2)) {

          nuevasRespuestas[c.id] = respuestasEj2[c.id];

        }

      });

      setRespuestasEj2(nuevasRespuestas);

      setValidadoEj2(false);

    }

    setCompletado(false);

  };

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

        body: JSON.stringify({

          modulo_nombre: 'Plan de Inversión',

          paso_nombre: 'Unidad 2: Taller',

          curso_nombre: 'Plan de Inversión'

        })

      });

      navigate('/student/plan-inversion/unidad2/cierre');

    } catch (error) {

      console.error("Error al registrar progreso o navegar:", error);

      navigate('/student/plan-inversion/unidad2/cierre');

    }

  };

const renderEjercicio = (ejercicio) => {

    const categorias = ejercicio === 1 ? ejercicio1Categorias : ejercicio2Categorias;

    const elementos = ejercicio === 1 ? ejercicio1Elementos : ejercicio2Elementos;

    const respuestas = ejercicio === 1 ? respuestasEj1 : respuestasEj2;

    const validado = ejercicio === 1 ? validadoEj1 : validadoEj2;

const elementosUsados = Object.values(respuestas);

return (

      <div className="mb-12">

        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">

          {ejercicio === 1 ? 'Primer ejercicio' : 'Segundo ejercicio'}

        </h3>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Columna Categoría */}

          <div>

            <h4 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white py-3 rounded-t-lg">

              Categoría

            </h4>

            <div className="space-y-3">

              {categorias.map((categoria) => {

                const respuesta = respuestas[categoria.id];
                const esCorrectaRespuesta = validado && esCorrecta(categoria.id, ejercicio);
                const esIncorrecta = validado && respuesta && !esCorrecta(categoria.id, ejercicio);
                const elementoTexto = respuesta ? elementos.find(e => e.id === respuesta)?.texto : '';

return (

                  <div

                    key={categoria.id}

                    className={`rounded-lg p-4 min-h-[120px] border-2 transition-all ${esCorrectaRespuesta

                      ? 'border-green-500 bg-green-50'

                      : esIncorrecta

                        ? 'border-red-500 bg-red-50'

                        : 'border-[#59D22E] bg-green-50'

                      }`}

                    onDragOver={handleDragOver}

                    onDrop={(e) => handleDrop(e, categoria.id, ejercicio)}

                    onContextMenu={handleContextMenu}

                  >

                    <p className="text-sm font-semibold text-gray-900 mb-3">{categoria.texto}</p>

{respuesta ? (

                      <div className={`flex items-center justify-between px-3 py-2 rounded ${esCorrectaRespuesta

                        ? 'bg-green-100 border-2 border-green-500'

                        : esIncorrecta

                          ? 'bg-red-100 border-2 border-red-500'

                          : 'bg-white border-2 border-[#59D22E]'

                        }`}>

                        <span className="text-sm font-semibold text-gray-900 flex-1">{elementoTexto}</span>

                        <div className="flex items-center gap-2">

                          {esCorrectaRespuesta && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}

                          {esIncorrecta && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}

                          {(!validado || esIncorrecta) && (

                            <button

                              onClick={() => handleRemoveAnswer(categoria.id, ejercicio)}

                              className="text-red-600 hover:text-red-800 text-xs font-semibold"

                            >

                              ✕

                            </button>

                          )}

                        </div>

                      </div>

                    ) : (

                      <div className="border-2 border-dashed border-gray-400 rounded p-3 text-center text-gray-500 text-sm">

                        Arrastra aquí la respuesta

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

{/* Columna Elemento */}

          <div>

            <h4 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white py-3 rounded-t-lg">

              Elemento

            </h4>

            <div className="space-y-3">

              {elementos.map((elemento) => {

                const estaUsado = elementosUsados.includes(elemento.id);

return (

                  <div

                    key={elemento.id}

                    draggable={!estaUsado}

                    onDragStart={(e) => handleDragStart(e, elemento.id, ejercicio)}

                    onContextMenu={handleContextMenu}

                    className={`rounded-lg p-4 border-2 text-center cursor-move transition-all ${estaUsado

                      ? 'bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed'

                      : 'bg-white border-[#59D22E] hover:bg-[#59D22E]/5 hover:shadow-md'

                      }`}

                  >

                    <span className="text-sm font-semibold text-gray-900">{elemento.texto}</span>

                  </div>

                );

              })}

            </div>

          </div>

        </div>

{/* Botones de acción */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">

          {!validado && (

            <Button

              onClick={() => validarEjercicio(ejercicio)}

              className="bg-[#59D22E] hover:bg-[#4fb320] text-white px-8 py-3"

            >

              Verificar respuestas

            </Button>

          )}

{validado && (

            <Button

              onClick={() => handleReintentar(ejercicio)}

              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"

            >

              Reintentar incorrectas

            </Button>

          )}

        </div>

      </div>

    );

  };

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

                      Plan de Inversión

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

                        onClick={handleLogout}

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

              Módulos

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <button onClick={() => navigate('/student/plan-inversion')} className="text-gray-600 hover:text-[#006837] transition-colors">

              Plan de Inversión

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Análisis y Estructura Financiera del Plan de Inversión

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

              MÓDULO: Plan de Inversión

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

              Análisis y Estructura Financiera del Plan de Inversión

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

              animate={{ width: '66.66%' }}

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

{/* Main Content */}

      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* Título del Paso e Instrucciones - AL LADO */}

        <div className="flex items-start gap-4 mb-8">

          <h2

            className="text-[#006837] shrink-0"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: '2.25rem',

              fontWeight: 700,

            }}

          >

            Paso 3: Taller

          </h2>

{/* Instrucciones al lado del título */}

          <div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-3 border-[#AA27B9] rounded-xl p-2.5 flex-1 max-w-md">

            <p className="text-gray-700 leading-snug text-xs">

              <strong>📌 Instrucciones:</strong> Este taller te ayudará a proyectar flujos de caja simplificados de tu emprendimiento actual,

              identificar necesidades de inversión futura, y evaluar viabilidad básica usando indicadores.

            </p>

          </div>

        </div>

<motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100"

        >

<div className="mb-8">

            <p className="text-base md:text-lg text-gray-700 mb-6">

              Ahora que ya hemos estudiado los conceptos sobre análisis financiero, realizaremos el siguiente taller para reforzar conocimientos.

            </p>

<div className="bg-gradient-to-r from-[#AA27B9]/10 to-[#d946ef]/10 border-l-4 border-[#AA27B9] rounded-xl p-4 mb-8">

              <p className="text-gray-700 text-sm md:text-base">

                <strong>📌 Instrucción del taller:</strong> Arrastra la opción correcta de la columna Elemento hacia el espacio correspondiente en la columna Categoría.

              </p>

            </div>

{renderEjercicio(1)}

            {renderEjercicio(2)}

{/* Mensaje de éxito */}

            {completado && (

              <div className="mb-8 bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">

                <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />

                <h3 className="text-xl font-bold text-green-900 mb-2">¡Excelente! Has completado correctamente el taller.</h3>

                <p className="text-green-800">Todas tus respuestas son correctas. Puedes continuar al siguiente paso.</p>

              </div>

            )}

{/* Reflexión final */}

            <div className="mt-8 bg-gradient-to-br from-[#59D22E]/10 to-[#A5E811]/10 border-l-4 border-[#59D22E] rounded-xl p-6">

              <p className="text-base md:text-lg text-gray-700 leading-relaxed">

                Un análisis financiero sólido no se limita a calcular cifras: integra fuentes de dinero, proyecciones de ingresos y egresos, indicadores de rentabilidad y escenarios de riesgo. Reconocer cómo se relacionan estos elementos es lo que convierte un plan de inversión en una herramienta confiable para crecer de manera sostenible.

              </p>

            </div>

          </div>

<div className="flex justify-end mt-8">

            <Button

              onClick={handleCompleteStep}

              disabled={!completado}

              className={`px-8 py-4 flex items-center gap-2 ${!completado

                ? 'bg-gray-400 cursor-not-allowed text-white'

                : 'bg-black hover:bg-neutral-800 text-white'

                }`}

            >

              Continuar a Evaluación

              <ChevronRight className="w-5 h-5" />

            </Button>

          </div>

        </motion.div>

      </div>

{/* Botón Atrás - Inferior Izquierda */}

      <div className="fixed bottom-8 left-8 z-40">

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/plan-inversion/unidad2/desarrollo');

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

export default PlanInversionUnidad2TallerPage;


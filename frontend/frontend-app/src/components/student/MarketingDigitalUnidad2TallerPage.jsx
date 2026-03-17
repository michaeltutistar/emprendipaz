import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, ChevronRight, Home, CheckCircle, XCircle, RotateCcw, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Respuestas correctas para cada objetivo

const respuestasCorrectas = {

  objetivo1: {

    especifico: 'Incrementar seguidores',

    medible: 'Alcanzando 500 seguidores',

    alcanzable: 'SI, con contenido de interés para los clientes',

    relevante: 'Si, fortalece el posicionamiento del negocio en redes sociales',

    temporal: '3 meses'

  },

  objetivo2: {

    especifico: 'Incrementar ventas online',

    medible: 'Incrementando las ventas mensuales en 20%',

    alcanzable: 'Si, con descuentos los viernes y en fechas especiales',

    relevante: 'Sí, necesito aumentar ventas',

    temporal: '5 meses'

  }

};

// Elementos disponibles para arrastrar por objetivo (ordenado diferente a categorías SMART para evitar ventaja)

const elementosDisponibles = {

  objetivo1: [

    { id: 'obj1-temporal', texto: '3 meses', categoria: 'temporal' },

    { id: 'obj1-relevante', texto: 'Si, fortalece el posicionamiento del negocio en redes sociales', categoria: 'relevante' },

    { id: 'obj1-medible', texto: 'Alcanzando 500 seguidores', categoria: 'medible' },

    { id: 'obj1-alcanzable', texto: 'SI, con contenido de interés para los clientes', categoria: 'alcanzable' }

  ],

  objetivo2: [

    { id: 'obj2-alcanzable', texto: 'Si, con descuentos los viernes y en fechas especiales', categoria: 'alcanzable' },

    { id: 'obj2-temporal', texto: '5 meses', categoria: 'temporal' },

    { id: 'obj2-especifico', texto: 'Incrementar ventas online', categoria: 'especifico' },

    { id: 'obj2-medible', texto: 'Incrementando las ventas mensuales en 20%', categoria: 'medible' }

  ]

};

const objetivosData = [

  {

    id: 'objetivo1',

    titulo: 'Objetivo general: Incrementar los seguidores de las redes sociales de mi emprendimiento',

    preguntas: {

      especifico: '¿Qué quiero lograr exactamente?',

      medible: '¿Cómo sabré que lo logré? (cuántos)',

      alcanzable: '¿Es realista con los recursos disponibles? (cómo lo haré)',

      relevante: '¿Va acorde con los objetivos del negocio?',

      temporal: '¿En cuánto tiempo lo lograré?'

    },

    prellenado: {

      especifico: 'Incrementar seguidores'

    }

  },

  {

    id: 'objetivo2',

    titulo: 'Objetivo general: Incrementar las ventas online de mi emprendimiento',

    preguntas: {

      especifico: '¿Qué quiero lograr exactamente?',

      medible: '¿Cómo sabré que lo logré? (cuántos)',

      alcanzable: '¿Es realista con los recursos disponibles? (cómo lo haré)',

      relevante: '¿Va acorde con los objetivos del negocio?',

      temporal: '¿En cuánto tiempo lo lograré?'

    },

    prellenado: {

      relevante: 'Sí, necesito aumentar ventas'

    }

  }

];

const MarketingDigitalUnidad2TallerPage = () => {

  const navigate = useNavigate();

  const [asignaciones, setAsignaciones] = useState(() => {

    const saved = localStorage.getItem('md_u2_taller_asignaciones');

    // Inicializar con valores prellenados

    const inicial = {};

    objetivosData.forEach(obj => {

      inicial[obj.id] = { ...obj.prellenado };

    });

if (saved) {

      try {

        const parsed = JSON.parse(saved);

        // Validar y corregir: asegurar que los prellenados estén correctos

        objetivosData.forEach(obj => {

          if (parsed[obj.id]) {

            // Mantener los prellenados correctos

            Object.keys(obj.prellenado || {}).forEach(campo => {

              parsed[obj.id][campo] = obj.prellenado[campo];

            });

          } else {

            parsed[obj.id] = { ...obj.prellenado };

          }

        });

        return parsed;

      } catch (e) {

        return inicial;

      }

    }

    return inicial;

  });

  const [itemsDisponibles, setItemsDisponibles] = useState(() => {

    const saved = localStorage.getItem('md_u2_taller_disponibles');

    // Inicializar con todos los elementos disponibles (excluyendo los prellenados)

    const inicial = {};

    objetivosData.forEach(obj => {

      // Excluir elementos que corresponden a campos prellenados

      const camposPrellenados = Object.keys(obj.prellenado || {});

      inicial[obj.id] = elementosDisponibles[obj.id]

        .filter(item => !camposPrellenados.includes(item.categoria))

        .map(item => item.id);

    });

if (saved) {

      try {

        const parsed = JSON.parse(saved);

        // Validar y corregir: asegurar que los elementos prellenados no estén en disponibles

        objetivosData.forEach(obj => {

          if (!parsed[obj.id]) {

            parsed[obj.id] = inicial[obj.id];

          } else {

            // Filtrar elementos que corresponden a campos prellenados

            const camposPrellenados = Object.keys(obj.prellenado || {});

            const elementosPrellenados = elementosDisponibles[obj.id]

              .filter(item => camposPrellenados.includes(item.categoria))

              .map(item => item.id);

            parsed[obj.id] = parsed[obj.id].filter(id => !elementosPrellenados.includes(id));

            // Asegurar que todos los elementos no prellenados estén disponibles

            const todosNoPrellenados = elementosDisponibles[obj.id]

              .filter(item => !camposPrellenados.includes(item.categoria))

              .map(item => item.id);

            // Agregar los que faltan

            todosNoPrellenados.forEach(id => {

              if (!parsed[obj.id].includes(id)) {

                parsed[obj.id].push(id);

              }

            });

          }

        });

        return parsed;

      } catch (e) {

        return inicial;

      }

    }

    return inicial;

  });

  const [validado, setValidado] = useState(() => {

    const saved = localStorage.getItem('md_u2_taller_validado');

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

    localStorage.setItem('md_u2_taller_asignaciones', JSON.stringify(asignaciones));

  }, [asignaciones]);

useEffect(() => {

    localStorage.setItem('md_u2_taller_disponibles', JSON.stringify(itemsDisponibles));

  }, [itemsDisponibles]);

useEffect(() => {

    localStorage.setItem('md_u2_taller_validado', validado.toString());

  }, [validado]);

const handleDragStart = (e, itemId, objetivoId) => {

    setDraggedItem({ itemId, objetivoId });

    e.dataTransfer.effectAllowed = 'move';

  };

// Prevenir menú contextual en elementos arrastrables

  const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, objetivoId, campo) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(`${objetivoId}-${campo}`);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, objetivoId, campo) => {

    e.preventDefault();

    setDragOver(null);

if (!draggedItem || draggedItem.objetivoId !== objetivoId) return;

const item = elementosDisponibles[objetivoId].find(el => el.id === draggedItem.itemId);

    if (!item) return;

// Si ya hay una respuesta, devolver el elemento anterior a disponibles

    if (asignaciones[objetivoId]?.[campo]) {

      const elementoAnterior = elementosDisponibles[objetivoId].find(

        el => el.texto === asignaciones[objetivoId][campo]

      );

      if (elementoAnterior) {

        setItemsDisponibles(prev => ({

          ...prev,

          [objetivoId]: [...prev[objetivoId], elementoAnterior.id]

        }));

      }

    }

// Asignar el nuevo elemento

    setAsignaciones(prev => ({

      ...prev,

      [objetivoId]: {

        ...prev[objetivoId],

        [campo]: item.texto

      }

    }));

// Remover de disponibles

    setItemsDisponibles(prev => ({

      ...prev,

      [objetivoId]: prev[objetivoId].filter(id => id !== draggedItem.itemId)

    }));

setDraggedItem(null);

    setValidado(false);

  };

const handleRemove = (objetivoId, campo) => {

    // No permitir remover campos prellenados

    const obj = objetivosData.find(o => o.id === objetivoId);

    if (obj?.prellenado?.[campo]) return;

const texto = asignaciones[objetivoId]?.[campo];

    if (!texto) return;

const item = elementosDisponibles[objetivoId].find(el => el.texto === texto);

    if (item) {

      setItemsDisponibles(prev => ({

        ...prev,

        [objetivoId]: [...prev[objetivoId], item.id]

      }));

    }

setAsignaciones(prev => {

      const updated = { ...prev };

      delete updated[objetivoId][campo];

      return updated;

    });

    setValidado(false);

  };

const handleValidate = () => {

    setValidado(true);

  };

const handleReintentar = () => {

    // Solo limpiar las respuestas incorrectas (no tocar prellenados)

    const nuevasAsignaciones = { ...asignaciones };

    const nuevosDisponibles = { ...itemsDisponibles };

objetivosData.forEach(obj => {

      const correctas = respuestasCorrectas[obj.id];

      Object.keys(correctas).forEach(campo => {

        // No tocar campos prellenados

        if (obj.prellenado?.[campo]) return;

if (nuevasAsignaciones[obj.id]?.[campo] !== correctas[campo]) {

          // Es incorrecta, devolver a disponibles

          const texto = nuevasAsignaciones[obj.id]?.[campo];

          if (texto) {

            const item = elementosDisponibles[obj.id].find(el => el.texto === texto);

            if (item && !nuevosDisponibles[obj.id].includes(item.id)) {

              nuevosDisponibles[obj.id].push(item.id);

            }

          }

          // Eliminar de asignaciones

          delete nuevasAsignaciones[obj.id][campo];

        }

      });

    });

setAsignaciones(nuevasAsignaciones);

    setItemsDisponibles(nuevosDisponibles);

    setValidado(false);

  };

const isCorrecto = (objetivoId, campo) => {

    if (!validado) return null;

    return asignaciones[objetivoId]?.[campo] === respuestasCorrectas[objetivoId]?.[campo];

  };

const isIncorrecto = (objetivoId, campo) => {

    if (!validado) return false;

    const asignado = asignaciones[objetivoId]?.[campo];

    return asignado && asignado !== respuestasCorrectas[objetivoId]?.[campo];

  };

const isPrellenado = (objetivoId, campo) => {

    const obj = objetivosData.find(o => o.id === objetivoId);

    return obj?.prellenado?.[campo] !== undefined;

  };

const isEditable = (objetivoId, campo) => {

    // Los campos prellenados nunca son editables

    if (isPrellenado(objetivoId, campo)) return false;

    if (!validado) return true;

    return !isCorrecto(objetivoId, campo);

  };

const allCompletos = () => {

    return objetivosData.every(obj => {

      const elementosSMART = ['especifico', 'medible', 'alcanzable', 'relevante', 'temporal'];

      return elementosSMART.every(campo => asignaciones[obj.id]?.[campo]);

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

          paso_nombre: 'Unidad 2: Taller',

          curso_nombre: 'Marketing Digital'

        })

      });

      navigate('/student/marketing-digital/unidad2/cierre');

    } catch (error) {

      navigate('/student/marketing-digital/unidad2/cierre');

    }

  };

const elementosSMART = ['especifico', 'medible', 'alcanzable', 'relevante', 'temporal'];

  const colores = {

    especifico: 'border-blue-600',

    medible: 'border-green-600',

    alcanzable: 'border-yellow-600',

    relevante: 'border-purple-600',

    temporal: 'border-red-600'

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

                      Unidad 2 · Taller

                    </p>

                  </div>

                </motion.div>

              )}

<div className="flex justify-end">

                <div className="relative z-[10000]">

                  <button

                    onClick={() => setUserMenuOpen(!userMenuOpen)}

                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"

                  >

                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 overflow-hidden">

                      {fotoPerfilUrl ? (

                        <img

                          src={fotoPerfilUrl}

                          alt="Foto de perfil"

                          className="w-full h-full object-cover"

                          onError={(e) => {

                            e.currentTarget.style.display = 'none';

                            const fallback = e.currentTarget.nextElementSibling;

                            if (fallback) fallback.style.display = 'flex';

                          }}

                        />

                      ) : null}

                      <span 

                        className="text-white font-semibold text-sm"

                        style={{ display: fotoPerfilUrl ? 'none' : 'flex' }}

                      >

                        {userName.charAt(0).toUpperCase() || 'U'}

                      </span>

                    </div>

                    <ChevronDown className="w-4 h-4 text-white" />

                  </button>

{userMenuOpen && (

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[10001] border">

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

                Metas de Marketing Digital

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

              <span className="text-white font-semibold">Unidad 2 · Taller</span>

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

              Metas de Marketing Digital · Taller

            </h1>

            <p className="text-white/80 max-w-2xl text-sm md:text-base mb-8">

              Define objetivos SMART para tu emprendimiento mediante un ejercicio interactivo de arrastrar y soltar.

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

            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Taller: Definiendo objetivos SMART</h2>

            <div className="bg-neutral-100 border-l-4 border-neutral-900 p-4 rounded">

              <p className="text-neutral-700 text-sm md:text-base mb-2">

                <strong>📌 Instrucciones:</strong> Arrastra cada elemento hacia la pregunta correspondiente según la metodología SMART.

              </p>

            </div>

          </div>

<div className="space-y-8">

            {objetivosData.map((obj, index) => {

              return (

                <div key={obj.id} className="bg-white border-2 border-neutral-200 rounded-lg p-6">

                  <h3 className="text-lg font-semibold text-neutral-900 mb-6">{index + 1}) {obj.titulo}</h3>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Columna izquierda: Elementos SMART */}

                    <div className="space-y-4">

                      <h4 className="font-semibold text-neutral-900 mb-3">Elementos SMART</h4>

                      <div className="space-y-3">

                        {elementosSMART.map((elemento) => {

                        const asignado = asignaciones[obj.id]?.[elemento];

                        const esCorrecto = isCorrecto(obj.id, elemento);

                        const esIncorrecto = isIncorrecto(obj.id, elemento);

                        const editable = isEditable(obj.id, elemento);

                        const prellenado = isPrellenado(obj.id, elemento);

                        const dragOverKey = `${obj.id}-${elemento}`;

                        const isDragOver = dragOver === dragOverKey;

return (

                          <div

                            key={elemento}

                            onDragOver={(e) => editable && handleDragOver(e, obj.id, elemento)}

                            onDragLeave={handleDragLeave}

                            onDrop={(e) => editable && handleDrop(e, obj.id, elemento)}

                            onContextMenu={handleContextMenu}

                            className={`min-h-[100px] p-4 rounded-lg border-2 transition-all select-none ${

                              prellenado

                                ? 'border-neutral-400 bg-neutral-100'

                                : isDragOver

                                  ? 'border-neutral-900 bg-neutral-100 border-dashed'

                                  : esCorrecto

                                    ? 'border-green-500 bg-green-50'

                                    : esIncorrecto

                                      ? 'border-red-500 bg-red-50'

                                      : asignado

                                        ? 'border-neutral-300 bg-neutral-50'

                                        : 'border-neutral-200 bg-white border-dashed'

                            }`}

                          >

                            <p className="text-xs font-semibold text-neutral-500 mb-1 uppercase">

                              {elemento === 'especifico' ? 'Específico' : elemento === 'medible' ? 'Medible' : elemento === 'alcanzable' ? 'Alcanzable' : elemento === 'relevante' ? 'Relevante' : 'Temporal'}

                            </p>

                            <p className="text-sm text-neutral-700 mb-2">{obj.preguntas[elemento]}</p>

                            {asignado ? (

                              <div className="flex items-center justify-between">

                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-1 ${

                                  prellenado

                                    ? 'bg-neutral-300 text-neutral-700'

                                    : esCorrecto

                                      ? 'bg-green-100 text-green-800'

                                      : esIncorrecto

                                        ? 'bg-red-100 text-red-800'

                                        : 'bg-neutral-200 text-neutral-700'

                                }`}>

                                  {validado && !prellenado && (

                                    <>

                                      {esCorrecto ? (

                                        <CheckCircle className="w-4 h-4" />

                                      ) : (

                                        <XCircle className="w-4 h-4" />

                                      )}

                                    </>

                                  )}

                                  {prellenado && (

                                    <span className="text-xs text-neutral-500 italic">(Bloqueado)</span>

                                  )}

                                  <span className="text-sm font-semibold">{asignado}</span>

                                </div>

                                {!validado && !prellenado && (

                                  <button

                                    onClick={() => handleRemove(obj.id, elemento)}

                                    className="text-xs text-neutral-500 hover:text-neutral-700 underline ml-2"

                                  >

                                    Quitar

                                  </button>

                                )}

                              </div>

                            ) : (

                              <p className="text-xs text-neutral-400 italic">Arrastra un elemento aquí</p>

                            )}

                            {validado && esIncorrecto && (

                              <p className="text-xs text-green-700 mt-2 font-semibold">

                                Correcto: {respuestasCorrectas[obj.id][elemento]}

                              </p>

                            )}

                          </div>

                        );

                      })}

                      </div>

                    </div>

{/* Columna derecha: Opciones disponibles */}

                    <div className="space-y-4">

                      <h4 className="font-semibold text-neutral-900 mb-3">Opciones disponibles</h4>

                      <div className="space-y-3">

                        {elementosDisponibles[obj.id]

                          .filter(item => itemsDisponibles[obj.id]?.includes(item.id))

                          .map((item) => {

                            const estaDisponible = itemsDisponibles[obj.id]?.includes(item.id);

                            const estaAsignada = Object.values(asignaciones[obj.id] || {}).includes(item.texto);

if (!estaDisponible && estaAsignada) {

                              return null;

                            }

return (

                              <div

                                key={item.id}

                                draggable={estaDisponible}

                                onDragStart={estaDisponible ? (e) => handleDragStart(e, item.id, obj.id) : undefined}

                                onContextMenu={handleContextMenu}

                                className={`px-4 py-3 rounded-lg border-2 transition-all cursor-move select-none ${

                                  estaDisponible

                                    ? 'bg-white border-neutral-300 hover:border-neutral-900 hover:shadow-md active:opacity-70'

                                    : 'bg-neutral-100 border-neutral-200 opacity-50 cursor-not-allowed'

                                }`}

                              >

                                <span className="text-sm text-neutral-900">{item.texto}</span>

                              </div>

                            );

                          })}

                      </div>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

{/* Botones de acción */}

          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-neutral-200">

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

            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2.2.5 Reflexión final y recomendaciones</h2>

            <p className="text-sm md:text-base mb-3">

              Recuerda que definir un objetivo mediante la metodología SMART nos brinda una ruta clara y específica de aquello que deseamos alcanzar con un límite de tiempo establecido, que, además, nos permite realizar un seguimiento frente al alcance o no del objetivo. Los objetivos que definamos deben estar alineados con las capacidades de nuestro emprendimiento y sus objetivos de negocio.

            </p>

            <p className="text-sm md:text-base mb-3">

              Ahora que ya conoces la importancia de definir un objetivo de marketing digital y la metodología para diseñarlo, aplícala en tu emprendimiento de una manera más detallada y con mayor análisis.

            </p>

            <p className="text-sm md:text-base">

              Ahora que ya sabemos cómo definir adecuadamente nuestros objetivos de marketing digital, en la unidad 3 desarrollaremos las estrategias necesarias para alcanzarlos.

            </p>

          </div>

<div className="mt-8 flex justify-end">

            <Button

              onClick={handleCompleteStep}

              disabled={!allCompletos()}

              className={`px-8 py-4 flex items-center gap-2 ${

                allCompletos()

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

          onClick={() => navigate('/student/marketing-digital/unidad2')}

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

export default MarketingDigitalUnidad2TallerPage;


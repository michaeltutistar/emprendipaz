import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, Home, ChevronRight, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Ajustes estacionales predefinidos (en porcentaje)

const ajustesEstacionales = {

  enero: -20.00,

  febrero: -20.00,

  marzo: -40.00,

  abril: 10.00,

  mayo: 15.00,

  junio: 20.00,

  julio: 10.00,

  agosto: 5.00,

  septiembre: 20.00,

  octubre: 5.00,

  noviembre: 10.00,

  diciembre: 90.00

};

const meses = [

  { id: 'enero', nombre: 'Enero', ajuste: ajustesEstacionales.enero },

  { id: 'febrero', nombre: 'Febrero', ajuste: ajustesEstacionales.febrero },

  { id: 'marzo', nombre: 'Marzo', ajuste: ajustesEstacionales.marzo },

  { id: 'abril', nombre: 'Abril', ajuste: ajustesEstacionales.abril },

  { id: 'mayo', nombre: 'Mayo', ajuste: ajustesEstacionales.mayo },

  { id: 'junio', nombre: 'Junio', ajuste: ajustesEstacionales.junio },

  { id: 'julio', nombre: 'Julio', ajuste: ajustesEstacionales.julio },

  { id: 'agosto', nombre: 'Agosto', ajuste: ajustesEstacionales.agosto },

  { id: 'septiembre', nombre: 'Septiembre', ajuste: ajustesEstacionales.septiembre },

  { id: 'octubre', nombre: 'Octubre', ajuste: ajustesEstacionales.octubre },

  { id: 'noviembre', nombre: 'Noviembre', ajuste: ajustesEstacionales.noviembre },

  { id: 'diciembre', nombre: 'Diciembre', ajuste: ajustesEstacionales.diciembre }

];

const PlanNegocioFinanzasPage = () => {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const isScrolledRef = useRef(false);

const [diasMes, setDiasMes] = useState(() => {

    const saved = localStorage.getItem('pn_finanzas_dias_más');

    // Si el valor guardado es el valor por defecto antiguo de este campo, limpiarlo

    if (saved === '26') {

      localStorage.removeItem('pn_finanzas_dias_más');

      return '';

    }

    return (saved && saved.trim() !== '') ? saved : '';

  });

  const [clientesDia, setClientesDia] = useState(() => {

    const saved = localStorage.getItem('pn_finanzas_clientes_dia');

    // Si el valor guardado es el valor por defecto antiguo de este campo, limpiarlo

    if (saved === '80') {

      localStorage.removeItem('pn_finanzas_clientes_dia');

      return '';

    }

    return (saved && saved.trim() !== '') ? saved : '';

  });

  const [dineroCliente, setDineroCliente] = useState(() => {

    const saved = localStorage.getItem('pn_finanzas_dinero_cliente');

    // Si el valor guardado es el valor por defecto antiguo de este campo, limpiarlo

    if (saved === '25000') {

      localStorage.removeItem('pn_finanzas_dinero_cliente');

      return '';

    }

    return (saved && saved.trim() !== '') ? saved : '';

  });

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

    // Solo guardar en localStorage si tiene un valor, si está vacío, guardar string vacío

    localStorage.setItem('pn_finanzas_dias_más', diasMes || '');

  }, [diasMes]);

useEffect(() => {

    localStorage.setItem('pn_finanzas_clientes_dia', clientesDia || '');

  }, [clientesDia]);

useEffect(() => {

    localStorage.setItem('pn_finanzas_dinero_cliente', dineroCliente || '');

  }, [dineroCliente]);

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

// Función para calcular puntos: si diligencia los 3 espacios = 1 punto, si no diligencia nada = 0 puntos

  const calcularPuntos = () => {

    const camposCompletados = [

      diasMes && diasMes.trim() !== '',

      clientesDia && clientesDia.trim() !== '',

      dineroCliente && dineroCliente.trim() !== ''

    ].filter(Boolean).length;

// Si diligencia los 3 espacios = 1 punto, si no diligencia nada = 0 puntos

    return camposCompletados === 3 ? 1 : 0;

  };

// Cálculos

  const diasMesNum = parseFloat(diasMes) || 0;

  const clientesDiaNum = parseFloat(clientesDia) || 0;

  const dineroClienteNum = parseFloat(dineroCliente) || 0;

const clientesAlMes = diasMesNum * clientesDiaNum;

const calcularProyeccion = () => {

    return meses.map(más => {

      const clientesPorTemporada = Math.round(clientesAlMes * (1 + más.ajuste / 100));

      const ventasMensuales = clientesPorTemporada * dineroClienteNum;

      return {

        ...más,

        clientesAlMes: clientesAlMes,

        clientesPorTemporada,

        ventasMensuales

      };

    });

  };

const proyeccion = calcularProyeccion();

  const totalClientesAnual = proyeccion.reduce((sum, más) => sum + más.clientesPorTemporada, 0);

  const totalVentasAnual = proyeccion.reduce((sum, más) => sum + más.ventasMensuales, 0);

const formatCurrency = (value) => {

    return new Intl.NumberFormat('es-CO', {

      style: 'currency',

      currency: 'COP',

      minimumFractionDigits: 2,

      maximumFractionDigits: 2

    }).format(value);

  };

const formatPercentage = (value) => {

    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

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

                      Finanzas

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Plan de Negocio

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

{/* Breadcrumb */}

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

              onClick={() => navigate('/student/finanzas')}

              className="text-gray-600 hover:text-[#006837] transition-colors"

            >

              Finanzas

            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <span className="text-[#AA27B9] font-bold text-base">

              Plan de Negocio

            </span>

          </div>

        </div>

      </motion.div>

{/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] pt-8 pb-16 px-8">

        <div className="max-w-7xl mx-auto relative z-10">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            <p className="text-white/70 uppercase text-sm tracking-wider mb-3">MÓDULO: Finanzas</p>

            <h1

              className="text-white mb-6"

              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}

            >

              Plan de Negocio

            </h1>

          </motion.div>

        </div>

<div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path

              d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z"

              fill="white"

            />

          </svg>

        </div>

      </section>

{/* Contenido Principal */}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">

          <div className="mb-8">

            <p className="text-neutral-700 text-base md:text-lg mb-4 leading-relaxed">

              Ahora que has completado el módulo de Finanzas y Gestión Empresarial, es momento de contribuir a tu plan de negocio.

            </p>

            <p className="text-neutral-700 text-base md:text-lg mb-4 leading-relaxed">

              A continuación, deberás completar los siguientes datos para generar una proyección de ventas de un año de tu emprendimiento:

            </p>

            <ul className="list-disc list-inside text-neutral-700 text-base md:text-lg mb-4 space-y-2 ml-4">

              <li>¿Cuántos días al mes presta servicio mi emprendimiento?</li>

              <li>¿Cuántos clientes al día en promedio atiendo en mi emprendimiento?</li>

              <li>¿Cuánto dinero gasta un cliente en cada compra en promedio?</li>

            </ul>

            <p className="text-neutral-700 text-base md:text-lg leading-relaxed">

              El sistema generará automáticamente una tabla completa con la proyección de ventas del año.

            </p>

          </div>

{/* Formulario de Inputs */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-gradient-to-br from-[#006837] to-[#59D22E] rounded-lg p-6 text-white">

              <label className="block text-sm font-semibold mb-3">

                ¿Cuántos días al mes presta servicio mi emprendimiento?

              </label>

              <input

                type="number"

                value={diasMes}

                onChange={(e) => setDiasMes(e.target.value)}

                className="w-full px-4 py-3 rounded-lg bg-white text-neutral-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-white"

                min="1"

                max="31"

                placeholder=""

              />

            </div>

<div className="bg-gradient-to-br from-[#006837] to-[#59D22E] rounded-lg p-6 text-white">

              <label className="block text-sm font-semibold mb-3">

                ¿Cuántos clientes al día en promedio atiendo en mi emprendimiento?

              </label>

              <input

                type="number"

                value={clientesDia}

                onChange={(e) => setClientesDia(e.target.value)}

                className="w-full px-4 py-3 rounded-lg bg-white text-neutral-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-white"

                min="1"

                placeholder=""

              />

            </div>

<div className="bg-gradient-to-br from-[#006837] to-[#59D22E] rounded-lg p-6 text-white">

              <label className="block text-sm font-semibold mb-3">

                ¿Cuánto dinero gasta un cliente en cada compra en promedio?

              </label>

              <input

                type="number"

                value={dineroCliente}

                onChange={(e) => setDineroCliente(e.target.value)}

                className="w-full px-4 py-3 rounded-lg bg-white text-neutral-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-white"

                min="0"

                placeholder=""

              />

            </div>

          </div>

{/* Tabla de Proyección */}

          <div className="mt-8">

            <h2 className="text-2xl font-bold text-neutral-900 mb-4">PROYECCIÓN DE VENTAS DE MI EMPRENDIMIENTO</h2>

<div className="overflow-x-auto">

              <table className="w-full border-collapse border border-neutral-300">

                <thead>

                  <tr className="bg-[#006837] text-white">

                    <th className="border border-neutral-300 px-4 py-3 text-left font-semibold">Mes</th>

                    <th className="border border-neutral-300 px-4 py-3 text-center font-semibold">Número de clientes que atiendo al mes</th>

                    <th className="border border-neutral-300 px-4 py-3 text-center font-semibold">Clientes que atiendo al mes con ajuste en porcentaje por temporada</th>

                    <th className="border border-neutral-300 px-4 py-3 text-center font-semibold">Número de clientes por temporada</th>

                    <th className="border border-neutral-300 px-4 py-3 text-center font-semibold">Ventas mensuales</th>

                  </tr>

                </thead>

                <tbody>

                  {proyeccion.map((más, index) => (

                    <tr key={más.id} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>

                      <td className="border border-neutral-300 px-4 py-3 font-semibold text-neutral-900">{más.nombre}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-center text-neutral-700">{más.clientesAlMes.toLocaleString('es-CO')}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-center text-neutral-700">{formatPercentage(más.ajuste)}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-center text-neutral-700 font-semibold">{más.clientesPorTemporada.toLocaleString('es-CO')}</td>

                      <td className="border border-neutral-300 px-4 py-3 text-center text-neutral-700 font-semibold">{formatCurrency(más.ventasMensuales)}</td>

                    </tr>

                  ))}

                  <tr className="bg-[#006837] text-white font-bold">

                    <td className="border border-neutral-300 px-4 py-3">TOTAL ANUAL</td>

                    <td className="border border-neutral-300 px-4 py-3 text-center">-</td>

                    <td className="border border-neutral-300 px-4 py-3 text-center">-</td>

                    <td className="border border-neutral-300 px-4 py-3 text-center">{totalClientesAnual.toLocaleString('es-CO')}</td>

                    <td className="border border-neutral-300 px-4 py-3 text-center">{formatCurrency(totalVentasAnual)}</td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

{/* Botón Finalizar Plan de Negocio */}

          <div className="mt-8 text-center">

            <Button

              onClick={async () => {

                try {

                  const token = getAuthToken();

// Calcular puntos: si diligencia los 3 espacios = 1 punto, si no = 0 puntos

                  const camposCompletados = [

                    diasMes && diasMes.trim() !== '',

                    clientesDia && clientesDia.trim() !== '',

                    dineroCliente && dineroCliente.trim() !== ''

                  ].filter(Boolean).length;

const puntosTotales = camposCompletados === 3 ? 1 : 0;

// Preparar respuestas con puntos para enviar al backend

                  const respuestasConPuntos = [];

// Construir descripción de los datos ingresados (máximo 200 caracteres)

                  let descripcionFinal = `Días/más: ${diasMes || 'N/A'}, Clientes/día: ${clientesDia || 'N/A'}, Dinero/cliente: ${dineroCliente || 'N/A'}`;

                  if (descripcionFinal.length > 180) {

                    descripcionFinal = descripcionFinal.substring(0, 177) + '...';

                  }

// Registrar puntos del plan de negocio

                  if (puntosTotales > 0) {

                    respuestasConPuntos.push({

                      pregunta: 'datos_financieros',

                      respuesta: descripcionFinal,

                      puntos: puntosTotales

                    });

await fetch(`${API_BASE_URL}/registrar-puntos-plan-negocio`, {

                      method: 'POST',

                      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                      body: JSON.stringify({

                        modulo_nombre: 'Finanzas',

                        estrategias: respuestasConPuntos.map(r => ({

                          etapa: r.pregunta,

                          estrategia: r.respuesta,

                          puntos: r.puntos

                        }))

                      })

                    });

                  }

// Guardar respuestas completas en el backend para persistencia

                  await fetch(`${API_BASE_URL}/save-respuestas-plan`, {

                    method: 'POST',

                    headers: {

                      'Content-Type': 'application/json',

                      ...(token ? { 'Authorization': `Bearer ${token}` } : {})

                    },

                    body: JSON.stringify({

                      modulo_nombre: 'Finanzas',

                      respuestas: {

                        diasMes,

                        clientesDia,

                        dineroCliente

                      }

                    })

                  });

// Registrar progreso del modulo

                  await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify({

                      modulo_nombre: 'Finanzas',

                      paso_nombre: 'Plan de Negocio',

                      curso_nombre: 'Finanzas'

                    })

                  });

localStorage.setItem('finanzas_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  alert('¡Plan de Negocio completado! El siguiente módulo ha sido desbloqueado.');

                  navigate('/student/modulos');

                } catch (error) {

                  console.error('Error al registrar progreso:', error);

                  localStorage.setItem('finanzas_plan_negocio_completado', 'true');

                  window.dispatchEvent(new Event('progreso-actualizado'));

                  navigate('/student/modulos');

                }

              }}

              className="bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] hover:from-[#FFEB3B] hover:to-[#AA27B9] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105"

            >

              Finalizar Plan de Negocio

            </Button>

          </div>

        </div>

      </div>

{/* Botón Atrás */}

      <div className="fixed bottom-8 left-4 md:left-8 z-40">

        <Button

          onClick={() => navigate('/student/finanzas')}

          className="bg-white hover:bg-neutral-100 text-neutral-900 border-2 border-neutral-900 rounded-full px-4 md:px-6 py-3 flex items-center gap-2 shadow-lg"

        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">Atrás</span>

        </Button>

      </div>

<Footer />

    </div >

  );

};

export default PlanNegocioFinanzasPage;


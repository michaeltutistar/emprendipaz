import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { motion } from 'framer-motion';

import { ArrowLeft, BookOpen, FileText, Download, ChevronRight } from 'lucide-react';

import { Button } from '../ui/button';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';
import { getFormData } from '@/utils/offline-storage';

const PlanNegociosPage = () => {

  const navigate = useNavigate();
  const { estudianteId } = useParams();
  const [searchParams] = useSearchParams();
  const isInstructorView = Boolean(estudianteId);
  const autoPrint = searchParams.get('print') === '1';
  const shouldAutoClose = searchParams.get('close') === '1';
  const requestedTab = searchParams.get('tab') === 'formulario' ? 'formulario' : 'fundamentacion';

  const [activeTab, setActiveTab] = useState(requestedTab);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [didAutoPrint, setDidAutoPrint] = useState(false);

  const [formData, setFormData] = useState({

    unidad1: '',

    unidad2: '',

    unidad3: '',

  });

const [descubrimientoData, setDescubrimientoData] = useState(null);

  const [modeloData, setModeloData] = useState(null);

  const [marketingData, setMarketingData] = useState(null);

  const [marketingDigitalData, setMarketingDigitalData] = useState(null);

  const [atenciónClienteData, setAtencionClienteData] = useState(null);

  const [trabajoEquipoData, setTrabajoEquipoData] = useState(null);

  const [finanzasData, setFinanzasData] = useState(null);

// Constants for financial projection

  const ajustesEstacionales = {

    enero: -20.00, febrero: -20.00, marzo: -40.00, abril: 10.00,

    mayo: 15.00, junio: 20.00, julio: 10.00, agosto: 5.00,

    septiembre: 20.00, octubre: 5.00, noviembre: 10.00, diciembre: 90.00

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

const parseLocalJson = (key) => {

    try {

      const raw = localStorage.getItem(key);

      return raw ? JSON.parse(raw) : null;

    } catch {

      return null;

    }

  };

const getOfflinePlanData = async (moduleNames = [], localKeys = []) => {

    for (const moduleName of moduleNames) {

      const indexedData = await getFormData(`plan-negocio:respuestas:${moduleName}`);

      if (indexedData?.respuestas) return indexedData.respuestas;

      if (indexedData) return indexedData;

    }

    for (const key of localKeys) {

      const localData = parseLocalJson(key);

      if (localData) return localData;

    }

    return null;

  };

const getOfflineFinanzasData = async () => {

    const indexedData = await getFormData('plan-negocio:respuestas:Finanzas');

    if (indexedData?.respuestas) return indexedData.respuestas;

    if (indexedData) return indexedData;

    const diasMes = localStorage.getItem('pn_finanzas_dias_mes');

    const clientesDia = localStorage.getItem('pn_finanzas_clientes_dia');

    const dineroCliente = localStorage.getItem('pn_finanzas_dinero_cliente');

    if (!diasMes && !clientesDia && !dineroCliente) return null;

    return {

      diasMes: diasMes ? Number(diasMes) : null,

      clientesDia: clientesDia ? Number(clientesDia) : null,

      dineroCliente: dineroCliente ? Number(dineroCliente) : null

    };

  };

useEffect(() => {

    const fetchData = async () => {

      try {

        const token = getAuthToken();

        const endpoint = isInstructorView
          ? `${API_BASE_URL}/get-respuestas-plan?usuario_id=${encodeURIComponent(estudianteId)}`
          : `${API_BASE_URL}/get-respuestas-plan`;

        const response = await fetch(endpoint, {

          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }

        });

        const data = await response.json().catch(() => ({}));

if (data.success && data.respuestas) {

          if (data.respuestas['Descubrimiento de Oportunidades']) {

            setDescubrimientoData(data.respuestas['Descubrimiento de Oportunidades']);

          }

          if (data.respuestas['Modelo de Negocios']) {

            setModeloData(data.respuestas['Modelo de Negocios']);

          }

          if (data.respuestas['Marketing y Comercialización']) {

            setMarketingData(data.respuestas['Marketing y Comercialización']);

          }

          if (data.respuestas['Marketing Digital']) {

            setMarketingDigitalData(data.respuestas['Marketing Digital']);

          }

          if (data.respuestas['Atención al Cliente']) {

            setAtencionClienteData(data.respuestas['Atención al Cliente']);

          }

          if (data.respuestas['Trabajo en Equipo']) {

            setTrabajoEquipoData(data.respuestas['Trabajo en Equipo']);

          }

          if (data.respuestas['Finanzas']) {

            setFinanzasData(data.respuestas['Finanzas']);

          }

        }

// Fallback al localstorage si no hay datos en el backend (compatibilidad)

        if (!data.success || !data.respuestas || !data.respuestas['Descubrimiento de Oportunidades']) {
          const offlineData = await getOfflinePlanData(
            ['Descubrimiento de Oportunidades'],
            ['plan_negocio_descubrimiento']
          );
          if (offlineData) setDescubrimientoData(offlineData);

        }

        if (!data.success || !data.respuestas || !data.respuestas['Modelo de Negocios']) {
          const offlineData = await getOfflinePlanData(
            ['Modelo de Negocios'],
            ['plan_negocio_modelo_negocios']
          );
          if (offlineData) setModeloData(offlineData);

        }

        if (!data.success || !data.respuestas || !data.respuestas['Marketing y Comercialización']) {
          const offlineData = await getOfflinePlanData(
            ['Marketing y Comercialización'],
            ['plan_negocio_marketing']
          );
          if (offlineData) setMarketingData(offlineData);

        }

        if (!data.success || !data.respuestas || !data.respuestas['Marketing Digital']) {
          const offlineData = await getOfflinePlanData(
            ['Marketing Digital'],
            ['plan_negocio_marketing_digital']
          );
          if (offlineData) setMarketingDigitalData(offlineData);

        }

        if (!data.success || !data.respuestas || !data.respuestas['Atención al Cliente']) {
          const offlineData = await getOfflinePlanData(
            ['Atención al Cliente', 'Atención al Cliente y Resolución de Conflictos'],
            ['plan_negocio_atención_cliente']
          );
          if (offlineData) setAtencionClienteData(offlineData);

        }

        if (!data.success || !data.respuestas || !data.respuestas['Trabajo en Equipo']) {
          const offlineData = await getOfflinePlanData(
            ['Trabajo en Equipo'],
            ['plan_negocio_equipo']
          );
          if (offlineData) setTrabajoEquipoData(offlineData);

        }

        if (!data.success || !data.respuestas || !data.respuestas['Finanzas']) {
          const offlineData = await getOfflineFinanzasData();
          if (offlineData) setFinanzasData(offlineData);

        }

} catch (error) {

        console.error('Error fetching plan responses:', error);

        const [
          descubrimientoOffline,
          modeloOffline,
          marketingOffline,
          marketingDigitalOffline,
          atencionOffline,
          trabajoOffline,
          finanzasOffline
        ] = await Promise.all([
          getOfflinePlanData(['Descubrimiento de Oportunidades'], ['plan_negocio_descubrimiento']),
          getOfflinePlanData(['Modelo de Negocios'], ['plan_negocio_modelo_negocios']),
          getOfflinePlanData(['Marketing y Comercialización'], ['plan_negocio_marketing']),
          getOfflinePlanData(['Marketing Digital'], ['plan_negocio_marketing_digital']),
          getOfflinePlanData(['Atención al Cliente', 'Atención al Cliente y Resolución de Conflictos'], ['plan_negocio_atención_cliente']),
          getOfflinePlanData(['Trabajo en Equipo'], ['plan_negocio_equipo']),
          getOfflineFinanzasData()
        ]);

        if (descubrimientoOffline) setDescubrimientoData(descubrimientoOffline);
        if (modeloOffline) setModeloData(modeloOffline);
        if (marketingOffline) setMarketingData(marketingOffline);
        if (marketingDigitalOffline) setMarketingDigitalData(marketingDigitalOffline);
        if (atencionOffline) setAtencionClienteData(atencionOffline);
        if (trabajoOffline) setTrabajoEquipoData(trabajoOffline);
        if (finanzasOffline) setFinanzasData(finanzasOffline);

      } finally {
        setPlanLoaded(true);
      }

    };

fetchData();

  }, [estudianteId, isInstructorView]);

useEffect(() => {
  if (!autoPrint || !planLoaded || didAutoPrint) return;
  setDidAutoPrint(true);

  const finishPrint = () => {
    if (shouldAutoClose) {
      window.setTimeout(() => {
        window.close();
      }, 200);
    }
  };

  window.addEventListener('afterprint', finishPrint, { once: true });
  const timeoutId = window.setTimeout(() => {
    window.focus();
    window.print();
  }, 700);

  return () => {
    window.clearTimeout(timeoutId);
    window.removeEventListener('afterprint', finishPrint);
  };
}, [autoPrint, didAutoPrint, planLoaded, shouldAutoClose]);

const handleInputChange = (unidad, value) => {

    setFormData(prev => ({

      ...prev,

      [unidad]: value

    }));

  };

const handleGeneratePlan = () => {

    window.print();

  };

return (

    <div className="min-h-screen bg-gradient-to-br from-[#006837] via-[#00844a] to-[#59D22E]">

      <style>{`

        @media print {

          @page { margin: 1cm; size: A4; }

          body { 

            -webkit-print-color-adjust: exact; 

            print-color-adjust: exact;

            background: white !important;

          }

          .no-print, .print\\:hidden { display: none !important; }

          /* Ensure all result containers are visible */

          .overflow-x-auto { overflow: visible !important; }

          /* Add some scaling if needed to fit A4 (~170mm content) */

          .print-layout-container { width: 100% !important; max-width: 170mm !important; margin: 0 auto !important; }

        }

      `}</style>

      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-24">

        {/* Título */}

        <motion.div

          initial={{ opacity: 0, y: -20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.6 }}

          className="text-center mb-12"

        >

          <h1

            className="text-white mb-4"

            style={{

              fontFamily: 'var(--font-heading)',

              fontSize: 'clamp(2.5rem, 5vw, 4rem)',

              fontWeight: 800,

              letterSpacing: '-0.02em',

              textShadow: '0 4px 20px rgba(0,0,0,0.3)'

            }}

          >

            Plan de Negocio

          </h1>

          <p className="text-white/90 text-lg max-w-3xl mx-auto shadow-sm">

            Construye tu plan de negocio paso a paso con las actividades de cada unidad

          </p>

        </motion.div>

{/* Tabs */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.6, delay: 0.2 }}

          className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"

        >

          {/* Tab Headers */}

          <div className="flex border-b border-gray-100 p-2 gap-2">

            <button

              onClick={() => setActiveTab('fundamentacion')}

              className={`flex-1 px-8 py-6 rounded-3xl flex items-center justify-center gap-3 transition-all relative ${activeTab === 'fundamentacion'

                ? 'bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white shadow-lg'

                : 'bg-white text-gray-500 hover:bg-gray-50'

                } no-print`}

              style={{

                fontFamily: 'var(--font-heading)',

                fontWeight: 700,

                fontSize: '1.25rem',

              }}

            >

              <BookOpen className="w-6 h-6" />

              <span>Fundamentación</span>

            </button>

<button

              onClick={() => setActiveTab('formulario')}

              className={`flex-1 px-8 py-6 rounded-3xl flex items-center justify-center gap-3 transition-all relative ${activeTab === 'formulario'

                ? 'bg-gradient-to-r from-[#AA27B9] to-[#8E1FA3] text-white shadow-lg'

                : 'bg-white text-gray-500 hover:bg-gray-50'

                }`}

              style={{

                fontFamily: 'var(--font-heading)',

                fontWeight: 700,

                fontSize: '1.25rem',

              }}

            >

              <FileText className="w-6 h-6" />

              <span>Ejercicios</span>

            </button>

          </div>

{/* Tab Content */}

          <div className="p-8 md:p-12">

            {activeTab === 'fundamentacion' ? (

              <motion.div

                key="fundamentacion"

                initial={{ opacity: 0, x: -20 }}

                animate={{ opacity: 1, x: 0 }}

                transition={{ duration: 0.4 }}

                className="space-y-12 max-w-5xl mx-auto"

              >

                {/* Introducción */}

                <section className="prose prose-lg max-w-none text-gray-700">

                  <div className="bg-gradient-to-r from-[#006837] to-[#00844a] text-white p-10 rounded-[2.5rem] shadow-xl mb-12">

                    <h2 className="text-white text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>

                      ¿Qué es un Plan de Negocio?

                    </h2>

                    <p className="text-white/90 leading-relaxed text-xl">

                      El Plan de Negocio es una herramienta escrita y estructurada que describe en detalle la naturaleza de un emprendimiento,

                      sus objetivos estratégicos, su forma de operación, los recursos necesarios y sus proyecciones financieras. No es solo un

                      requisito formal; es el mapa que organiza tu realidad de manera profesional.

                    </p>

                  </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

                    <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">

                      <h3 className="text-[#006837] font-bold text-xl mb-4">Importancia del Plan</h3>

                      <p className="mb-4 text-gray-600">Un plan bien estructurado te obliga a responder preguntas difíciles y a fundamentar cada decisión. Es tu principal carta de presentación ante:</p>

                      <ul className="space-y-2 text-[#006837] font-medium">

                        <li className="flex items-center gap-2">✓ Entidades Financieras</li>

                        <li className="flex items-center gap-2">✓ Inversionistas y Socios</li>

                        <li className="flex items-center gap-2">✓ Autoridades Competentes</li>

                      </ul>

                    </div>

                    <div className="bg-[#AA27B9]/5 p-8 rounded-3xl border-2 border-[#AA27B9]/20 shadow-sm">

                      <h3 className="text-[#AA27B9] font-bold text-xl mb-4">Visión Integral</h3>

                      <p className="text-gray-600">El plan conecta todas las áreas: el cliente define el mercado, el mercado define a la competencia, y todo está determina los números finales del negocio.</p>

                    </div>

                  </div>

                </section>

{/* Pilares y Componentes */}

                <div className="space-y-10">

                  <h3 className="text-[#006837] text-3xl font-bold text-center" style={{ fontFamily: 'var(--font-heading)' }}>Componentes Principales</h3>

<div className="grid grid-cols-1 gap-8">

                    {[

                      {

                        title: 'Direccionamiento Estratégico',

                        color: '#59D22E',

                        icon: '🎯',

                        content: 'Define la Misión (quiénes somos hoy), la Visión (hacia dónde vamos en 5-10 años) y los Valores (principios guía). Es el cimiento ético y aspiracional de la empresa.'

                      },

                      {

                        title: 'Estudio de Mercado',

                        color: '#A5E811',

                        icon: '🌍',

                        content: 'Análisis de demanda, dimensionamiento del mercado (Total, Disponible, Objetivo y Potencial) y mapeo exhaustivo de competidores directos e indirectos.'

                      },

                      {

                        title: 'Marketing Digital y Comercial',

                        color: '#AA27B9',

                        icon: '📢',

                        content: 'Diagnóstico de presencia en redes, definición de objetivos SMART y estrategias adaptadas (especialmente para zonas con baja conectividad).'

                      },

                      {

                        title: 'Estudio Técnico y Operativo',

                        color: '#006837',

                        icon: '⚙️',

                        content: 'Análisis de capacidad instalada (Real vs. Teórica), localización basada en logística y diseño de procesos para evitar cuellos de botella.'

                      },

                      {

                        title: 'Estructura Administrativa y Legal',

                        color: '#3b82f6',

                        icon: '⚖️',

                        content: 'Organigrama funcional, roles claros y cumplimiento de requisitos legales (RUT, Matrícula Mercantil, Permisos Sanitarios y Obligaciones Laborales).'

                      },

                      {

                        title: 'Finanzas y Viabilidad',

                        color: '#ef4444',

                        icon: '💰',

                        content: 'Balance General, Estado de Resultados, Flujo de Caja e indicadores críticos: Punto de Equilibrio, Payback, VAN (Valor Actual Neto) y TIR.'

                      }

                    ].map((item, idx) => (

                      <div key={idx} className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start group hover:border-gray-200 transition-all">

                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}20` }}>

                          {item.icon}

                        </div>

                        <div className="space-y-3">

                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#006837] transition-colors">{item.title}</h4>

                          <p className="text-gray-600 leading-relaxed">{item.content}</p>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

{/* Detalle Financiero */}

                <section className="bg-gray-900 text-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">

                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#AA27B9] rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>

                  <div className="relative z-10 space-y-8">

                    <h3 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Indicadores de Decisión Financiera</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                      <div className="space-y-4 p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">

                        <h4 className="text-[#A5E811] font-bold text-xl uppercase tracking-wider">Punto de Equilibrio</h4>

                        <p className="text-white/70">Es el nivel de ventas mínimo necesario para que el negocio no tenga pérdidas ni ganancias (Utilidad = 0).</p>

                      </div>

                      <div className="space-y-4 p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">

                        <h4 className="text-[#A5E811] font-bold text-xl uppercase tracking-wider">V.A.N. y T.I.R.</h4>

                        <p className="text-white/70">Miden la rentabilidad del proyecto sobre la inversión inicial y el valor que genera en el tiempo.</p>

                      </div>

                    </div>

                    <div className="p-8 bg-red-500/10 rounded-3xl border border-red-500/20">

                      <p className="text-red-400 font-bold mb-2">⚠️ Análisis de Sensibilidad</p>

                      <p className="text-white/70 italic text-sm">"Es fundamental evaluar escenarios pesimistas: ¿Qué sucede si las ventas caen un 20%? ¿Cómo afecta un alza en materias primas?"</p>

                    </div>

                  </div>

                </section>

<div className="flex flex-col md:flex-row items-center gap-10 bg-gradient-to-r from-[#A5E811]/10 to-[#59D22E]/10 rounded-[2.5rem] p-12 border-2 border-[#59D22E]/20">

                  <div className="text-6xl">💡</div>

                  <div className="space-y-2">

                    <h4 className="text-[#006837] font-bold text-xl">Recuerda la Conexión Total</h4>

                    <p className="text-gray-700 leading-relaxed italic">

                      "Un plan de negocios exitoso requiere que estos pilares estén conectados: la descripción del negocio define al cliente, el cliente define el mercado, el mercado define a la competencia, y todo esto determina los números."

                    </p>

                  </div>

                </div>

{/* Additional Key Components */}

                <div className="space-y-10">

                  <h3 className="text-[#006837] text-3xl font-bold text-center" style={{ fontFamily: 'var(--font-heading)' }}>Componentes Adicionales Esenciales</h3>

<div className="grid grid-cols-1 gap-8">

                    {[

                      {

                        title: 'Resumen Ejecutivo',

                        color: '#6366f1',

                        icon: '📋',

                        content: 'Síntesis de máximo 2 páginas que captura la esencia del negocio: problema que resuelve, solución propuesta, mercado objetivo, ventaja competitiva y proyección financiera clave. Aunque va al inicio, se escribe al final.'

                      },

                      {

                        title: 'Descripción del Producto o Servicio',

                        color: '#f59e0b',

                        icon: '🛍️',

                        content: 'Detalle exhaustivo de lo que ofreces: características técnicas, beneficios para el cliente, propuesta de valor única, ciclo de vida del producto y potencial de innovación o diferenciación.'

                      },

                      {

                        title: 'Análisis de Riesgos',

                        color: '#dc2626',

                        icon: '⚠️',

                        content: 'Identificación de amenazas internas y externas: riesgos de mercado (cambios en demanda), operativos (fallas en producción), financieros (liquidez) y estrategias de mitigación para cada uno.'

                      },

                      {

                        title: 'Plan de Implementación',

                        color: '#8b5cf6',

                        icon: '📅',

                        content: 'Cronograma detallado con hitos críticos: fase pre-operativa, lanzamiento, consolidación y expansión. Incluye responsables, recursos necesarios y KPIs de seguimiento.'

                      },

                      {

                        title: 'Estrategia de Salida',

                        color: '#059669',

                        icon: '🚪',

                        content: 'Planificación a largo plazo: ¿vender el negocio?, ¿fusionarse?, ¿expandirse?, ¿transferir a familia? Define escenarios posibles y condiciones que activarían cada estrategia.'

                      },

                      {

                        title: 'Análisis DOFA Profundo',

                        color: '#0891b2',

                        icon: '🔍',

                        content: 'Matriz que cruza Debilidades, Oportunidades, Fortalezas y Amenazas para generar estrategias: ofensivas (F+O), defensivas (F+A), adaptativas (D+O) y de supervivencia (D+A).'

                      }

                    ].map((item, idx) => (

                      <div key={idx} className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start group hover:border-gray-200 transition-all">

                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}20` }}>

                          {item.icon}

                        </div>

                        <div className="space-y-3">

                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#006837] transition-colors">{item.title}</h4>

                          <p className="text-gray-600 leading-relaxed">{item.content}</p>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

{/* Metodología de Construcción */}

                <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2.5rem] p-10 md:p-14 shadow-xl">

                  <h3 className="text-purple-900 text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Metodología de Construcción</h3>

                  <div className="space-y-6 text-gray-700">

                    <div className="flex gap-4">

                      <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>

                      <div>

                        <h4 className="font-bold text-lg text-purple-900 mb-2">Investigación y Diagnóstico</h4>

                        <p className="text-gray-600">Recolecta datos del mercado, encuestá clientes potenciales, analiza competidores y valida tu idea de negocio antes de escribir.</p>

                      </div>

                    </div>

                    <div className="flex gap-4">

                      <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>

                      <div>

                        <h4 className="font-bold text-lg text-purple-900 mb-2">Redacción Estructurada</h4>

                        <p className="text-gray-600">Sigue el orden lógico: comienza por la descripción del negocio, continúa con el análisis de mercado y finaliza con proyecciones financieras.</p>

                      </div>

                    </div>

                    <div className="flex gap-4">

                      <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>

                      <div>

                        <h4 className="font-bold text-lg text-purple-900 mb-2">Validación y Ajuste</h4>

                        <p className="text-gray-600">Presenta tu plan a mentores, asesores o potenciales inversionistas. Recibe retroalimentación y ajusta las proyecciones y estrategias.</p>

                      </div>

                    </div>

                    <div className="flex gap-4">

                      <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>

                      <div>

                        <h4 className="font-bold text-lg text-purple-900 mb-2">Ejecución y Monitoreo</h4>

                        <p className="text-gray-600">El plan no es estático. Revísalo trimestralmente, ajusta metas según resultados reales y mantén la coherencia entre lo planeado y lo ejecutado.</p>

                      </div>

                    </div>

                  </div>

                </section>

{/* Errores Comunes */}

                <section className="bg-red-50 border-2 border-red-200 rounded-[2.5rem] p-10">

                  <h3 className="text-red-900 text-2xl font-bold mb-6 flex items-center gap-3">

                    <span className="text-3xl">⚠️</span>

                    Errores Comunes a Evitar

                  </h3>

                  <ul className="space-y-4 text-gray-700">

                    <li className="flex items-start gap-3">

                      <span className="text-red-600 font-bold">×</span>

                      <span><strong>Proyecciones Irrealistas:</strong> Evita suponer tasas de crecimiento del 50% mensual sin fundamentos sólidos.</span>

                    </li>

                    <li className="flex items-start gap-3">

                      <span className="text-red-600 font-bold">×</span>

                      <span><strong>Ignorar la Competencia:</strong> Pensar que "no tienes competidores" es una señal de alerta para inversionistas.</span>

                    </li>

                    <li className="flex items-start gap-3">

                      <span className="text-red-600 font-bold">×</span>

                      <span><strong>Falta de Coherencia:</strong> Los números financieros deben reflejar lo descrito en marketing y operaciones.</span>

                    </li>

                    <li className="flex items-start gap-3">

                      <span className="text-red-600 font-bold">×</span>

                      <span><strong>Omitir el Plan B:</strong> No tener estrategias de contingencia ante escenarios adversos es riesgoso.</span>

                    </li>

                  </ul>

                </section>

{/* Download PDF Button */}

                <div className="flex justify-center pt-8">

                  <a

                    href="/PLAN_DE_NEGOCIOS.pdf"

                    download="PLAN_DE_NEGOCIOS.pdf"

                    className="bg-gradient-to-r from-[#006837] to-[#59D22E] hover:from-[#59D22E] hover:to-[#006837] text-white px-12 py-6 rounded-full flex items-center gap-4 shadow-2xl transition-all transform hover:scale-105 group"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontWeight: 800,

                      fontSize: '1.25rem',

                    }}

                  >

                    <Download className="w-7 h-7 group-hover:animate-bounce" />

                    <span>Descargar Guía Completa (PDF)</span>

                  </a>

                </div>

              </motion.div>

            ) : (

              <motion.div

                key="formulario"

                initial={{ opacity: 0, x: 20 }}

                animate={{ opacity: 1, x: 0 }}

                transition={{ duration: 0.4 }}

                className="space-y-12"

              >

                <div className="text-center max-w-2xl mx-auto">

                  <h2

                    className="text-[#AA27B9] mb-4"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontSize: '2.5rem',

                      fontWeight: 700,

                    }}

                  >

                    Construye tu Plan de Negocio

                  </h2>

                  <p className="text-gray-600 text-lg">

                    Completa los ejercicios de cada unidad. Tu progreso se guardará automáticamente para tu plan final.

                  </p>

                </div>

{/* Resultados de Módulos (Descubrimiento de Oportunidades) */}

                {descubrimientoData && (

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    className="space-y-10 bg-white p-10 rounded-[3rem] border-4 border-[#59D22E]/20 shadow-xl"

                  >

                    <div className="flex items-center gap-4 mb-4">

                      <div className="p-3 bg-[#59D22E] rounded-2xl text-white shadow-lg">

                        <FileText className="w-8 h-8" />

                      </div>

                      <div>

                        <h3 className="text-2xl font-bold text-[#006837]" style={{ fontFamily: 'var(--font-heading)' }}>

                          Resultados: Descubrimiento de Oportunidades

                        </h3>

                        <p className="text-gray-500 font-medium">Ciclo de Vida y Estrategias</p>

                      </div>

                    </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      {/* Tabla 1 */}

                      <div className="space-y-4">

                        <h4 className="font-bold text-[#006837] text-lg px-2">1. Ciclo de vida de mis productos</h4>

                        <div className="overflow-hidden rounded-3xl border-2 border-gray-100 shadow-sm">

                          <table className="w-full text-left border-collapse">

                            <thead className="bg-gray-50 border-b-2 border-gray-100">

                              <tr>

                                <th className="p-4 font-bold text-[#006837]">Fase</th>

                                <th className="p-4 font-bold text-[#006837]">Producto</th>

                              </tr>

                            </thead>

                            <tbody>

                              {[

                                { k: 'productoIntroduccion', l: 'Introducción' },

                                { k: 'productoCrecimiento', l: 'Crecimiento' },

                                { k: 'productoMadurez', l: 'Madurez' },

                                { k: 'productoDeclive', l: 'Declive' }

                              ].map((etapa, idx) => descubrimientoData[etapa.k] && (

                                <tr key={idx} className="border-b border-gray-50 last:border-0">

                                  <td className="p-4 font-bold text-gray-500">{etapa.l}</td>

                                  <td className="p-4 text-gray-700">{descubrimientoData[etapa.k]}</td>

                                </tr>

                              ))}

                            </tbody>

                          </table>

                        </div>

                      </div>

{/* Tabla 2 */}

                      <div className="space-y-4">

                        <h4 className="font-bold text-[#006837] text-lg px-2">2. Estrategias seleccionadas</h4>

                        <div className="overflow-hidden rounded-3xl border-2 border-gray-100 shadow-sm">

                          <table className="w-full text-left border-collapse">

                            <thead className="bg-gray-50 border-b-2 border-gray-100">

                              <tr>

                                <th className="p-4 font-bold text-[#006837]">Fase</th>

                                <th className="p-4 font-bold text-[#006837]">Estrategia</th>

                              </tr>

                            </thead>

                            <tbody>

                              {[

                                { k: 'estrategiaIntroduccion', l: 'Introducción' },

                                { k: 'estrategiaCrecimiento', l: 'Crecimiento' },

                                { k: 'estrategiaMadurez', l: 'Madurez' },

                                { k: 'estrategiaDeclive', l: 'Declive' }

                              ].map((etapa, idx) => descubrimientoData[etapa.k] && (

                                <tr key={idx} className="border-b border-gray-50 last:border-0">

                                  <td className="p-4 font-bold text-gray-500">{etapa.l}</td>

                                  <td className="p-4 text-gray-700">{descubrimientoData[etapa.k]}</td>

                                </tr>

                              ))}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    </div>

                  </motion.div>

                )}

                {/* Resultados de Módulos (Modelo de Negocios) */}

                {modeloData && (

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    className="space-y-10 bg-white p-10 rounded-[3rem] border-4 border-[#AA27B9]/20 shadow-xl"

                  >

                    <div className="flex items-center gap-4 mb-4">

                      <div className="p-3 bg-[#AA27B9] rounded-2xl text-white shadow-lg">

                        <FileText className="w-8 h-8" />

                      </div>

                      <div>

                        <h3 className="text-2xl font-bold text-[#006837]" style={{ fontFamily: 'var(--font-heading)' }}>

                          Resultados: Modelo de Negocios

                        </h3>

                        <p className="text-gray-500 font-medium">Propuesta de Valor y Atributos</p>

                      </div>

                    </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                      {/* Imagen del Producto */}

                      <div className="flex flex-col items-center justify-center space-y-4">

                        <h4 className="font-bold text-[#006837] text-lg w-full px-2">Imagen de mi Producto</h4>

                        <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 w-full flex items-center justify-center">

                          {modeloData.imagenUrl ? (

                            <img

                              src={modeloData.imagenUrl}

                              alt="Producto"

                              className="max-h-[300px] w-auto rounded-3xl shadow-lg"

                            />

                          ) : (

                            <div className="text-gray-400 italic">No se cargó imagen</div>

                          )}

                        </div>

                      </div>

{/* Atributos de Propuesta de Valor */}

                      <div className="space-y-4">

                        <h4 className="font-bold text-[#006837] text-lg px-2">Atributos de mi Propuesta de Valor</h4>

                        <div className="overflow-hidden rounded-3xl border-2 border-gray-100 shadow-sm">

                          <table className="w-full text-left border-collapse">

                            <thead className="bg-gray-50 border-b-2 border-gray-100">

                              <tr>

                                <th className="p-4 font-bold text-[#AA27B9]">Atributo</th>

                                <th className="p-4 font-bold text-[#AA27B9]">Definición</th>

                              </tr>

                            </thead>

                            <tbody>

                              {[

                                { k: 'pregunta1', l: 'Sector' },

                                { k: 'pregunta2', l: 'Diferencia' },

                                { k: 'pregunta3', l: 'Necesidad' },

                                { k: 'pregunta4', l: 'Confianza' },

                                { k: 'pregunta5', l: 'Valor Emocional' },

                                { k: 'pregunta6', l: 'Atractivo' },

                                { k: 'pregunta7', l: 'Compromiso' }

                              ].map((item, idx) => modeloData[item.k] && (

                                <tr key={idx} className="border-b border-gray-50 last:border-0">

                                  <td className="p-4 font-bold text-gray-500 whitespace-nowrap">{item.l}</td>

                                  <td className="p-4 text-gray-700 text-sm">{modeloData[item.k].replace(/^[a-h]\)\s*/, '')}</td>

                                </tr>

                              ))}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    </div>

                  </motion.div>

                )}

{/* Resultados de Módulos (Marketing y Comercialización) */}

                {marketingData && (

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    className="space-y-10 bg-white p-10 rounded-[3rem] border-4 border-[#59D22E]/20 shadow-xl mt-10"

                  >

                    <div className="flex items-center gap-4 mb-4">

                      <div className="p-3 bg-[#59D22E] rounded-2xl text-white shadow-lg">

                        <FileText className="w-8 h-8" />

                      </div>

                      <div>

                        <h3 className="text-2xl font-bold text-[#006837]" style={{ fontFamily: 'var(--font-heading)' }}>

                          Resultados: Marketing y Comercialización

                        </h3>

                        <p className="text-gray-500 font-medium">Estrategias de Mix de Marketing</p>

                      </div>

                    </div>

<div className="grid grid-cols-1 gap-10">

                      <div className="overflow-hidden rounded-3xl border-2 border-gray-100 shadow-sm">

                        <table className="w-full text-left border-collapse">

                          <thead className="bg-gray-50 border-b-2 border-gray-100">

                            <tr>

                              <th className="p-4 font-bold text-[#006837]">Variable</th>

                              <th className="p-4 font-bold text-[#006837]">Estrategia Seleccionada</th>

                            </tr>

                          </thead>

                          <tbody>

                            {[

                              { k: 'pregunta1', l: 'Producto' },

                              { k: 'pregunta2', l: 'Precio' },

                              { k: 'pregunta3', l: 'Plaza (Distribución)' },

                              { k: 'pregunta4', l: 'Promoción' },

                              { k: 'pregunta5', l: 'Gestión Administrativa' },

                              { k: 'pregunta6', l: 'Fidelización' }

                            ].map((item, idx) => marketingData[item.k] && (

                              <tr key={idx} className="border-b border-gray-100 last:border-0">

                                <td className="p-4 font-bold text-gray-500">{item.l}</td>

                                <td className="p-4 text-gray-700">{marketingData[item.k].replace(/^[a-c]\)\s*/, '')}</td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    </div>

                  </motion.div>

                )}

{/* Resultados de Módulos (Marketing Digital) */}

                {marketingDigitalData && (

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    className="space-y-10 bg-white p-10 rounded-[3rem] border-4 border-[#AA27B9]/20 shadow-xl mt-10"

                  >

                    <div className="flex items-center gap-4 mb-4">

                      <div className="p-3 bg-[#AA27B9] rounded-2xl text-white shadow-lg">

                        <FileText className="w-8 h-8" />

                      </div>

                      <div>

                        <h3 className="text-2xl font-bold text-[#8E1FA3]" style={{ fontFamily: 'var(--font-heading)' }}>

                          Resultados: Marketing Digital

                        </h3>

                        <p className="text-gray-500 font-medium">Plan de Acción Digital</p>

                      </div>

                    </div>

{/* Tabla de Estrategias */}

                    <div className="overflow-hidden rounded-3xl border-2 border-gray-100 shadow-sm">

                      <table className="w-full text-left border-collapse text-sm">

                        <thead className="bg-[#AA27B9]/5 border-b-2 border-gray-100">

                          <tr>

                            <th className="p-4 font-bold text-[#8E1FA3]">Estrategia digital</th>

                            <th className="p-4 font-bold text-[#8E1FA3]">Cómo se aplicará</th>

                            <th className="p-4 font-bold text-[#8E1FA3]">Recursos necesarios</th>

                            <th className="p-4 font-bold text-[#8E1FA3]">Plazo de ejecución</th>

                            <th className="p-4 font-bold text-[#8E1FA3]">Indicadores de resultados</th>

                          </tr>

                        </thead>

                        <tbody>

                          {[1, 2].map((num) => (

                            <tr key={num} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">

                              <td className="p-4 font-bold text-gray-700">{marketingDigitalData[`estrategia${num}`]}</td>

                              <td className="p-4 text-gray-600">{marketingDigitalData.objetivoSmart}</td>

                              <td className="p-4 text-gray-600">

                                <ul className="list-disc list-inside">

                                  {marketingDigitalData[`recursosEstrategia${num}`]?.map((r, i) => (

                                    <li key={i}>{r.split('(')[0].trim()}</li>

                                  ))}

                                </ul>

                              </td>

                              <td className="p-4 text-gray-600">

                                {marketingDigitalData[`tiempoEstrategia${num}`] === 'Otra opción'

                                  ? marketingDigitalData[`tiempoEstrategia${num}Otro`]

                                  : marketingDigitalData[`tiempoEstrategia${num}`]}

                              </td>

                              <td className="p-4 text-gray-600">

                                <ul className="list-disc list-inside">

                                  {marketingDigitalData[`indicadoresEstrategia${num}`]?.map((ind, i) => (

                                    <li key={i}>{ind.split('(')[0].trim()}</li>

                                  ))}

                                </ul>

                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </table>

                    </div>

{/* Diagrama de Flujo */}

                    <div className="mt-12 bg-gray-50 rounded-[2.5rem] p-10 border-2 border-gray-100 relative overflow-hidden">

                      <h4 className="text-xl font-bold text-[#006837] mb-10 text-center" style={{ fontFamily: 'var(--font-heading)' }}>

                        Diagrama de Flujo

                      </h4>

<div className="relative flex flex-col md:flex-row print:flex-row items-center justify-between gap-8 md:gap-4 min-h-[400px] print:gap-2">

                        {/* Problema */}

                        <div className="z-10 w-full md:w-[28%] bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-xl border-b-4 border-blue-900/30 transform hover:scale-105 transition-transform">

                          <h5 className="text-white font-bold text-center mb-4 uppercase tracking-wider text-sm">Problema</h5>

                          <p className="text-white text-sm leading-relaxed text-center">

                            {marketingDigitalData.problema?.replace(/^[a-e]\)\s*/, '')}

                          </p>

                        </div>

{/* Line 1-2 */}

                        <div className="hidden md:block print:block absolute left-[28%] w-[8%] h-0.5 bg-blue-600/30"></div>

{/* Objetivo SMART */}

                        <div className="z-10 w-full md:w-[28%] bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-xl border-b-4 border-blue-900/30 transform hover:scale-105 transition-transform relative">

                          <h5 className="text-white font-bold text-center mb-4 uppercase tracking-wider text-sm">Objetivo SMART</h5>

                          <p className="text-white text-sm leading-relaxed text-center italic">

                            "{marketingDigitalData.objetivoSmart}"

                          </p>

                        </div>

{/* Strategia Column */}

                        <div className="flex flex-col gap-6 w-full md:w-[28%]">

                          {[1, 2].map((num) => (

                            <div key={num} className="z-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-xl border-b-4 border-blue-900/30 transform hover:scale-105 transition-transform relative">

                              <h5 className="text-white font-bold text-center mb-2 uppercase tracking-wider text-xs">Estrategia {num}</h5>

                              <p className="text-white text-sm leading-relaxed text-center font-semibold">

                                {marketingDigitalData[`estrategia${num}`]}

                              </p>

{/* Connector line for mobile/desktop */}

                              <div className="hidden md:block absolute -left-8 top-1/2 w-8 h-0.5 bg-blue-600/30"></div>

                            </div>

                          ))}

                        </div>

{/* SVG Arrows for Desktop */}

                        <svg className="hidden md:block print:block absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400">

                          <defs>

                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">

                              <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />

                            </marker>

                          </defs>

                          {/* Line from Problema to SMART */}

                          <line x1="225" y1="200" x2="275" y2="200" stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

                          {/* Fork from SMART to Estrategias */}

                          <path d="M 525 200 C 550 200, 550 100, 575 100" stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />

                          <path d="M 525 200 C 550 200, 550 300, 575 300" stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />

                        </svg>

                      </div>

                    </div>

                  </motion.div>

                )}

{/* Resultados de Módulos (Atención al Cliente) */}

                {atenciónClienteData && (

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    className="space-y-10 bg-white p-10 rounded-[3rem] border-4 border-blue-500/20 shadow-xl mt-10"

                  >

                    <div className="flex items-center gap-4 mb-4">

                      <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg">

                        <FileText className="w-8 h-8" />

                      </div>

                      <div>

                        <h3 className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'var(--font-heading)' }}>

                          Resultados: Atención al Cliente

                        </h3>

                        <p className="text-gray-500 font-medium">Ciclo del Servicio</p>

                      </div>

                    </div>

{/* Esquema de Ciclo del Servicio */}

                    <div className="bg-gray-50 rounded-[2.5rem] p-10 border-2 border-gray-100">

                      <h4 className="text-xl font-bold text-blue-900 mb-10 text-center" style={{ fontFamily: 'var(--font-heading)' }}>

                        Esquema del Ciclo del Servicio

                      </h4>

<div className="flex flex-nowrap print:flex-wrap justify-center gap-4 items-stretch pb-8 overflow-x-auto print:overflow-visible min-h-[300px]">

                        {[

                          { k: 'pregunta1', color: 'border-green-300', bg: 'bg-green-50 shadow-[0_0_20px_rgba(187,247,208,0.5)]' },

                          { k: 'pregunta2', color: 'border-blue-300', bg: 'bg-blue-50 shadow-[0_0_20px_rgba(191,219,254,0.5)]' },

                          { k: 'pregunta3', color: 'border-orange-300', bg: 'bg-orange-50 shadow-[0_0_20px_rgba(254,215,170,0.5)]' },

                          { k: 'pregunta4', color: 'border-gray-400', bg: 'bg-gray-50 shadow-[0_0_20px_rgba(209,213,219,0.5)]' },

                          { k: 'pregunta5', color: 'border-yellow-300', bg: 'bg-yellow-50 shadow-[0_0_20px_rgba(254,240,138,0.5)]' }

                        ].map((item, idx) => atenciónClienteData[item.k] && (

                          <div key={idx} className="flex-shrink-0 w-64 group print:w-[30%] print:mb-4">

                            <motion.div

                              whileHover={{ y: -10 }}

                              className={`h-full border-8 ${item.color} ${item.bg} rounded-[2rem] p-6 flex items-center justify-center relative transition-all duration-300`}

                            >

                              <div className="bg-white rounded-2xl p-5 h-full w-full flex items-center justify-center border-2 border-white shadow-inner">

                                <p className="text-sm font-semibold text-gray-800 text-center leading-relaxed">

                                  {atenciónClienteData[item.k]}

                                </p>

                              </div>

{/* Accent bubble tail like in the image */}

                              <div className={`absolute -bottom-3 left-8 w-6 h-6 rotate-45 ${item.bg.split(' ')[0]} border-r-8 border-b-8 ${item.color}`}></div>

                            </motion.div>

                          </div>

                        ))}

                      </div>

<p className="text-center text-gray-400 text-xs mt-4 italic uppercase tracking-widest print:hidden">Desliza para ver el ciclo completo</p>

                    </div>

                  </motion.div>

                )}

{/* Resultados de Módulos (Trabajo en Equipo) */}

                {trabajoEquipoData && (

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    className="space-y-10 bg-white p-10 rounded-[3rem] border-4 border-purple-500/20 shadow-xl mt-10"

                  >

                    <div className="flex items-center gap-4 mb-4">

                      <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg">

                        <FileText className="w-8 h-8" />

                      </div>

                      <div>

                        <h3 className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'var(--font-heading)' }}>

                          Resultados: Trabajo en Equipo

                        </h3>

                        <p className="text-gray-500 font-medium">Estructura y Organigrama</p>

                      </div>

                    </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      {/* Tabla de Funciones */}

                      <div className="space-y-4">

                        <h4 className="font-bold text-purple-900 text-lg px-2">Estructura del Equipo</h4>

                        <div className="overflow-hidden rounded-3xl border-2 border-gray-100 shadow-sm">

                          <table className="w-full text-left border-collapse">

                            <thead className="bg-gray-50 border-b-2 border-gray-100">

                              <tr>

                                <th className="p-4 font-bold text-purple-900">Funciones</th>

                                <th className="p-4 font-bold text-purple-900">Responsable(s)</th>

                              </tr>

                            </thead>

                            <tbody>

                              {[

                                { k: 'nombre1', l: 'Administrativas' },

                                { k: 'nombre2', l: 'Operativas' },

                                { k: 'nombre3', l: 'Comerciales' },

                                { k: 'nombre4', l: 'Creativas' },

                                { k: 'nombre5', l: 'Estratégicas' }

                              ].map((func, idx) => {

                                const valor = trabajoEquipoData[func.k] || '';

                                const mostrar = valor.trim() !== '' && valor.trim().toUpperCase() !== 'NO APLICA';

                                return (

                                  <tr key={idx} className="border-b border-gray-50 last:border-0">

                                    <td className="p-4 font-bold text-gray-500">{func.l}</td>

                                    <td className="p-4 text-gray-700">

                                      {mostrar ? valor : <span className="text-gray-300 italic">NO APLICA</span>}

                                    </td>

                                  </tr>

                                );

                              })}

                            </tbody>

                          </table>

                        </div>

                      </div>

{/* Organigrama Circular */}

                      <div className="space-y-4">

                        <h4 className="font-bold text-purple-900 text-lg px-2 text-center">Organigrama Circular</h4>

                        <div className="bg-gray-50 rounded-3xl border-2 border-gray-100 p-4 flex items-center justify-center min-h-[500px] overflow-x-auto">

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

                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',

                              border: '2px solid white'

                            }}>

                              <div className="text-center leading-tight">

                                <div>EQUIPO</div>

                                <div>DE TRABAJO</div>

                              </div>

                            </div>

{/* Miembros alrededor */}

                            {(() => {

                              const funcionesList = [

                                { k: 'nombre1', l: 'Administrativas' },

                                { k: 'nombre2', l: 'Operativas' },

                                { k: 'nombre3', l: 'Comerciales' },

                                { k: 'nombre4', l: 'Creativas' },

                                { k: 'nombre5', l: 'Estratégicas' }

                              ];

                              const filtrados = funcionesList.filter(f =>

                                trabajoEquipoData[f.k] &&

                                trabajoEquipoData[f.k].trim() !== '' &&

                                trabajoEquipoData[f.k].trim().toUpperCase() !== 'NO APLICA'

                              );

return filtrados.map((item, index) => {

                                const total = filtrados.length;

                                const angle = (index * 360) / total - 90;

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

                                    title={trabajoEquipoData[item.k]}

                                  >

                                    <div className="font-semibold mb-1 text-[9px] print:text-[8px]">{trabajoEquipoData[item.k].split(' ').slice(0, 2).join(' ')}</div>

                                    <div className="text-[8px] print:text-[7px] opacity-90">{item.l}</div>

                                  </div>

                                );

                              });

                            })()}

                          </div>

                        </div>

                      </div>

                    </div>

                  </motion.div>

                )}

{/* Resultados de Módulos (Finanzas) */}

                {finanzasData && (() => {

                  const diasMes = parseFloat(finanzasData.diasMes) || 0;

                  const clientesDia = parseFloat(finanzasData.clientesDia) || 0;

                  const dineroCliente = parseFloat(finanzasData.dineroCliente) || 0;

                  const clientesAlMes = diasMes * clientesDia;

const proyeccion = meses.map(más => {

                    const clientesPorTemporada = Math.round(clientesAlMes * (1 + más.ajuste / 100));

                    const ventasMensuales = clientesPorTemporada * dineroCliente;

                    return {

                      ...más,

                      clientesAlMes,

                      clientesPorTemporada,

                      ventasMensuales

                    };

                  });

const totalClientesAnual = proyeccion.reduce((sum, más) => sum + más.clientesPorTemporada, 0);

                  const totalVentasAnual = proyeccion.reduce((sum, más) => sum + más.ventasMensuales, 0);

const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);

                  const formatPercentage = (val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

return (

                    <motion.div

                      initial={{ opacity: 0, y: 20 }}

                      animate={{ opacity: 1, y: 0 }}

                      className="space-y-10 bg-white p-10 rounded-[3rem] border-4 border-[#FFEB3B]/50 shadow-xl mt-10"

                    >

                      <div className="flex items-center gap-4 mb-4">

                        <div className="p-3 bg-yellow-500 rounded-2xl text-white shadow-lg">

                          <FileText className="w-8 h-8" />

                        </div>

                        <div>

                          <h3 className="text-2xl font-bold text-yellow-900" style={{ fontFamily: 'var(--font-heading)' }}>

                            Resultados: Finanzas

                          </h3>

                          <p className="text-gray-500 font-medium">Proyección de Ventas</p>

                        </div>

                      </div>

<div className="overflow-x-auto rounded-3xl border-2 border-gray-100">

                        <table className="w-full border-collapse">

                          <thead className="bg-[#006837] text-white">

                            <tr>

                              <th className="p-3 text-left">Mes</th>

                              <th className="p-3 text-center">Clientes / Mes</th>

                              <th className="p-3 text-center">Ajuste %</th>

                              <th className="p-3 text-center">Clientes / Temp.</th>

                              <th className="p-3 text-right">Ventas Mensuales</th>

                            </tr>

                          </thead>

                          <tbody>

                            {proyeccion.map((más, idx) => (

                              <tr key={más.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>

                                <td className="p-3 font-semibold text-gray-700">{más.nombre}</td>

                                <td className="p-3 text-center text-gray-600">{clientesAlMes.toLocaleString('es-CO')}</td>

                                <td className={`p-3 text-center font-medium ${más.ajuste >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatPercentage(más.ajuste)}</td>

                                <td className="p-3 text-center text-gray-800 font-bold">{más.clientesPorTemporada.toLocaleString('es-CO')}</td>

                                <td className="p-3 text-right text-gray-800 font-bold">{formatCurrency(más.ventasMensuales)}</td>

                              </tr>

                            ))}

                            <tr className="bg-[#006837] text-white font-bold">

                              <td className="p-4">TOTAL ANUAL</td>

                              <td className="p-4 text-center">-</td>

                              <td className="p-4 text-center">-</td>

                              <td className="p-4 text-center">{totalClientesAnual.toLocaleString('es-CO')}</td>

                              <td className="p-4 text-right">{formatCurrency(totalVentasAnual)}</td>

                            </tr>

                          </tbody>

                        </table>

                      </div>

                    </motion.div>

                  );

                })()}

{/* Botón Generar Plan */}

                <div className="flex justify-center pt-8 pb-12 print:hidden no-print">

                  <motion.button

                    onClick={handleGeneratePlan}

                    whileHover={{ scale: 1.05, y: -5 }}

                    whileTap={{ scale: 0.95 }}

                    className="bg-gradient-to-r from-[#AA27B9] to-[#8E1FA3] text-white px-16 py-8 rounded-full flex items-center gap-4 shadow-2xl relative overflow-hidden group"

                    style={{

                      fontFamily: 'var(--font-heading)',

                      fontWeight: 800,

                      fontSize: '1.5rem',

                    }}

                  >

                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                    <Download className="w-8 h-8 relative z-10" />

                    <span className="relative z-10">Generar Plan de Negocio</span>

                    <ChevronRight className="w-8 h-8 relative z-10" />

                  </motion.button>

                </div>

</motion.div>

            )}

          </div>

        </motion.div>

      </div>

{/* Back Button */}

      <motion.div

        initial={{ opacity: 0, scale: 0.8 }}

        animate={{ opacity: 1, scale: 1 }}

        className="fixed bottom-10 left-10 z-50 no-print"

      >

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate(isInstructorView ? '/instructor/dashboard' : '/student/dashboard');

          }}

          className="bg-white hover:bg-gray-100 text-[#006837] border-4 border-[#006837] rounded-full px-10 py-8 flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-black text-xl transition-all transform hover:rotate-3"

        >

          <ArrowLeft className="w-7 h-7" />

          Atrás

        </Button>

      </motion.div>

<div className="no-print h-0 overflow-hidden print:h-auto print:overflow-visible">

        <Footer />

      </div>

    </div>

  );

};

export default PlanNegociosPage;


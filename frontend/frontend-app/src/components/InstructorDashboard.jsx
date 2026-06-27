import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

import { Button } from './ui/button';

import { Badge } from './ui/badge';

import { Progress } from './ui/progress';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import {
  BookOpen,
  Users,
  Activity,
  FileText,
  User,
  ChevronRight,
  MessageSquareMore,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import InstructorHeader from './instructor/InstructorHeader';
import API_BASE_URL from '@/config/api'
import { getForumNodes, resolveForumNodeByMunicipio } from '@/constants/forumNodes'

/** Misma lógica que el useEffect del dashboard: CSV público → mapas id/nombre → municipio */
function buildMunicipiosMapsFromCsvText(csvText) {
  const mapById = {};
  const mapByName = {};
  const normalizeName = (s) => {
    return (s || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(';');
    if (parts.length < 4) continue;
    const idStr = (parts[0] || '').trim();
    const nombre = (parts[1] || '').trim();
    const apellido = (parts[2] || '').trim();
    const municipio = (parts[3] || '').trim();
    if (!idStr || !municipio) continue;
    mapById[idStr] = municipio;
    const fullName = `${nombre} ${apellido}`.replace(/\s+/g, ' ').trim();
    const keyName = normalizeName(fullName);
    if (keyName) mapByName[keyName] = municipio;
  }
  return { mapById, mapByName };
}

/** Agrupa progreso por municipio (misma lógica que el useMemo del dashboard). */
function agruparProgresoPorMunicipio(progresoEstudiantes, municipiosMapById, municipiosMapByName) {
  const normalizeName = (s) => {
    return (s || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };
  const isSinMunicipio = (m) => String(m ?? '').trim().toLowerCase() === 'sin municipio';
  const grupos = {};
  for (const p of progresoEstudiantes || []) {
    const id = p?.estudiante_id ?? p?.estudianteId ?? p?.user_id ?? p?.usuario_id;
    let municipio = 'Sin municipio';
    if (typeof p?.municipio === 'string' && p.municipio.trim()) {
      municipio = p.municipio.trim();
    } else if (id != null && municipiosMapById[String(id)]) {
      municipio = municipiosMapById[String(id)];
    } else {
      const keyName = normalizeName(p?.estudiante);
      if (keyName && municipiosMapByName[keyName]) {
        municipio = municipiosMapByName[keyName];
      }
    }
    if (!grupos[municipio]) grupos[municipio] = [];
    grupos[municipio].push(p);
  }
  const entries = Object.entries(grupos).sort(([a], [b]) => {
    if (isSinMunicipio(a) && !isSinMunicipio(b)) return 1;
    if (isSinMunicipio(b) && !isSinMunicipio(a)) return -1;
    return a.localeCompare(b, 'es');
  });
  return entries;
}

const NODE_ACTIVITY_DATE_LABELS = {
  centro: 'Desde el 9 al 18 de febrero',
  'costa-pacifica': 'Desde el 23 de febrero al 4 de marzo',
  telembi: 'Desde el 5 al 14 de marzo',
  'exprovincia-obando': 'Desde el 16 al 25 de marzo',
  abades: 'Desde el 6 al 15 de abril',
};

const InstructorDashboard = ({ embedded = false }) => {
  const [cursos, setCursos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalCursos: 0,
    totalEstudiantes: 0,
    promedioProgreso: 0,
    actividadReciente: []
  });
  const [progresoEstudiantes, setProgresoEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPasos, setExpandedPasos] = useState(() => {
    const saved = localStorage.getItem('instructor_expanded_pasos');
    return saved ? JSON.parse(saved) : {};
  });
  const [expandedModulos, setExpandedModulos] = useState(() => {
    const saved = localStorage.getItem('instructor_expanded_modulos');
    return saved ? JSON.parse(saved) : {};
  });
  const [ordenEstudiantes, setOrdenEstudiantes] = useState(() => {
    const saved = localStorage.getItem('instructor_orden_estudiantes');
    return saved ? JSON.parse(saved) : [];
  });
  const [jornadasMarcadas, setJornadasMarcadas] = useState(() => {
    // Cargar jornadas marcadas desde localStorage
    const saved = localStorage.getItem('instructor_jornadas_marcadas');
    return saved ? JSON.parse(saved) : {};
  });
  const [municipiosMapById, setMunicipiosMapById] = useState({});
  const [municipiosMapByName, setMunicipiosMapByName] = useState({});
  const [municipiosOpen, setMunicipiosOpen] = useState({});
  const [nodosOpen, setNodosOpen] = useState({});
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');
  const navigate = useNavigate();

  const tutorBalanceFormUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSdaJT_6w0wXN8uFNsjYQiSjHGooMFpUKAWRFUszpfZ4DBAj7A/viewform';

  const MODULES_EXPORT_ORDER = [
    'Atención al Cliente',
    'Descubrimiento de Oportunidades',
    'Finanzas',
    'Liderazgo',
    'Marketing Digital',
    'Marketing y Comercialización',
    'Modelo de Negocios',
    'Plan de Inversión',
    'Proyecto de vida',
    'Trabajo en Equipo'
  ];

  useEffect(() => {
    // Restaurar posición del scroll
    const savedScrollPosition = sessionStorage.getItem('instructor_dashboard_scroll');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 100);
    }

    cargarDatosInstructor();

    // Guardar posición del scroll antes de refrescar
    const handleBeforeUnload = () => {
      sessionStorage.setItem('instructor_dashboard_scroll', window.scrollY.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Refrescar actividad reciente y progreso cada 30 segundos
    const interval = setInterval(() => {
      // Guardar posición del scroll antes de actualizar
      sessionStorage.setItem('instructor_dashboard_scroll', window.scrollY.toString());
      cargarActividadReciente();
      cargarProgresoEstudiantes();
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Cargar mapa estudiante_id -> municipio desde municipios.csv (public/)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/municipios.csv', { cache: 'no-store' });
        if (!res.ok) return;
        const csvText = await res.text();
        const { mapById, mapByName } = buildMunicipiosMapsFromCsvText(csvText);
        if (!cancelled) {
          setMunicipiosMapById(mapById);
          setMunicipiosMapByName(mapByName);
        }
      } catch {
        // Silencioso: si falla, solo caerá en "Sin municipio"
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Guardar posición del scroll periódicamente
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('instructor_dashboard_scroll', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Guardar estados expandidos en localStorage
  useEffect(() => {
    localStorage.setItem('instructor_expanded_pasos', JSON.stringify(expandedPasos));
  }, [expandedPasos]);

  useEffect(() => {
    localStorage.setItem('instructor_expanded_modulos', JSON.stringify(expandedModulos));
  }, [expandedModulos]);

  // Guardar jornadas marcadas en localStorage como backup
  useEffect(() => {
    localStorage.setItem('instructor_jornadas_marcadas', JSON.stringify(jornadasMarcadas));
  }, [jornadasMarcadas]);

  const cargarActividadReciente = async () => {
    try {
      const actividadResponse = await fetch(`${API_BASE_URL}/instructor/actividad-reciente`, {
        credentials: 'include'
      });

      if (actividadResponse.ok) {
        const actividadData = await actividadResponse.json();
        if (actividadData.success) {
          setEstadisticas(prev => ({
            ...prev,
            actividadReciente: actividadData.actividades || []
          }));
        }
      }
    } catch (error) {
      console.error("Error al cargar actividad reciente:", error);
    }
  };

  // Función para obtener un ID único de cada progreso de estudiante
  const obtenerIdProgreso = (progreso) => {
    // Usar el ID del estudiante proporcionado por el backend
    return progreso.estudiante_id || progreso.estudiante || `estudiante-${JSON.stringify(progreso).slice(0, 50)}`;
  };

  // Función para mantener el orden estable
  const mantenerOrdenEstable = (nuevosDatos, ordenActual) => {
    if (!nuevosDatos || nuevosDatos.length === 0) return { datos: nuevosDatos, nuevoOrden: ordenActual };

    // DEDUPLICAR por estudiante_id primero (evitar duplicados del backend)
    const dedupMap = new Map();
    nuevosDatos.forEach(progreso => {
      const id = progreso.estudiante_id || progreso.estudiante;
      if (!dedupMap.has(id)) {
        dedupMap.set(id, progreso);
      }
    });
    const datosSinDuplicados = Array.from(dedupMap.values());

    // Si no hay orden guardado, crear uno basado en los datos actuales
    if (!ordenActual || ordenActual.length === 0) {
      const nuevoOrden = datosSinDuplicados.map(progreso => obtenerIdProgreso(progreso));
      localStorage.setItem('instructor_orden_estudiantes', JSON.stringify(nuevoOrden));
      return { datos: datosSinDuplicados, nuevoOrden };
    }

    // Crear un mapa de los nuevos datos por ID
    const mapaDatos = new Map();
    datosSinDuplicados.forEach(progreso => {
      mapaDatos.set(obtenerIdProgreso(progreso), progreso);
    });

    // Ordenar según el orden guardado
    const datosOrdenados = [];
    const idsProcesados = new Set();
    let ordenActualizado = [...ordenActual];

    // Primero agregar los que están en el orden guardado
    ordenActual.forEach(id => {
      if (mapaDatos.has(id) && !idsProcesados.has(id)) {
        datosOrdenados.push(mapaDatos.get(id));
        idsProcesados.add(id);
      }
    });

    // Luego agregar los nuevos que no estaban en el orden guardado
    datosSinDuplicados.forEach(progreso => {
      const id = obtenerIdProgreso(progreso);
      if (!idsProcesados.has(id)) {
        datosOrdenados.push(progreso);
        ordenActualizado.push(id);
      }
    });

    // Guardar el nuevo orden
    localStorage.setItem('instructor_orden_estudiantes', JSON.stringify(ordenActualizado));

    return { datos: datosOrdenados, nuevoOrden: ordenActualizado };
  };

  // Función para cargar jornadas desde el backend
  const cargarJornadasEstudiante = async (estudianteId) => {
    try {
      if (!estudianteId) return {};
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/instructor/jornadas/${estudianteId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.jornadas || {};
        }
      }
    } catch (error) {
      console.error('Error cargando jornadas:', error);
    }
    return {};
  };

  // Función para guardar jornadas en el backend
  const guardarJornadasEstudiante = async (estudianteId, jornadas) => {
    try {
      if (!estudianteId) return;
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/instructor/jornadas/${estudianteId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jornadas })
      });

      if (!response.ok) {
        console.error('Error guardando jornadas (ID:', estudianteId, ')');
      } else {
        console.log('✅ Jornadas guardadas para ID:', estudianteId);
      }
    } catch (error) {
      console.error('Error guardando jornadas:', error);
    }
  };

  const descargarPlanNegocioEstudiante = async (eid, nombreEstudiante) => {
    const tid = toast.loading('Abriendo vista de impresión…');
    try {
      const url = `/instructor/plan-estudiante/${encodeURIComponent(eid)}?print=1&tab=formulario&close=1`;
      const printWindow = window.open(url, '_blank', 'width=1280,height=900,noopener=no,noreferrer=no');
      toast.dismiss(tid);
      if (!printWindow) {
        toast.error('El navegador bloqueó la ventana de impresión. Permite popups e inténtalo de nuevo.');
        return;
      }
      printWindow.focus();
      toast.success(`Preparando impresión para ${nombreEstudiante}…`);
    } catch (err) {
      toast.dismiss(tid);
      console.error(err);
      toast.error('Error al abrir la vista de impresión del plan.');
    }
  };

  const cargarProgresoEstudiantes = async () => {
    try {
      // Guardar posición del scroll antes de actualizar
      const scrollPosition = window.scrollY;
      sessionStorage.setItem('instructor_dashboard_scroll', scrollPosition.toString());

      const progresoResponse = await fetch(`${API_BASE_URL}/instructor/progreso-estudiantes`, {
        credentials: 'include'
      });

      if (progresoResponse.ok) {
        const progresoData = await progresoResponse.json();
        if (progresoData.success) {
          console.log("📊 Datos de progreso recibidos:", progresoData.progreso_estudiantes);
          // Log detallado de intentos
          progresoData.progreso_estudiantes?.forEach(progreso => {
            progreso.progreso_pasos?.forEach(paso => {
              if (paso.intentos !== undefined && paso.intentos > 0) {
                console.log(`✅ Intentos encontrados: ${progreso.estudiante} - ${progreso.modulo} - ${paso.nombre}: ${paso.intentos}`);
              }
            });
          });

          // Mantener el orden estable
          const resultado = mantenerOrdenEstable(progresoData.progreso_estudiantes || [], ordenEstudiantes);
          setProgresoEstudiantes(resultado.datos);
          setOrdenEstudiantes(resultado.nuevoOrden);
          // Jornadas vienen en la respuesta de progreso; rellenar estado para que se vean sin depender del lazy-load
          const jornadasDesdeApi = {};
          (progresoData.progreso_estudiantes || []).forEach((p) => {
            const id = p?.estudiante_id ?? p?.estudianteId ?? p?.user_id;
            if (id != null && p?.jornadas && typeof p.jornadas === 'object') {
              const normalizado = {};
              Object.keys(p.jornadas).forEach((k) => {
                normalizado[Number(k) || k] = Boolean(p.jornadas[k]);
              });
              jornadasDesdeApi[id] = normalizado;
            }
          });
          if (Object.keys(jornadasDesdeApi).length) {
            setJornadasMarcadas((prev) => ({ ...prev, ...jornadasDesdeApi }));
          }

          // Restaurar posición del scroll después de actualizar
          setTimeout(() => {
            const savedScroll = sessionStorage.getItem('instructor_dashboard_scroll');
            if (savedScroll) {
              window.scrollTo(0, parseInt(savedScroll, 10));
            }
          }, 50);
          return { ok: true, datos: resultado.datos };
        }
      } else {
        console.error("❌ Error en respuesta:", progresoResponse.status, await progresoResponse.text());
      }
    } catch (error) {
      console.error("Error al cargar progreso de estudiantes:", error);
    }
    return { ok: false, datos: null };
  };

  const cargarDatosInstructor = async () => {
    try {
      setLoading(true);

      // Cargar datos del dashboard del instructor
      const dashboardResponse = await fetch(`${API_BASE_URL}/instructor/dashboard`, {
        credentials: 'include'
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success) {
          setEstadisticas(prev => ({
            ...prev,
            totalCursos: dashboardData.data.totalCursos,
            totalEstudiantes: dashboardData.data.totalEstudiantes,
            promedioProgreso: dashboardData.data.promedioProgreso
          }));
          setCursos(dashboardData.data.cursos || []);
        } else {
          toast.error("Error al cargar datos del dashboard");
        }
      } else {
        toast.error("Error al conectar con el servidor");
      }

      // Cargar actividad reciente y progreso de estudiantes
      await cargarActividadReciente();
      await cargarProgresoEstudiantes();
    } catch (error) {
      toast.error("Error al cargar los datos del instructor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular puntos basados en intentos
  const calcularPuntos = (intentos) => {
    if (!intentos || intentos === 0) return 0;
    if (intentos === 1) return 5;
    if (intentos >= 2 && intentos <= 4) return 4;
    if (intentos >= 5) return 3;
    return 0;
  };

  const calcularGranTotalPuntos = (progreso) => {
    // Calcular gran total de puntos sumando todos los puntos de todos los módulos
    const puntosModulos = (progreso.modulos || [progreso]).reduce((total, moduloData) => {
      const progresoPasos = moduloData.progreso_pasos || progreso.progreso_pasos || [];
      const puntosModulo = progresoPasos.reduce((suma, paso) => {
        if (paso.nombre === 'Plan de Negocio') {
          return suma + (paso.puntos_plan_negocio || 0);
        }
        return suma + calcularPuntos(paso.intentos || 0);
      }, 0);
      return total + puntosModulo;
    }, 0);

    // Puntos por asistencia (jornadas): priorizar datos del objeto progreso (API), luego estado local
    const estudianteId = progreso.estudiante_id;
    const jornadasDesdeProgreso =
      progreso?.jornadas && typeof progreso.jornadas === 'object' ? progreso.jornadas : {};
    const jornadasEstudiante =
      Object.keys(jornadasDesdeProgreso).length > 0
        ? jornadasDesdeProgreso
        : estudianteId && jornadasMarcadas[estudianteId]
          ? jornadasMarcadas[estudianteId]
          : {};
    const puntosAsistencia = Object.values(jornadasEstudiante).filter(Boolean).length;

    return puntosModulos + puntosAsistencia;
  };

  const escapeHtml = (value) => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const normalizarModuloExport = (modulo) => {
    const value = (modulo || '').toString().trim();
    const alias = {
      'Finanzas y Gestión Empresarial': 'Finanzas',
      'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente'
    };
    return alias[value] || value;
  };

  const formatearPorcentajeExcel = (value) => {
    const numero = Number(value || 0);
    if (!Number.isFinite(numero)) return '0%';
    const redondeado = Math.round(numero * 100) / 100;
    return Number.isInteger(redondeado) ? `${redondeado}%` : `${redondeado.toFixed(2)}%`;
  };

  /** CSV + API alineados con el dashboard (evita Excel con datos viejos por cierre React). */
  const obtenerMapsYProgresoFrescos = async () => {
    let maps = { mapById: municipiosMapById, mapByName: municipiosMapByName };
    try {
      const res = await fetch('/municipios.csv', { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        maps = buildMunicipiosMapsFromCsvText(text);
        setMunicipiosMapById(maps.mapById);
        setMunicipiosMapByName(maps.mapByName);
      }
    } catch {
      // usar maps del estado
    }
    const prog = await cargarProgresoEstudiantes();
    if (!prog?.ok || !prog.datos) {
      return { ok: false, agrupado: null, maps };
    }
    const agrupado = agruparProgresoPorMunicipio(prog.datos, maps.mapById, maps.mapByName);
    return { ok: true, agrupado, maps };
  };

  const descargarInformeExcel = async () => {
    if (!municipioSeleccionado) {
      toast.error('Selecciona un municipio antes de descargar el informe.');
      return;
    }

    const tid = toast.loading('Sincronizando datos para el informe…');
    let estudiantes;
    try {
      const { ok, agrupado } = await obtenerMapsYProgresoFrescos();
      toast.dismiss(tid);
      if (!ok || !agrupado?.length) {
        toast.error('No hay datos de estudiantes para el informe.');
        return;
      }
      const entry = agrupado.find(([m]) => m === municipioSeleccionado);
      estudiantes = entry ? entry[1] : [];
    } catch (e) {
      toast.dismiss(tid);
      console.error(e);
      toast.error('No se pudieron cargar los datos.');
      return;
    }

    if (!estudiantes || estudiantes.length === 0) {
      toast.error('No hay estudiantes para el municipio seleccionado.');
      return;
    }

    const rows = estudiantes.map((p) => {
      const id = p?.estudiante_id ?? p?.estudianteId ?? p?.user_id ?? p?.usuario_id ?? '';
      const nombre = p?.estudiante ?? '';
      const puntos = calcularGranTotalPuntos(p);
      return { id, nombre, puntos };
    }).sort((a, b) => {
      // Ordenar por puntos desc y luego nombre asc
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return String(a.nombre).localeCompare(String(b.nombre), 'es');
    });

    // Excel (.xls) simple usando tabla HTML (compatible con Excel)
    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const nombreArchivo = `informe_consolidado_${municipioSeleccionado.replace(/\s+/g, '_')}_${yyyy}-${mm}-${dd}.xls`;

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th>Municipio</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Gran total de puntos</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td>${escapeHtml(municipioSeleccionado)}</td>
                  <td>${escapeHtml(r.id)}</td>
                  <td>${escapeHtml(r.nombre)}</td>
                  <td>${escapeHtml(r.puntos)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `.trim();

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Informe descargado (datos actualizados).');
  };

  const descargarEstadisticasMunicipios = async () => {
    const tid = toast.loading('Sincronizando datos para estadísticas por municipio…');
    let agrupadoFuente;
    try {
      const { ok, agrupado } = await obtenerMapsYProgresoFrescos();
      toast.dismiss(tid);
      if (!ok || !agrupado?.length) {
        toast.error('No hay datos por municipio para generar el archivo.');
        return;
      }
      agrupadoFuente = agrupado;
    } catch (e) {
      toast.dismiss(tid);
      console.error(e);
      toast.error('No se pudieron cargar los datos.');
      return;
    }

    const municipiosValidos = agrupadoFuente
      .filter(([municipio]) => municipio && municipio !== 'Sin municipio');

    if (!municipiosValidos.length) {
      toast.error('No hay municipios válidos para exportar.');
      return;
    }

    const resumenRows = [];
    const intentosPorModuloRows = [];

    for (const [municipio, estudiantes] of municipiosValidos) {
      const totalEstudiantes = estudiantes.length;
      let intentosTotales = 0;
      let sumaPorcentajeTotal = 0;
      let jornadasMarcadasTotal = 0;
      const intentosPorModulo = Object.fromEntries(MODULES_EXPORT_ORDER.map((modulo) => [modulo, 0]));

      for (const progreso of estudiantes) {
        const porcentaje = Number(progreso?.porcentaje_total ?? progreso?.porcentaje ?? 0);
        sumaPorcentajeTotal += Number.isFinite(porcentaje) ? porcentaje : 0;

        const estudianteId = progreso?.estudiante_id;
        const jornadasDesdeProgreso = progreso?.jornadas && typeof progreso.jornadas === 'object'
          ? progreso.jornadas
          : {};
        const jornadasEstudiante =
          Object.keys(jornadasDesdeProgreso).length > 0
            ? jornadasDesdeProgreso
            : estudianteId && jornadasMarcadas[estudianteId]
              ? jornadasMarcadas[estudianteId]
              : {};
        jornadasMarcadasTotal += Object.values(jornadasEstudiante || {}).filter(Boolean).length;

        for (const moduloData of (progreso.modulos || [progreso])) {
          const modulo = normalizarModuloExport(moduloData.modulo || progreso.modulo);
          const progresoPasos = moduloData.progreso_pasos || progreso.progreso_pasos || [];
          const intentosModulo = progresoPasos.reduce((total, paso) => total + (paso.intentos || 0), 0);
          intentosTotales += intentosModulo;
          if (Object.prototype.hasOwnProperty.call(intentosPorModulo, modulo)) {
            intentosPorModulo[modulo] += intentosModulo;
          }
        }
      }

      const pctFinalizacion = totalEstudiantes > 0 ? (sumaPorcentajeTotal / totalEstudiantes) : 0;
      const pctAsistencia = totalEstudiantes > 0 ? ((jornadasMarcadasTotal / (totalEstudiantes * 10)) * 100) : 0;

      resumenRows.push({
        'Municipio': municipio,
        'Total estudiantes': totalEstudiantes,
        'Intentos totales': intentosTotales,
        '% finalización módulos': formatearPorcentajeExcel(pctFinalizacion),
        '% asistencia': formatearPorcentajeExcel(pctAsistencia)
      });

      const filaIntentos = { Municipio: municipio };
      MODULES_EXPORT_ORDER.forEach((modulo) => {
        filaIntentos[modulo] = intentosPorModulo[modulo] || 0;
      });
      intentosPorModuloRows.push(filaIntentos);
    }

    const wb = XLSX.utils.book_new();
    const resumenSheet = XLSX.utils.json_to_sheet(resumenRows);
    const intentosSheet = XLSX.utils.json_to_sheet(intentosPorModuloRows);
    XLSX.utils.book_append_sheet(wb, resumenSheet, 'Resumen por municipio');
    XLSX.utils.book_append_sheet(wb, intentosSheet, 'Intentos por módulo');

    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    XLSX.writeFile(wb, `estadisticas_municipios_${yyyy}-${mm}-${dd}.xlsx`);
    toast.success(`Archivo generado para ${resumenRows.length} municipio(s) (datos actualizados).`);
  };

  const descargarEstudiantesSinCompletar = async () => {
    const tid = toast.loading('Sincronizando datos del servidor y municipios…');
    try {
      const { ok, agrupado } = await obtenerMapsYProgresoFrescos();
      toast.dismiss(tid);
      if (!ok || !agrupado?.length) {
        toast.error('No hay datos de estudiantes para generar el informe.');
        return;
      }

      const rows = [];
      for (const [municipio, estudiantes] of agrupado) {
        if (!municipio || String(municipio).trim().toLowerCase() === 'sin municipio') continue;

        for (const p of estudiantes) {
          const pct = p.porcentaje_total ?? p.porcentaje ?? 0;
          if (pct >= 100) continue;

          const nombre = p.estudiante ?? (`${p.nombre || ''} ${p.apellido || ''}`.trim() || 'Sin nombre');
          rows.push({
            Municipio: municipio,
            'Nombre del estudiante': nombre,
            'Porcentaje de la barra de progreso': `${Math.round(pct * 100) / 100}%`
          });
        }
      }

      rows.sort((a, b) => {
        const cmpM = (a.Municipio || '').localeCompare(b.Municipio || '', 'es');
        if (cmpM !== 0) return cmpM;
        return (a['Nombre del estudiante'] || '').localeCompare(b['Nombre del estudiante'] || '', 'es');
      });

      if (rows.length === 0) {
        toast.info('No hay estudiantes sin completar (todos al 100% o sin municipio asignado).');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Sin completar');

      const fecha = new Date();
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');
      XLSX.writeFile(wb, `estudiantes_sin_completar_${yyyy}-${mm}-${dd}.xlsx`);
      toast.success(`${rows.length} estudiante(s) sin completar descargados (datos actualizados).`);
    } catch (e) {
      toast.dismiss(tid);
      console.error(e);
      toast.error('No se pudo generar el informe.');
    }
  };

  const obtenerIconoActividad = (accion) => {
    if (accion && accion.startsWith('Completó:')) {
      return <BookOpen className="h-4 w-4 text-green-500" />;
    }
    switch (accion) {
      case 'nuevo_estudiante':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'completado_modulo':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'nuevo_recurso':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const progresoAgrupadoPorMunicipio = useMemo(
    () => agruparProgresoPorMunicipio(progresoEstudiantes, municipiosMapById, municipiosMapByName),
    [progresoEstudiantes, municipiosMapById, municipiosMapByName]
  );

  const progresoAgrupadoPorNodo = useMemo(() => {
    const baseNodes = getForumNodes().map((node) => ({
      ...node,
      fechaActividad: NODE_ACTIVITY_DATE_LABELS[node.slug] || null,
      municipiosAgrupados: [],
      totalEstudiantes: 0,
    }));
    const nodeBySlug = new Map(baseNodes.map((node) => [node.slug, node]));
    const fallbackNode = {
      slug: 'sin-nodo',
      name: 'Sin nodo asignado',
      central: '',
      municipios: [],
      fechaActividad: null,
      municipiosAgrupados: [],
      totalEstudiantes: 0,
      isFallback: true,
    };

    for (const [municipio, estudiantes] of progresoAgrupadoPorMunicipio) {
      const resolvedNode = resolveForumNodeByMunicipio(municipio);
      const targetNode = resolvedNode ? nodeBySlug.get(resolvedNode.slug) : fallbackNode;
      if (!targetNode) continue;
      targetNode.municipiosAgrupados.push([municipio, estudiantes]);
      targetNode.totalEstudiantes += estudiantes.length;
    }

    const result = baseNodes.map((node) => ({
      ...node,
      totalMunicipiosConProgreso: node.municipiosAgrupados.length,
    }));

    if (fallbackNode.municipiosAgrupados.length > 0) {
      result.push({
        ...fallbackNode,
        totalMunicipiosConProgreso: fallbackNode.municipiosAgrupados.length,
      });
    }

    return result;
  }, [progresoAgrupadoPorMunicipio]);

  const municipiosOpciones = useMemo(() => {
    return progresoAgrupadoPorMunicipio
      .map(([m]) => m)
      .filter((m) => m && m !== 'Sin municipio');
  }, [progresoAgrupadoPorMunicipio]);

  // Lazy-load jornadas SOLO para los estudiantes visibles (municipios abiertos).
  useEffect(() => {
    let cancelled = false;
    const inflight = new Set();
    const run = async () => {
      try {
        const visibles = new Map(); // id -> nombre (para logs si es necesario, pero usaremos id como clave)
        for (const [municipio, estudiantes] of progresoAgrupadoPorMunicipio) {
          if (!municipiosOpen[municipio]) continue;
          for (const p of estudiantes) {
            const eid = p?.estudiante_id;
            if (eid) visibles.set(eid, p.estudiante);
          }
        }
        const pendientes = Array.from(visibles.keys()).filter((id) => !jornadasMarcadas[id] && !inflight.has(id));
        // Limitar concurrencia para no saturar API
        const batch = pendientes.slice(0, 20);
        if (batch.length === 0) return;

        batch.forEach((id) => inflight.add(id));
        const results = await Promise.allSettled(batch.map(async (id) => {
          const jornadas = await cargarJornadasEstudiante(id);
          return { id, jornadas };
        }));
        if (cancelled) return;
        const jornadasCargadas = {};
        results.forEach((r) => {
          if (r.status === 'fulfilled' && r.value) jornadasCargadas[r.value.id] = r.value.jornadas || {};
        });
        if (Object.keys(jornadasCargadas).length) {
          setJornadasMarcadas(prev => ({ ...prev, ...jornadasCargadas }));
        }
      } catch {
        // silencioso
      }
    };
    run();
    const t = setInterval(run, 5000); // refresco suave mientras el instructor tiene municipios abiertos
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [municipiosOpen, progresoAgrupadoPorMunicipio, jornadasMarcadas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
      {!embedded && (
        <InstructorHeader
          title="Dashboard del Instructor"
          subtitle="Gestiona tus cursos y contenido educativo"
        />
      )}

      <div className={embedded ? '' : 'max-w-7xl mx-auto p-6'}>
        {!embedded && (
          <div className="mb-6">
          <Card>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Foros por nodo</h2>
                <p className="text-sm text-gray-600">
                  Revisa y responde preguntas de estudiantes agrupadas por nodo territorial.
                </p>
              </div>
              <Button onClick={() => navigate('/instructor/foro')}>
                <MessageSquareMore className="w-4 h-4 mr-2" />
                Abrir foros por nodo
              </Button>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Contenido principal */}

        {/* Contenido principal */}
        <Tabs defaultValue="actividad" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
            <TabsTrigger value="recursos">Gestión de Informes</TabsTrigger>
          </TabsList>

          <TabsContent value="actividad" className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">Progreso de Estudiantes por nodo</h2>
              <p className="text-sm text-gray-600">
                Primero se agrupan los municipios por nodo territorial. Al abrir un nodo aparecen sus municipios y luego el detalle de estudiantes.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {progresoEstudiantes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No hay progreso registrado</p>
                      <p className="text-sm">El progreso de los estudiantes aparecerá aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progresoAgrupadoPorNodo.map((nodo) => {
                        const isNodeOpen = nodosOpen[nodo.slug] || false;
                        return (
                          <div key={nodo.slug} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-slate-50 to-white px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                              onClick={() => setNodosOpen(prev => ({ ...prev, [nodo.slug]: !prev[nodo.slug] }))}
                              aria-expanded={isNodeOpen}
                            >
                              <div className="flex flex-col items-start gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base font-semibold text-gray-900">
                                    {nodo.isFallback ? nodo.name : `Nodo ${nodo.name}`}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={nodo.fechaActividad
                                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 bg-gray-50 text-gray-600'}
                                  >
                                    {nodo.fechaActividad || 'Fecha pendiente'}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  {!nodo.isFallback && (
                                    <p className="text-xs text-gray-600">
                                      Cabecera: {nodo.central}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-600">
                                    {nodo.totalMunicipiosConProgreso} municipio{nodo.totalMunicipiosConProgreso !== 1 ? 's' : ''} con progreso visible
                                    {!nodo.isFallback && ` de ${nodo.municipios.length}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-xl font-bold text-blue-600">{nodo.totalEstudiantes}</div>
                                  <p className="text-xs text-gray-500">estudiante{nodo.totalEstudiantes !== 1 ? 's' : ''}</p>
                                </div>
                                <ChevronRight
                                  className={`w-5 h-5 text-gray-600 transition-transform ${isNodeOpen ? 'rotate-90' : ''}`}
                                />
                              </div>
                            </button>

                            {isNodeOpen && (
                              <div className="space-y-4 border-t border-gray-100 pt-4">
                                {nodo.totalMunicipiosConProgreso === 0 ? (
                                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                                    Aún no hay municipios con progreso visible en este nodo.
                                  </div>
                                ) : (
                                  nodo.municipiosAgrupados.map(([municipio, estudiantes]) => {
                                    const isOpen = municipiosOpen[municipio] || false;
                                    return (
                                      <div key={municipio} className="space-y-4">
                                        <button
                                          type="button"
                                          className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
                                          onClick={() => setMunicipiosOpen(prev => ({ ...prev, [municipio]: !prev[municipio] }))}
                                          aria-expanded={isOpen}
                                        >
                                          <div className="flex flex-col items-start">
                                            <span className="text-sm font-semibold text-gray-900">{municipio}</span>
                                            <span className="text-xs text-gray-600">
                                              {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''}
                                            </span>
                                          </div>
                                          <ChevronRight
                                            className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                                          />
                                        </button>

                                        {isOpen && (
                                          <div className="space-y-6">
                                            {estudiantes.map((progreso) => {
                                              const progresoId = obtenerIdProgreso(progreso);

                                              // Calcular gran total de puntos sumando todos los puntos de todos los módulos
                                              const puntosModulos = (progreso.modulos || [progreso]).reduce((total, moduloData) => {
                                                const progresoPasos = moduloData.progreso_pasos || progreso.progreso_pasos || [];
                                                const puntosModulo = progresoPasos.reduce((suma, paso) => {
                                                  if (paso.nombre === 'Plan de Negocio') {
                                                    return suma + (paso.puntos_plan_negocio || 0);
                                                  }
                                                  return suma + calcularPuntos(paso.intentos || 0);
                                                }, 0);
                                                return total + puntosModulo;
                                              }, 0);

                                              // Obtener jornadas marcadas para este estudiante usando su ID
                                              const estudianteId = progreso.estudiante_id;
                                              const jornadasEstudiante = jornadasMarcadas[estudianteId] || {};
                                              const puntosAsistencia = Object.values(jornadasEstudiante).filter(Boolean).length;

                                              // Calcular gran total incluyendo puntos de asistencia
                                              const granTotalPuntos = puntosModulos + puntosAsistencia;

                                              // Función para manejar cambio de jornada
                                              const handleJornadaChange = async (jornadaNum, checked) => {
                                                if (!estudianteId) return;

                                                const nuevasJornadas = {
                                                  ...(jornadasMarcadas[estudianteId] || {}),
                                                  [jornadaNum]: checked
                                                };

                                                const nuevoEstado = {
                                                  ...jornadasMarcadas,
                                                  [estudianteId]: nuevasJornadas
                                                };

                                                setJornadasMarcadas(nuevoEstado);

                                                // Guardar en el backend
                                                await guardarJornadasEstudiante(estudianteId, nuevasJornadas);
                                              };

                                              return (
                                                <div key={progresoId} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                      {/* Header del estudiante */}
                                      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 items-center space-x-4">
                                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-white" />
                                              </div>
                                              <div className="min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 break-words">{progreso.estudiante}</h3>
                                                <p className="text-sm text-gray-600">{progreso.total_modulos || progreso.modulos?.length || 0} módulo{(progreso.total_modulos || progreso.modulos?.length || 0) !== 1 ? 's' : ''}</p>
                                              </div>
                                            </div>
                                            {estudianteId ? (
                                              <div className="flex-shrink-0">
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  className="w-full bg-gradient-to-r from-[#AA27B9] to-[#8E1FA3] text-white border-0 hover:opacity-90 hover:text-white shadow-sm text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap sm:w-auto"
                                                  onClick={() => descargarPlanNegocioEstudiante(estudianteId, progreso.estudiante)}
                                                  title="Abre el mismo flujo de impresión del botón Generar Plan de Negocio"
                                                >
                                                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" />
                                                  <span className="hidden sm:inline">Generar plan de negocio</span>
                                                  <span className="sm:hidden">Plan negocio</span>
                                                </Button>
                                              </div>
                                            ) : null}
                                          </div>

                                          {/* Casillas de jornadas */}
                                          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                                            <span className="mb-2 block text-xs font-medium text-gray-600">Jornadas:</span>
                                            <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
                                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((jornadaNum) => (
                                                <label
                                                  key={jornadaNum}
                                                  className="relative inline-flex items-center justify-center cursor-pointer"
                                                  title={`Jornada ${jornadaNum}`}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={jornadasEstudiante[jornadaNum] || false}
                                                    onChange={(e) => handleJornadaChange(jornadaNum, e.target.checked)}
                                                    className="sr-only peer"
                                                  />
                                                  <div className="h-10 w-full min-w-0 rounded-md border-2 border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600 bg-white transition-all duration-200 hover:border-purple-400 hover:bg-purple-50 peer-checked:border-purple-600 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:hover:bg-purple-700 sm:w-10">
                                                    {jornadaNum}
                                                  </div>
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="xl:pl-4">
                                          <div className="flex flex-row items-start justify-between gap-4 sm:justify-end">
                                            <div className="min-w-0">
                                              <div className="text-2xl font-bold text-blue-600">{progreso.porcentaje_total || progreso.porcentaje || 0}%</div>
                                              <p className="text-sm text-gray-500">Progreso general</p>
                                            </div>
                                            <div className="border-l border-gray-200 pl-4 min-w-0">
                                              <div className="text-2xl font-bold text-purple-600">{granTotalPuntos}</div>
                                              <p className="text-sm text-purple-600 font-medium">Gran total de puntos</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Barra de progreso general */}
                                      <div className="mb-4">
                                        <Progress value={progreso.porcentaje_total || progreso.porcentaje || 0} className="h-3" />
                                      </div>

                                      {/* Módulos desplegables */}
                                      <div className="space-y-2">
                                        {[...(progreso.modulos || [progreso])]
                                          .sort((a, b) => {
                                            // Ordenar por modulo_orden si está disponible
                                            const ordenA = (a.modulo_orden !== undefined && a.modulo_orden !== null) ? a.modulo_orden : 999;
                                            const ordenB = (b.modulo_orden !== undefined && b.modulo_orden !== null) ? b.modulo_orden : 999;
                                            return ordenA - ordenB;
                                          })
                                          .map((moduloData, moduloIndex) => {
                                            const modulo = moduloData.modulo || progreso.modulo;
                                            const moduloOrden = moduloData.modulo_orden || progreso.modulo_orden;
                                            const progresoPasos = moduloData.progreso_pasos || progreso.progreso_pasos || [];
                                            const moduloKey = `${progreso.estudiante}-${modulo}`;
                                            const isModuloExpanded = expandedModulos[moduloKey] || false;

                                            // Calcular total de intentos del módulo sumando los intentos de todas las unidades
                                            const totalIntentosModulo = progresoPasos.reduce((total, paso) => {
                                              return total + (paso.intentos || 0);
                                            }, 0);

                                            // Calcular puntos totales del módulo sumando los puntos de todas las unidades y plan de negocio
                                            const puntosTotalesModulo = progresoPasos.reduce((total, paso) => {
                                              if (paso.nombre === 'Plan de Negocio') {
                                                return total + (paso.puntos_plan_negocio || 0);
                                              }
                                              return total + calcularPuntos(paso.intentos || 0);
                                            }, 0);

                                            // Formatear el nombre del módulo con el número
                                            const nombreModuloConNumero = moduloOrden
                                              ? `Módulo ${moduloOrden}: ${modulo}`
                                              : modulo;

                                            return (
                                              <div key={moduloIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {/* Header del módulo - Clickable */}
                                                <div
                                                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                                  onClick={() => {
                                                    setExpandedModulos(prev => ({
                                                      ...prev,
                                                      [moduloKey]: !prev[moduloKey]
                                                    }));
                                                  }}
                                                >
                                                  <div className="flex items-center space-x-3 flex-1">
                                                    <ChevronRight
                                                      className={`w-5 h-5 text-gray-500 transition-transform ${isModuloExpanded ? 'rotate-90' : ''}`}
                                                    />
                                                    <div>
                                                      <h4 className="text-sm font-semibold text-gray-900">{nombreModuloConNumero}</h4>
                                                      <p className="text-xs text-gray-500">
                                                        {moduloData.pasos_completados || 0}/{moduloData.total_pasos || 0} pasos - {moduloData.porcentaje || 0}%
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="text-right">
                                                    <div className="text-sm font-bold text-blue-600">
                                                      {moduloData.porcentaje || 0}%
                                                      {totalIntentosModulo > 0 && (
                                                        <span className="text-gray-600 font-normal ml-1">
                                                          ({totalIntentosModulo} intento{totalIntentosModulo !== 1 ? 's' : ''}
                                                          {puntosTotalesModulo > 0 && (
                                                            <span className="ml-2 font-semibold text-purple-600">
                                                              • {puntosTotalesModulo} puntos
                                                            </span>
                                                          )}
                                                          )
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Contenido del módulo - Desplegable */}
                                                {isModuloExpanded && (
                                                  <div className="p-4 bg-white border-t border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                      {progresoPasos.map((paso, pasoIndex) => {
                                                        const porcentajePaso = paso.porcentaje || 0;
                                                        const tieneProgresoParcial = porcentajePaso > 0 && porcentajePaso < 100;
                                                        const pasoKey = `${progreso.estudiante}-${modulo}-${pasoIndex}`;
                                                        const isExpanded = expandedPasos[pasoKey] || false;
                                                        const tieneIntentos = paso.intentos !== undefined && paso.intentos > 0;
                                                        const esUnidad = paso.nombre.includes('Unidad');
                                                        const esPlanNegocio = paso.nombre === 'Plan de Negocio';
                                                        const puntosPaso = esPlanNegocio ? (paso.puntos_plan_negocio || 0) : calcularPuntos(paso.intentos || 0);

                                                        return (
                                                          <div
                                                            key={pasoIndex}
                                                            className={`flex flex-col space-y-2 p-3 rounded-lg border transition-all ${paso.completado
                                                              ? 'bg-green-50 border-green-200 text-green-800'
                                                              : tieneProgresoParcial
                                                                ? 'bg-green-50/50 border-green-300 text-green-700'
                                                                : 'bg-gray-50 border-gray-200 text-gray-600'
                                                              } ${esUnidad && tieneIntentos ? 'cursor-pointer hover:shadow-md' : ''}`}
                                                            onClick={() => {
                                                              if (esUnidad && tieneIntentos) {
                                                                setExpandedPasos(prev => ({
                                                                  ...prev,
                                                                  [pasoKey]: !prev[pasoKey]
                                                                }));
                                                              }
                                                            }}
                                                          >
                                                            <div className="flex items-center space-x-3">
                                                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${paso.completado
                                                                ? 'bg-green-500 text-white'
                                                                : tieneProgresoParcial
                                                                  ? 'bg-green-400 text-white'
                                                                  : 'bg-gray-300 text-gray-600'
                                                                }`}>
                                                                {paso.completado ? (
                                                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                  </svg>
                                                                ) : (
                                                                  <span className="text-xs font-bold">{pasoIndex + 1}</span>
                                                                )}
                                                              </div>
                                                              <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                  <p className={`text-sm font-medium truncate ${paso.completado ? 'text-green-800' : tieneProgresoParcial ? 'text-green-700' : 'text-gray-600'
                                                                    }`}>
                                                                    {paso.nombre}
                                                                  </p>
                                                                  {esUnidad && tieneIntentos && (
                                                                    <svg
                                                                      className={`w-4 h-4 text-blue-600 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                                                                      fill="none"
                                                                      stroke="currentColor"
                                                                      viewBox="0 0 24 24"
                                                                    >
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                  )}
                                                                </div>
                                                                {/* Fecha/hora del intento: no se muestra en UI; el API sigue enviando paso.fecha */}
                                                                <div className="flex items-center justify-between mt-1">
                                                                  {tieneIntentos && !isExpanded && esUnidad && (
                                                                    <p className="text-xs text-blue-600 font-semibold">
                                                                      {paso.intentos} intento{paso.intentos !== 1 ? 's' : ''} - Click para ver detalles
                                                                    </p>
                                                                  )}
                                                                  {esPlanNegocio && puntosPaso > 0 && (
                                                                    <p className="text-xs text-green-700 font-semibold">
                                                                      Plan de Negocio completado
                                                                    </p>
                                                                  )}
                                                                  {puntosPaso > 0 && (
                                                                    <div className="ml-auto">
                                                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                                        {puntosPaso} puntos
                                                                      </span>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </div>

                                                            {/* Detalles expandidos con intentos */}
                                                            {isExpanded && tieneIntentos && (
                                                              <div className="mt-2 pt-2 border-t border-blue-200">
                                                                <div className="bg-blue-50 rounded p-2">
                                                                  <p className="text-xs font-semibold text-blue-900 mb-1">
                                                                    Intentos de Evaluación:
                                                                  </p>
                                                                  <p className="text-sm font-bold text-blue-700">
                                                                    {paso.intentos} intento{paso.intentos !== 1 ? 's' : ''} {paso.intentos === 1 ? 'registrado' : 'registrados'}
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            )}

                                                            {/* Barra de progreso dentro del cuadrito */}
                                                            {(tieneProgresoParcial || paso.completado) && (
                                                              <div className="w-full">
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                  <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${paso.completado
                                                                      ? 'bg-green-600'
                                                                      : 'bg-green-400'
                                                                      }`}
                                                                    style={{ width: `${porcentajePaso}%` }}
                                                                  />
                                                                </div>
                                                                {tieneProgresoParcial && paso.subpasos_completados !== undefined && paso.total_subpasos !== undefined && (
                                                                  <p className="text-xs text-gray-600 mt-1">
                                                                    {paso.subpasos_completados}/{paso.total_subpasos} subpasos ({Math.round(porcentajePaso)}%)
                                                                  </p>
                                                                )}
                                                              </div>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recursos" className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">Gestión de Informes</h2>
              <p className="text-sm text-gray-600">
                Descarga informes consolidados por municipio individual.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Estudiantes sin completar (progreso &lt; 100%)</h3>
                  <p className="text-xs text-gray-500">
                    Listado de estudiantes con barra de progreso menor al 100%, agrupados por municipio (excluye &quot;Sin municipio&quot;). Al descargar se sincroniza el progreso con el servidor y el CSV de municipios para incluir los últimos cambios.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={descargarEstudiantesSinCompletar}
                    disabled={!progresoAgrupadoPorMunicipio?.length}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Descargar estudiantes sin completar (Excel)
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Estadísticas por municipio</h3>
                  <p className="text-xs text-gray-500">
                    Descarga el archivo `estadisticas_municipios` con el resumen por municipio y una segunda hoja con los intentos totales de cada módulo por municipio.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={descargarEstadisticasMunicipios}
                    disabled={!progresoAgrupadoPorMunicipio?.length}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Descargar estadísticas municipios (Excel)
                  </Button>
                </div>

                <hr className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Informe por municipio (ID, nombre, puntos)
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={municipioSeleccionado}
                      onChange={(e) => setMunicipioSeleccionado(e.target.value)}
                    >
                      <option value="" disabled>Selecciona un municipio</option>
                      {progresoAgrupadoPorMunicipio.map(([municipio]) => (
                        <option key={municipio} value={municipio}>
                          {municipio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <Button
                      className="w-full"
                      onClick={descargarInformeExcel}
                      disabled={!municipioSeleccionado}
                    >
                      Descargar informe (Excel)
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (!tutorBalanceFormUrl) {
                        toast.info('Formulario pendiente: comparte el link para activarlo.');
                        return;
                      }
                      window.open(tutorBalanceFormUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Balance de jornada del Tutor del campus
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  Nota: el archivo se genera en formato compatible con Excel (.xls).
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorDashboard; 
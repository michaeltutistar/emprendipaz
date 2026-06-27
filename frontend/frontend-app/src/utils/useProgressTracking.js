import { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

// Normalización de nombres de módulos para que coincidan con lo que devuelve /api/student/mi-progreso
// (el backend guarda/agrupa algunos módulos con nombres "canónicos" más cortos).
const MODULO_NOMBRE_NORMALIZATION = {
  'Finanzas y Gestión Empresarial': 'Finanzas',
  'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
};

const normalizeModuloNombre = (name) => {
  const key = (name || '').trim();
  return MODULO_NOMBRE_NORMALIZATION[key] || key;
};

/**
 * Hook para rastrear y guardar el progreso de pasos de módulos
 * @param {string} moduloNombre - Nombre del módulo
 * @param {string} pasoNombre - Nombre del paso (ej: "Unidad 1: Presentación")
 * @param {string} cursoNombre - Nombre del curso (opcional, por defecto igual al módulo)
 * @returns {Object} - { pasoCompletado, registrarProgreso, cargarProgreso }
 */
const useProgressTracking = (moduloNombre, pasoNombre, cursoNombre = null) => {
  const [pasoCompletado, setPasoCompletado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const cursoNombreFinal = cursoNombre || moduloNombre;

  // Función para registrar progreso en el backend
  const registrarProgreso = useCallback(async () => {
    try {
      const token = getAuthToken();

      const apiUrl = `${API_BASE_URL}/registrar-progreso-modulo`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          modulo_nombre: moduloNombre,
          paso_nombre: pasoNombre,
          curso_nombre: cursoNombreFinal
        })
      });

      if (response.ok) {
        setPasoCompletado(true);
        window.dispatchEvent(new Event('progreso-actualizado'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al registrar progreso:', error);
      return false;
    }
  }, [moduloNombre, pasoNombre, cursoNombreFinal]);

  // Función para cargar progreso desde el backend
  const cargarProgreso = useCallback(async () => {
    try {
      const token = getAuthToken();

      const apiUrl = `${API_BASE_URL}/student/mi-progreso`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && Array.isArray(data?.modulos)) {
          const moduloNombreRawLower = (moduloNombre || '').toLowerCase();
          const moduloNombreNormLower = normalizeModuloNombre(moduloNombre).toLowerCase();

          const modulo = data.modulos.find((m) => {
            const nombre = (m?.modulo || '').toLowerCase();
            return nombre === moduloNombreRawLower || nombre === moduloNombreNormLower;
          });

          if (modulo && Array.isArray(modulo?.progreso_pasos)) {
            const pasoNombreLower = pasoNombre.toLowerCase();

            // Buscar en los pasos completados directamente
            // El backend agrupa pasos por unidad, pero también incluye pasos individuales en otros_pasos
            for (const pasoEntry of modulo.progreso_pasos) {
              const nombrePaso = (pasoEntry?.nombre || '').toLowerCase();

              // Comparación flexible del nombre del paso
              // Puede ser "Unidad 1: Presentación" vs "Unidad 1" o solo "Presentación"
              const partesPasoNombre = pasoNombreLower.split(':').map(s => s.trim());
              const nombrePasoParts = nombrePaso.split(':').map(s => s.trim());

              // Verificar coincidencia exacta o parcial
              if (nombrePaso === pasoNombreLower) {
                // Coincidencia exacta
                if (pasoEntry?.completado === true) {
                  setPasoCompletado(true);
                  return;
                }
              } else if (pasoNombreLower.includes(nombrePaso) || nombrePaso.includes(pasoNombreLower)) {
                // Coincidencia parcial
                if (pasoEntry?.completado === true) {
                  setPasoCompletado(true);
                  return;
                }
              } else {
                // Verificar si todas las partes del pasoNombre están en nombrePaso
                const todasLasPartesCoinciden = partesPasoNombre.every(parte =>
                  parte && (nombrePaso.includes(parte) || nombrePasoParts.some(npp => npp.includes(parte)))
                );
                if (todasLasPartesCoinciden && pasoEntry?.completado === true) {
                  setPasoCompletado(true);
                  return;
                }
              }

              // Si el pasoEntry es una unidad (contiene "Unidad"), buscar en sus subpasos si existen
              if (Array.isArray(pasoEntry?.subpasos)) {
                for (const subpaso of pasoEntry.subpasos) {
                  const nombreSubpaso = (subpaso?.nombre || '').toLowerCase();
                  if (nombreSubpaso === pasoNombreLower ||
                    nombreSubpaso.includes(pasoNombreLower) ||
                    pasoNombreLower.includes(nombreSubpaso)) {
                    if (subpaso?.completado === true) {
                      setPasoCompletado(true);
                      return;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    } finally {
      setCargando(false);
    }
  }, [moduloNombre, pasoNombre]);

  // Cargar progreso al montar el componente
  useEffect(() => {
    cargarProgreso();
  }, [cargarProgreso]);

  return {
    pasoCompletado,
    registrarProgreso,
    cargarProgreso,
    cargando
  };
};

export default useProgressTracking;

import { useState, useEffect } from 'react';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';
import { getModuleProgressSummary } from '@/utils/offline-student-state';

/**
 * Hook personalizado para cargar el progreso de unidades de un módulo desde el backend
 * @param {string} moduleName - Nombre del módulo en el backend (ej: 'Descubrimiento de Oportunidades')
 * @returns {Object} - Objeto con el estado del progreso de las unidades
 */
export const useModuleProgress = (moduleName) => {
  const [unidad1Completada, setUnidad1Completada] = useState(false);
  const [unidad2Completada, setUnidad2Completada] = useState(false);
  const [unidad3Completada, setUnidad3Completada] = useState(false);
  const [progresoUnidad1, setProgresoUnidad1] = useState(0);
  const [progresoUnidad2, setProgresoUnidad2] = useState(0);
  const [progresoUnidad3, setProgresoUnidad3] = useState(0);
  const [progresoBackendCargado, setProgresoBackendCargado] = useState(false);

  const cargarProgresoDesdeBackend = async () => {
    try {
      const token = getAuthToken();

      const apiUrl = import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/student/mi-progreso`
        : `${API_BASE_URL}/student/mi-progreso`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setProgresoUnidad1(0);
        setProgresoUnidad2(0);
        setProgresoUnidad3(0);
        setUnidad1Completada(false);
        setUnidad2Completada(false);
        setUnidad3Completada(false);
        setProgresoBackendCargado(true);
        return true;
      }

      const data = await response.json();
      if (!data?.success || !Array.isArray(data?.modulos)) {
        setProgresoUnidad1(0);
        setProgresoUnidad2(0);
        setProgresoUnidad3(0);
        setUnidad1Completada(false);
        setUnidad2Completada(false);
        setUnidad3Completada(false);
        setProgresoBackendCargado(true);
        return true;
      }

      const summary = getModuleProgressSummary(data, moduleName);

      setProgresoUnidad1(summary.progresoUnidad1);
      setProgresoUnidad2(summary.progresoUnidad2);
      setProgresoUnidad3(summary.progresoUnidad3);

      setUnidad1Completada(summary.unidad1Completada);
      setUnidad2Completada(summary.unidad2Completada);
      setUnidad3Completada(summary.unidad3Completada);

      setProgresoBackendCargado(true);
      return true;
    } catch (e) {
      setProgresoUnidad1(0);
      setProgresoUnidad2(0);
      setProgresoUnidad3(0);
      setUnidad1Completada(false);
      setUnidad2Completada(false);
      setUnidad3Completada(false);
      setProgresoBackendCargado(true);
      return true;
    }
  };

  useEffect(() => {
    const refresh = async () => {
      await cargarProgresoDesdeBackend();
    };

    refresh();

    const onProgresoActualizado = () => {
      refresh();
    };

    window.addEventListener('progreso-actualizado', onProgresoActualizado);
    window.addEventListener('focus', onProgresoActualizado);

    return () => {
      window.removeEventListener('progreso-actualizado', onProgresoActualizado);
      window.removeEventListener('focus', onProgresoActualizado);
    };
  }, [moduleName]);

  return {
    unidad1Completada,
    unidad2Completada,
    unidad3Completada,
    progresoUnidad1,
    progresoUnidad2,
    progresoUnidad3,
    progresoBackendCargado,
    cargarProgresoDesdeBackend
  };
};

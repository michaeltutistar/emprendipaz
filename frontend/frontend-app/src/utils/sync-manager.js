/**
 * Gestor de sincronización offline
 * Maneja la cola de sincronización y sincroniza datos cuando hay conexión
 */

import {
  getSyncableItems,
  getSyncableFormData,
  markAsSynced,
  markFormDataSynced,
  incrementRetries,
  incrementFormDataRetries,
  cleanupSyncedItems,
  STORE_NAMES
} from './offline-storage';
import API_BASE_URL from '@/config/api';
import { canRestorePwaSession, getAuthToken } from './auth-storage';

let isSyncing = false;
let syncListeners = [];
let autoSyncConfigured = false;

/**
 * Obtener token de autenticación
 */
async function makeAPIRequest(endpoint, method, body) {
  const token = getAuthToken();
  if (!token && !canRestorePwaSession()) {
    throw new Error('No hay token de autenticación');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Sincronizar un item de progreso
 */
async function syncProgressItem(item) {
  try {
    await makeAPIRequest('/registrar-progreso-modulo', 'POST', {
      modulo_nombre: item.modulo_nombre,
      paso_nombre: item.paso_nombre,
      curso_nombre: item.curso_nombre
    });
    
    await markAsSynced(STORE_NAMES.PROGRESS, item.id);
    return { success: true, item };
  } catch (error) {
    console.error('[Sync] Error al sincronizar progreso:', error);
    await incrementRetries(STORE_NAMES.PROGRESS, item.id);
    throw error;
  }
}

/**
 * Sincronizar un item de evaluación
 */
async function syncEvaluationItem(item) {
  try {
    await makeAPIRequest('/registrar-intento-evaluacion', 'POST', {
      modulo_nombre: item.modulo_nombre,
      unidad_nombre: item.unidad_nombre,
      paso_nombre: item.paso_nombre,
      todas_correctas: item.todas_correctas
    });
    
    await markAsSynced(STORE_NAMES.EVALUATIONS, item.id);
    return { success: true, item };
  } catch (error) {
    console.error('[Sync] Error al sincronizar evaluación:', error);
    await incrementRetries(STORE_NAMES.EVALUATIONS, item.id);
    throw error;
  }
}

function parsePlanFormKey(key) {
  const raw = String(key || '');
  const parts = raw.split(':');
  if (parts.length < 3) return null;
  return {
    kind: parts[1],
    modulo_nombre: parts.slice(2).join(':')
  };
}

async function syncPlanFormItem(item) {
  const parsed = parsePlanFormKey(item?.key);
  if (!parsed || !parsed.modulo_nombre) {
    await markFormDataSynced(item?.key);
    return { success: true, item };
  }

  const payload = item?.data && typeof item.data === 'object'
    ? { ...item.data }
    : {};

  try {
    if (parsed.kind === 'respuestas') {
      await makeAPIRequest('/save-respuestas-plan', 'POST', {
        modulo_nombre: payload.modulo_nombre || parsed.modulo_nombre,
        respuestas: payload.respuestas ?? payload.respuestas_json ?? payload
      });
    } else if (parsed.kind === 'puntos') {
      await makeAPIRequest('/registrar-puntos-plan-negocio', 'POST', {
        modulo_nombre: payload.modulo_nombre || parsed.modulo_nombre,
        estrategias: Array.isArray(payload.estrategias) ? payload.estrategias : []
      });
    } else {
      await markFormDataSynced(item?.key);
      return { success: true, item };
    }

    await markFormDataSynced(item.key);
    return { success: true, item };
  } catch (error) {
    console.error('[Sync] Error al sincronizar form_data de plan:', error);
    await incrementFormDataRetries(item.key);
    throw error;
  }
}

/**
 * Sincronizar todos los items pendientes
 */
export async function syncPendingItems() {
  if (isSyncing) {
    console.log('[Sync] Sincronización ya en progreso');
    return;
  }

  if (!navigator.onLine) {
    console.log('[Sync] Sin conexión, no se puede sincronizar');
    notifyListeners({ type: 'offline' });
    return;
  }

  isSyncing = true;
  notifyListeners({ type: 'start' });

  try {
    // Obtener items pendientes
    const pendingPlanForms = await getSyncableFormData();
    const pendingProgress = await getSyncableItems(STORE_NAMES.PROGRESS);
    const pendingEvaluations = await getSyncableItems(STORE_NAMES.EVALUATIONS);

    const totalItems = pendingPlanForms.length + pendingProgress.length + pendingEvaluations.length;
    console.log(`[Sync] Sincronizando ${totalItems} items pendientes...`);

    if (totalItems === 0) {
      notifyListeners({ type: 'complete', synced: 0, total: 0 });
      isSyncing = false;
      return;
    }

    let synced = 0;
    let failed = 0;

    // Sincronizar respuestas y puntos de planes de negocio primero
    for (const item of pendingPlanForms) {
      try {
        await syncPlanFormItem(item);
        synced++;
        notifyListeners({
          type: 'progress',
          synced,
          total: totalItems,
          current: item
        });
      } catch (error) {
        failed++;
        console.error(`[Sync] Error al sincronizar form_data ${item.key}:`, error);
      }
    }

    // Sincronizar progreso
    for (const item of pendingProgress) {
      try {
        await syncProgressItem(item);
        synced++;
        notifyListeners({ 
          type: 'progress', 
          synced, 
          total: totalItems,
          current: item 
        });
      } catch (error) {
        failed++;
        console.error(`[Sync] Error al sincronizar item ${item.id}:`, error);
      }
    }

    // Sincronizar evaluaciones
    for (const item of pendingEvaluations) {
      try {
        await syncEvaluationItem(item);
        synced++;
        notifyListeners({ 
          type: 'progress', 
          synced, 
          total: totalItems,
          current: item 
        });
      } catch (error) {
        failed++;
        console.error(`[Sync] Error al sincronizar item ${item.id}:`, error);
      }
    }

    // Limpiar items antiguos
    await cleanupSyncedItems(STORE_NAMES.PROGRESS);
    await cleanupSyncedItems(STORE_NAMES.EVALUATIONS);

    console.log(`[Sync] Sincronización completada: ${synced} exitosos, ${failed} fallidos`);
    window.dispatchEvent(new Event('progreso-actualizado'));
    notifyListeners({ 
      type: 'complete', 
      synced, 
      failed, 
      total: totalItems 
    });

  } catch (error) {
    console.error('[Sync] Error en sincronización:', error);
    notifyListeners({ type: 'error', error: error.message });
  } finally {
    isSyncing = false;
  }
}

/**
 * Verificar si hay conexión y sincronizar automáticamente
 */
export function setupAutoSync() {
  if (autoSyncConfigured) return;
  autoSyncConfigured = true;

  // Sincronizar cuando vuelva la conexión
  window.addEventListener('online', () => {
    console.log('[Sync] Conexión restaurada, iniciando sincronización...');
    setTimeout(() => {
      syncPendingItems();
    }, 1000); // Esperar 1 segundo para asegurar que la conexión es estable
  });

  // Sincronizar periódicamente si hay conexión (cada 5 minutos)
  setInterval(() => {
    if (navigator.onLine && !isSyncing) {
      syncPendingItems();
    }
  }, 5 * 60 * 1000);

  // Sincronizar al cargar la página si hay conexión
  if (navigator.onLine) {
    setTimeout(() => {
      syncPendingItems();
    }, 2000);
  }
}

/**
 * Agregar listener para eventos de sincronización
 */
export function addSyncListener(callback) {
  syncListeners.push(callback);
  return () => {
    syncListeners = syncListeners.filter(listener => listener !== callback);
  };
}

/**
 * Notificar a los listeners
 */
function notifyListeners(event) {
  syncListeners.forEach(listener => {
    try {
      listener(event);
    } catch (error) {
      console.error('[Sync] Error en listener:', error);
    }
  });
}

/**
 * Verificar estado de sincronización
 */
export function isCurrentlySyncing() {
  return isSyncing;
}









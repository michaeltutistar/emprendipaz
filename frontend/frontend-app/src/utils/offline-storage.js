/**
 * Utilidad para almacenamiento offline usando IndexedDB
 * Almacena datos del estudiante para sincronización posterior
 */

const DB_NAME = 'elearning-offline-db';
const DB_VERSION = 2;
const STORE_NAMES = {
  PROGRESS: 'progress_queue',
  EVALUATIONS: 'evaluation_queue',
  FORM_DATA: 'form_data',
  SYNC_STATUS: 'sync_status',
  API_CACHE: 'api_cache'
};

let dbInstance = null;

/**
 * Inicializar IndexedDB
 */
export async function initDB() {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Error al abrir base de datos:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('[IndexedDB] Base de datos abierta correctamente');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store para cola de progreso
      if (!db.objectStoreNames.contains(STORE_NAMES.PROGRESS)) {
        const progressStore = db.createObjectStore(STORE_NAMES.PROGRESS, {
          keyPath: 'id',
          autoIncrement: true
        });
        progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        progressStore.createIndex('status', 'status', { unique: false });
      }

      // Store para cola de evaluaciones
      if (!db.objectStoreNames.contains(STORE_NAMES.EVALUATIONS)) {
        const evalStore = db.createObjectStore(STORE_NAMES.EVALUATIONS, {
          keyPath: 'id',
          autoIncrement: true
        });
        evalStore.createIndex('timestamp', 'timestamp', { unique: false });
        evalStore.createIndex('status', 'status', { unique: false });
      }

      // Store para datos de formularios
      if (!db.objectStoreNames.contains(STORE_NAMES.FORM_DATA)) {
        const formStore = db.createObjectStore(STORE_NAMES.FORM_DATA, {
          keyPath: 'key'
        });
      }

      // Store para estado de sincronización
      if (!db.objectStoreNames.contains(STORE_NAMES.SYNC_STATUS)) {
        db.createObjectStore(STORE_NAMES.SYNC_STATUS, {
          keyPath: 'key'
        });
      }

      // Store para snapshots de API (GET) para modo offline
      if (!db.objectStoreNames.contains(STORE_NAMES.API_CACHE)) {
        const apiCacheStore = db.createObjectStore(STORE_NAMES.API_CACHE, {
          keyPath: 'key'
        });
        apiCacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      console.log('[IndexedDB] Estructura de base de datos creada');
    };
  });
}

/**
 * Guardar snapshot JSON de un endpoint GET (solo PWA/offline UX)
 */
export async function cacheApiJson(key, data) {
  try {
    if (!key) return;
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.API_CACHE], 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.API_CACHE);
    const request = store.put({ key, data, timestamp: Date.now() });
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Error en cacheApiJson:', error);
  }
}

/**
 * Obtener snapshot JSON cacheado de un endpoint GET
 */
export async function getCachedApiJson(key) {
  try {
    if (!key) return null;
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.API_CACHE], 'readonly');
    const store = transaction.objectStore(STORE_NAMES.API_CACHE);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    return null;
  }
}

function extractPathFromCacheKey(key) {
  const raw = String(key || '');
  const parts = raw.split(':');
  return parts.length >= 3 ? parts.slice(2).join(':') : raw;
}

export async function getBestCachedApiJson(pathname, search = '') {
  try {
    const target = `${pathname || ''}${search || ''}`;
    if (!target) return null;

    const allCached = await getAllItems(STORE_NAMES.API_CACHE);
    if (!Array.isArray(allCached) || allCached.length === 0) return null;

    const exactMatches = allCached
      .filter((item) => extractPathFromCacheKey(item?.key) === target)
      .sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0));

    if (exactMatches.length > 0) {
      return exactMatches[0]?.data ?? null;
    }

    const byPathOnly = allCached
      .filter((item) => extractPathFromCacheKey(item?.key).startsWith(pathname || ''))
      .sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0));

    return byPathOnly[0]?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Guardar progreso en cola para sincronización
 */
export async function queueProgress(data) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.PROGRESS], 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.PROGRESS);

    const progressItem = {
      ...data,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    const request = store.add(progressItem);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('[IndexedDB] Progreso agregado a cola:', request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('[IndexedDB] Error al agregar progreso:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error en queueProgress:', error);
    throw error;
  }
}

/**
 * Guardar intento de evaluación en cola
 */
export async function queueEvaluation(data) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.EVALUATIONS], 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.EVALUATIONS);

    const evalItem = {
      ...data,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    const request = store.add(evalItem);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('[IndexedDB] Evaluación agregada a cola:', request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('[IndexedDB] Error al agregar evaluación:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error en queueEvaluation:', error);
    throw error;
  }
}

/**
 * Obtener todos los items pendientes de sincronización
 */
export async function getPendingItems(storeName) {
  try {
    return getItemsByStatus(storeName, ['pending']);
  } catch (error) {
    console.error('[IndexedDB] Error en getPendingItems:', error);
    return [];
  }
}

export async function getSyncableItems(storeName) {
  try {
    return getItemsByStatus(storeName, ['pending', 'failed']);
  } catch (error) {
    console.error('[IndexedDB] Error en getSyncableItems:', error);
    return [];
  }
}

async function getItemsByStatus(storeName, statuses = ['pending']) {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const validStatuses = new Set(statuses);
        const items = (request.result || [])
          .filter((item) => validStatuses.has(item?.status))
          .sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0));
        resolve(items);
      };
      request.onerror = () => {
        console.error(`[IndexedDB] Error al obtener items de ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error en getItemsByStatus:', error);
    return [];
  }
}

/**
 * Marcar item como sincronizado
 */
export async function markAsSynced(storeName, id) {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = 'synced';
          item.syncedAt = Date.now();
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => {
            console.log(`[IndexedDB] Item ${id} marcado como sincronizado`);
            resolve();
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Error en markAsSynced:', error);
    throw error;
  }
}

/**
 * Incrementar contador de reintentos
 */
export async function incrementRetries(storeName, id) {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retries = (item.retries || 0) + 1;
          if (item.retries >= 5) {
            item.status = 'failed';
          }
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Error en incrementRetries:', error);
    throw error;
  }
}

/**
 * Eliminar items sincronizados antiguos (más de 7 días)
 */
export async function cleanupSyncedItems(storeName) {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index('status');
    const request = index.getAll('synced');

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result || [];
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const toDelete = items.filter(item => 
          item.syncedAt && item.syncedAt < sevenDaysAgo
        );

        if (toDelete.length === 0) {
          resolve(0);
          return;
        }

        let deleted = 0;
        toDelete.forEach(item => {
          const deleteRequest = store.delete(item.id);
          deleteRequest.onsuccess = () => {
            deleted++;
            if (deleted === toDelete.length) {
              console.log(`[IndexedDB] Eliminados ${deleted} items antiguos de ${storeName}`);
              resolve(deleted);
            }
          };
        });
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Error en cleanupSyncedItems:', error);
    return 0;
  }
}

/**
 * Guardar datos de formulario
 */
export async function saveFormData(key, data) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.FORM_DATA], 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.FORM_DATA);

    const formItem = {
      key,
      data,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    const request = store.put(formItem);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('[IndexedDB] Datos de formulario guardados:', key);
        resolve();
      };
      request.onerror = () => {
        console.error('[IndexedDB] Error al guardar datos de formulario:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error en saveFormData:', error);
    throw error;
  }
}

/**
 * Obtener datos de formulario
 */
export async function getFormData(key) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.FORM_DATA], 'readonly');
    const store = transaction.objectStore(STORE_NAMES.FORM_DATA);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
      request.onerror = () => {
        console.error('[IndexedDB] Error al obtener datos de formulario:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error en getFormData:', error);
    return null;
  }
}

export async function getSyncableFormData(prefix = 'plan-negocio:') {
  try {
    const allItems = await getAllItems(STORE_NAMES.FORM_DATA);
    return (allItems || [])
      .filter((item) => String(item?.key || '').startsWith(prefix))
      .filter((item) => !item?.status || item.status === 'pending' || item.status === 'failed')
      .sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0));
  } catch (error) {
    console.error('[IndexedDB] Error en getSyncableFormData:', error);
    return [];
  }
}

export async function markFormDataSynced(key) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.FORM_DATA], 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.FORM_DATA);
    const getRequest = store.get(key);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          resolve();
          return;
        }

        item.status = 'synced';
        item.syncedAt = Date.now();
        item.retries = 0;

        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Error en markFormDataSynced:', error);
    throw error;
  }
}

export async function incrementFormDataRetries(key) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAMES.FORM_DATA], 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.FORM_DATA);
    const getRequest = store.get(key);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          resolve();
          return;
        }

        item.retries = (item.retries || 0) + 1;
        item.status = item.retries >= 5 ? 'failed' : 'pending';

        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('[IndexedDB] Error en incrementFormDataRetries:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de sincronización
 */
export async function getSyncStats() {
  try {
    const stats = {
      pendingProgress: 0,
      pendingEvaluations: 0,
      syncedToday: 0
    };

    // Contar progreso sin sincronizar (pendiente o fallido)
    const pendingProgress = await getSyncableItems(STORE_NAMES.PROGRESS);
    stats.pendingProgress = pendingProgress.length;

    // Contar evaluaciones sin sincronizar (pendiente o fallido)
    const pendingEvals = await getSyncableItems(STORE_NAMES.EVALUATIONS);
    stats.pendingEvaluations = pendingEvals.length;

    // Contar sincronizados hoy
    const today = new Date().setHours(0, 0, 0, 0);
    const allProgress = await getAllItems(STORE_NAMES.PROGRESS);
    const allEvals = await getAllItems(STORE_NAMES.EVALUATIONS);
    const syncedItems = [...allProgress, ...allEvals].filter(item => 
      item.status === 'synced' && item.syncedAt && item.syncedAt >= today
    );
    stats.syncedToday = syncedItems.length;

    return stats;
  } catch (error) {
    console.error('[IndexedDB] Error en getSyncStats:', error);
    return { pendingProgress: 0, pendingEvaluations: 0, syncedToday: 0 };
  }
}

/**
 * Obtener todos los items de un store
 */
async function getAllItems(storeName) {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    return [];
  }
}

export { STORE_NAMES };









import { useState, useEffect, useCallback } from 'react';
import { 
  syncPendingItems, 
  setupAutoSync, 
  addSyncListener,
  isCurrentlySyncing 
} from '../utils/sync-manager';
import { getSyncStats } from '../utils/offline-storage';

/**
 * Hook para manejar sincronización offline
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState({
    pendingProgress: 0,
    pendingEvaluations: 0,
    syncedToday: 0
  });
  const [syncProgress, setSyncProgress] = useState({
    synced: 0,
    total: 0,
    failed: 0
  });

  // Detectar cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[useOfflineSync] Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[useOfflineSync] Sin conexión');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Configurar auto-sincronización
  useEffect(() => {
    setupAutoSync();
  }, []);

  // Escuchar eventos de sincronización
  useEffect(() => {
    const unsubscribe = addSyncListener((event) => {
      switch (event.type) {
        case 'start':
          setIsSyncing(true);
          setSyncProgress({ synced: 0, total: 0, failed: 0 });
          break;
        case 'progress':
          setSyncProgress({
            synced: event.synced,
            total: event.total,
            failed: syncProgress.failed
          });
          break;
        case 'complete':
          setIsSyncing(false);
          setSyncProgress({
            synced: event.synced,
            total: event.total,
            failed: event.failed || 0
          });
          // Actualizar estadísticas
          updateStats();
          break;
        case 'error':
          setIsSyncing(false);
          console.error('[useOfflineSync] Error de sincronización:', event.error);
          break;
        case 'offline':
          setIsSyncing(false);
          break;
      }
    });

    return unsubscribe;
  }, [syncProgress.failed]);

  // Actualizar estadísticas periódicamente
  const updateStats = useCallback(async () => {
    const stats = await getSyncStats();
    setSyncStats(stats);
  }, []);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [updateStats]);

  // Función para sincronizar manualmente
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      console.warn('[useOfflineSync] No hay conexión para sincronizar');
      return;
    }
    if (isSyncing) {
      console.warn('[useOfflineSync] Sincronización ya en progreso');
      return;
    }
    await syncPendingItems();
  }, [isOnline, isSyncing]);

  return {
    isOnline,
    isSyncing,
    syncStats,
    syncProgress,
    syncNow,
    updateStats
  };
}









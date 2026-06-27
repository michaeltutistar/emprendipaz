import React from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Indicador de estado offline/online y sincronización
 */
const OfflineIndicator = () => {
  const { isOnline, isSyncing, syncStats, syncProgress, syncNow } = useOfflineSync();

  const pendingCount = syncStats.pendingProgress + syncStats.pendingEvaluations;
  const hasPendingItems = pendingCount > 0;

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">
              Sin conexión - Los datos se guardarán localmente
            </span>
          </div>
        </motion.div>
      )}

      {isOnline && hasPendingItems && !isSyncing && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-2 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {pendingCount} {pendingCount === 1 ? 'item' : 'items'} pendiente{pendingCount === 1 ? '' : 's'} de sincronizar
            </span>
            <button
              onClick={syncNow}
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Sincronizar ahora
            </button>
          </div>
        </motion.div>
      )}

      {isSyncing && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.div>
            <span className="text-sm font-medium">
              Sincronizando... {syncProgress.synced}/{syncProgress.total}
            </span>
          </div>
        </motion.div>
      )}

      {isOnline && !hasPendingItems && syncProgress.synced > 0 && syncProgress.total > 0 && !isSyncing && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              Sincronización completada: {syncProgress.synced} {syncProgress.synced === 1 ? 'item' : 'items'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;









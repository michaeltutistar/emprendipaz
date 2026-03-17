import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Importar fetch wrapper para manejo offline
import './utils/fetch-wrapper'
// Inicializar IndexedDB
import { initDB } from './utils/offline-storage'

// Inicializar IndexedDB al cargar la app
initDB().catch(error => {
  console.error('[Main] Error al inicializar IndexedDB:', error);
})

// Limpiar localStorage antiguo relacionado con progreso de unidades
// Esto asegura que la PWA no use datos obsoletos
const cleanOldLocalStorage = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('_unidad') && key.includes('_completada') ||
        key.includes('descubrimiento_unidad') ||
        key.includes('modelo_negocios_unidad') ||
        key.includes('marketing_unidad') ||
        key.includes('md_unidad') ||
        key.includes('ac_unidad') ||
        key.includes('te_unidad') ||
        key.includes('finanzas_unidad') ||
        key.includes('liderazgo_unidad') ||
        key.includes('plan_inversion_unidad')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log('[Main] Limpiando localStorage antiguo:', key);
      localStorage.removeItem(key);
    });
    if (keysToRemove.length > 0) {
      console.log(`[Main] Limpiados ${keysToRemove.length} elementos de localStorage obsoletos`);
    }
  } catch (error) {
    console.error('[Main] Error al limpiar localStorage:', error);
  }
};

// Ejecutar limpieza al iniciar la app
cleanOldLocalStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ========================================
// REGISTRO DE SERVICE WORKER
// ========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      // Bump querystring to force fetching the latest SW script even if a CDN/browser cache is sticky
      .register('/service-worker.js?v=1.2.0')
      .then((registration) => {
        console.log('[App] Service Worker registrado con éxito:', registration.scope)

        // Recargar automáticamente cuando el nuevo Service Worker tome control
        // (solo una vez para evitar bucles)
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          console.log('[App] Nuevo Service Worker tomó control. Recargando...')
          window.location.reload();
        });

        // Forzar verificación de actualizaciones (también al cargar)
        const checkForUpdates = () => {
          registration.update().catch(() => {
            // Silencioso: si está offline o falla, seguimos en modo offline con caché
          });
        };

        // Check inmediato al iniciar
        checkForUpdates();

        window.addEventListener('online', checkForUpdates);
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) checkForUpdates();
        });

        // Revisión periódica por si el usuario deja la app abierta mucho tiempo
        setInterval(checkForUpdates, 5 * 60 * 1000); // cada 5 minutos
        
        // Detectar actualizaciones del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          console.log('[App] Nueva versión del Service Worker detectada')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              console.log('[App] Nueva versión lista. Activando automáticamente...')
              
              // Activar el nuevo SW inmediatamente (sin esperar a cerrar pestañas)
              if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          })
        })

        // Si ya hay una versión esperando (caso común en PWA “pegada”), activarla ya
        if (registration.waiting && navigator.serviceWorker.controller) {
          try {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          } catch (e) {
            // no-op
          }
        }

        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[App] Mensaje del Service Worker:', event.data)
          
          // Si el service worker solicita sincronización
          if (event.data && event.data.type === 'SYNC_REQUEST') {
            // Importar y ejecutar sincronización
            import('./utils/sync-manager').then(({ syncPendingItems }) => {
              syncPendingItems();
            });
          }
        })
        
        // Registrar Background Sync si está disponible
        if ('sync' in registration) {
          // Registrar sync para cuando vuelva la conexión
          window.addEventListener('online', () => {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.ready.then((swRegistration) => {
                if ('sync' in swRegistration) {
                  swRegistration.sync.register('sync-pending-items').catch(err => {
                    console.log('[App] Background Sync no disponible:', err);
                  });
                }
              });
            }
          });
        }

        // Manejar errores de comunicación con el Service Worker
        navigator.serviceWorker.addEventListener('error', (error) => {
          console.warn('[App] Error en Service Worker:', error)
        })
      })
      .catch((error) => {
        console.error('[App] Error al registrar Service Worker:', error)
      })
  })

  // Limpiar Service Workers antiguos en caso de problemas
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      // Verificar si hay múltiples registros (problema común)
      if (registrations.length > 1) {
        console.warn('[App] Múltiples Service Workers detectados. Limpiando...')
        registration.unregister()
      }
    })
  })
} else {
  console.warn('[App] Service Workers no soportados en este navegador')
}
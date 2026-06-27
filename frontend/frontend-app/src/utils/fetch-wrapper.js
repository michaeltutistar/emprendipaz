/**
 * Wrapper para fetch que maneja requests offline
 * Intercepta POST requests y los guarda en cola si está offline
 */

import { cacheApiJson, getCachedApiJson, getBestCachedApiJson, getSyncableItems, queueProgress, queueEvaluation, saveFormData, STORE_NAMES } from './offline-storage';
import { getAuthToken, setAuthToken, isForceLoggedOut } from './auth-storage';
import { isInstalledPwa } from './pwa';
import API_BASE_URL from '@/config/api';
import { buildOfflineMiProgreso, buildOfflineModulosDisponibles } from './offline-student-state';

const originalFetch = window.fetch.bind(window);

let refreshInFlight = null;
async function refreshAccessTokenIfPossible() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      // Solo intentar refresh si hay conexión y PWA instalada
      if (!isInstalledPwa()) return null;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
      if (isForceLoggedOut()) return null;

      const refreshUrl = `${API_BASE_URL}/refresh`;
      const resp = await originalFetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!resp || !resp.ok) return null;
      const data = await resp.json().catch(() => null);
      const token = data?.token;
      if (token) {
        setAuthToken(token);
        return token;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

function shouldAttemptRefresh(pathname) {
  if (!pathname) return false;
  return !(
    /\/login$/.test(pathname) ||
    /\/refresh$/.test(pathname) ||
    /\/logout$/.test(pathname)
  );
}

async function originalFetchWithAutoRefresh(input, init) {
  const resp = await originalFetch(input, init);
  try {
    // Si es 401, intentar refresh una sola vez y reintentar.
    if (resp && resp.status === 401 && isInstalledPwa()) {
      const url = (() => {
        try {
          const u = typeof input === 'string' ? input : input?.url;
          return u ? new URL(u, window.location.origin) : null;
        } catch {
          return null;
        }
      })();
      const pathname = url?.pathname || '';
      if (!shouldAttemptRefresh(pathname)) return resp;

      const newToken = await refreshAccessTokenIfPossible();
      if (!newToken) {
        // Mantener la sesión local en PWA. El código de más arriba decidirá
        // si puede degradar a snapshot cacheado mientras vuelve la conectividad
        // o se restablece el refresh token.
        return resp;
      }

      // Reintentar con el nuevo token
      const retryInit = { ...(init || {}) };
      if (!retryInit.headers) retryInit.headers = {};
      const bearer = `Bearer ${newToken}`;
      if (retryInit.headers instanceof Headers) {
        retryInit.headers.set('Authorization', bearer);
      } else if (typeof retryInit.headers === 'object') {
        retryInit.headers.Authorization = bearer;
      }
      return await originalFetch(input, retryInit);
    }
  } catch {
    // Si falla el refresh, devolvemos el 401 original
  }
  return resp;
}

function isCacheableGetPath(pathname) {
  // PWA: cachear todas las respuestas JSON del área student para máxima resiliencia offline.
  // (Solo se guarda si el content-type es application/json.)
  if (/\/student\//.test(pathname)) return true;
  return /\/profile$/.test(pathname);
}

function makeApiCacheKey(pathname, search, token) {
  const suffix = token ? String(token).slice(-12) : 'no-token';
  return `v1:${suffix}:${pathname}${search || ''}`;
}

async function buildCachedApiResponse(key, pathname, search, token) {
  const cached = await getCachedApiJson(key) || await getBestCachedApiJson(pathname, search);

  if (!cached && !/\/student\/mi-progreso$/.test(pathname) && !/\/student\/modulos-disponibles$/.test(pathname)) {
    return null;
  }

  const patched =
    /\/student\/mi-progreso$/.test(pathname)
      ? await applyOfflineOverlayForMiProgreso(cached)
      : /\/student\/modulos-disponibles$/.test(pathname)
        ? await applyOfflineOverlayForModulosDisponibles(cached, token, pathname)
        : cached;

  if (!patched) return null;

  return new Response(JSON.stringify(patched), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Offline-Cache': '1'
    }
  });
}

async function applyOfflineOverlayForMiProgreso(jsonData) {
  try {
    const [progressItems, evaluationItems] = await Promise.all([
      getSyncableItems(STORE_NAMES.PROGRESS),
      getSyncableItems(STORE_NAMES.EVALUATIONS)
    ]);

    return buildOfflineMiProgreso(jsonData, progressItems, evaluationItems);
  } catch {
    return jsonData || buildOfflineMiProgreso(null, [], []);
  }
}

async function applyOfflineOverlayForModulosDisponibles(jsonData, token, modulosDisponiblesPathname) {
  try {
    const [progressItems, evaluationItems] = await Promise.all([
      getSyncableItems(STORE_NAMES.PROGRESS),
      getSyncableItems(STORE_NAMES.EVALUATIONS)
    ]);

    const miProgresoPathname =
      typeof modulosDisponiblesPathname === 'string' && modulosDisponiblesPathname.length > 0
        ? modulosDisponiblesPathname.replace(/\/student\/modulos-disponibles$/i, '/student/mi-progreso')
        : '/student/mi-progreso';
    const keyMiProgreso = makeApiCacheKey(miProgresoPathname, '', token);
    const cachedMiProgreso = await getCachedApiJson(keyMiProgreso) || await getBestCachedApiJson(miProgresoPathname, '');
    const miProgreso = buildOfflineMiProgreso(cachedMiProgreso, progressItems, evaluationItems);
    return buildOfflineModulosDisponibles(jsonData, miProgreso);
  } catch {
    return jsonData || buildOfflineModulosDisponibles(null, buildOfflineMiProgreso(null, [], []));
  }
}

/**
 * Resolver URL de API
 */
function resolveApiUrl(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  if (!url.startsWith('/api')) {
    return url;
  }

  if (API_BASE_URL === '/api') {
    return url;
  }

  return url.replace('/api', API_BASE_URL);
}

/**
 * Interceptar fetch y manejar offline
 */
window.fetch = async function (input, init = {}) {
  // Agregar token JWT si está disponible
  const token = getAuthToken();
  if (token && init) {
    if (!init.headers) {
      init.headers = {};
    }
    // Normalizar headers para asegurar Authorization incluso si el código existente lo setea como "Bearer null"
    const bearer = `Bearer ${token}`;
    if (init.headers instanceof Headers) {
      const existing = init.headers.get('Authorization');
      if (!existing || /Bearer\s+(null|undefined)\b/i.test(existing)) {
        init.headers.set('Authorization', bearer);
      }
    } else if (typeof init.headers === 'object') {
      const existing = init.headers.Authorization || init.headers.authorization;
      if (!existing || /Bearer\s+(null|undefined)\b/i.test(String(existing))) {
        init.headers.Authorization = bearer;
      }
    }
  }

  // Resolver URL
  let resolvedUrl;
  if (typeof input === 'string') {
    resolvedUrl = resolveApiUrl(input);
  } else if (input instanceof Request) {
    resolvedUrl = resolveApiUrl(input.url);
    if (resolvedUrl !== input.url) {
      input = new Request(resolvedUrl, input);
    }
  }

  // ========================================
  // GET: Snapshot offline (PWA instalada)
  // ========================================
  const method =
    (init && init.method ? String(init.method) : (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (method === 'GET' && resolvedUrl && isInstalledPwa()) {
    try {
      const url = new URL(resolvedUrl, window.location.origin);
      const cacheable = isCacheableGetPath(url.pathname);
      if (cacheable) {
        const key = makeApiCacheKey(url.pathname, url.search, token);

        // Offline: servir snapshot cacheado si existe
        if (!navigator.onLine) {
          const cachedResponse = await buildCachedApiResponse(key, url.pathname, url.search, token);
          if (cachedResponse) return cachedResponse;
        }

        try {
          // Online: hacer request normal y cachear JSON si es OK
          const response = await originalFetchWithAutoRefresh(
            typeof input === 'string' ? resolvedUrl : input,
            typeof input === 'string' ? init : init
          );

          if (response && response.status === 401) {
            const cachedResponse = await buildCachedApiResponse(key, url.pathname, url.search, token);
            if (cachedResponse) return cachedResponse;
          }

          try {
            if (response && response.ok) {
              const ct = response.headers?.get?.('content-type') || '';
              if (ct.includes('application/json')) {
                const clone = response.clone();
                const json = await clone.json().catch(() => null);
                if (json) {
                  await cacheApiJson(key, json);
                }
              }
            }
          } catch {
            // no-op: caching best-effort
          }
          return response;
        } catch {
          const cachedResponse = await buildCachedApiResponse(key, url.pathname, url.search, token);
          if (cachedResponse) return cachedResponse;
          throw new Error('No se pudo obtener respuesta de red ni snapshot cacheado');
        }
      }
    } catch {
      // Si algo falla en el cacheo, seguimos a lógica normal
    }
  }

  // Si es un POST request a endpoints de progreso/evaluación
  if (init.method === 'POST' && resolvedUrl) {
    try {
      const url = new URL(resolvedUrl, window.location.origin);

      // Endpoints que deben guardarse en cola si está offline
      const isProgressEndpoint = url.pathname.includes('/registrar-progreso-modulo');
      const isEvaluationEndpoint = url.pathname.includes('/registrar-intento-evaluacion');
      const isPlanResponsesEndpoint = url.pathname.includes('/save-respuestas-plan');
      const isPlanPointsEndpoint = url.pathname.includes('/registrar-puntos-plan-negocio');

      if (isProgressEndpoint || isEvaluationEndpoint || isPlanResponsesEndpoint || isPlanPointsEndpoint) {
        const buildOfflineSuccess = (message) => new Response(JSON.stringify({
          success: true,
          message,
          offline: true
        }), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' }
        });

        const persistPlanPayload = async (body, kind) => {
          const moduleName = body?.modulo_nombre;
          if (!moduleName) return;
          await saveFormData(`plan-negocio:${kind}:${moduleName}`, {
            ...body,
            savedAt: Date.now()
          });
        };

        // Si está offline, guardar en cola
        if (!navigator.onLine) {
          try {
            const body = init.body ? (typeof init.body === 'string' ? JSON.parse(init.body) : init.body) : {};

            if (isProgressEndpoint) {
              await queueProgress({
                modulo_nombre: body.modulo_nombre,
                paso_nombre: body.paso_nombre,
                curso_nombre: body.curso_nombre || 'Curso'
              });
              console.log('[FetchWrapper] Progreso guardado en cola offline');

              // Retornar respuesta simulada exitosa
              return new Response(JSON.stringify({
                success: true,
                message: 'Progreso guardado localmente. Se sincronizará cuando haya conexión.',
                offline: true
              }), {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/json' }
              });
            }

            if (isEvaluationEndpoint) {
              await queueEvaluation({
                modulo_nombre: body.modulo_nombre,
                unidad_nombre: body.unidad_nombre,
                paso_nombre: body.paso_nombre,
                todas_correctas: body.todas_correctas
              });
              console.log('[FetchWrapper] Evaluación guardada en cola offline');

              return buildOfflineSuccess('Evaluación guardada localmente. Se sincronizará cuando haya conexión.');
            }

            if (isPlanResponsesEndpoint) {
              await persistPlanPayload(body, 'respuestas');
              return buildOfflineSuccess('Respuestas del plan guardadas localmente.');
            }

            if (isPlanPointsEndpoint) {
              await persistPlanPayload(body, 'puntos');
              return buildOfflineSuccess('Puntos del plan guardados localmente.');
            }
          } catch (error) {
            console.error('[FetchWrapper] Error al guardar en cola offline:', error);
            // Si falla guardar en cola, intentar el request normal (fallará pero al menos se intenta)
          }
        } else {
          // Si está online, intentar el request normal primero
          // Si falla, guardar en cola como respaldo
          try {
            const response = await originalFetchWithAutoRefresh(resolvedUrl, init);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response;
          } catch (error) {
            console.log('[FetchWrapper] Request falló, guardando en cola:', error);
            // Si el request falla, guardar en cola
            try {
              const body = init.body ? (typeof init.body === 'string' ? JSON.parse(init.body) : init.body) : {};

              if (isProgressEndpoint) {
                await queueProgress({
                  modulo_nombre: body.modulo_nombre,
                  paso_nombre: body.paso_nombre,
                  curso_nombre: body.curso_nombre || 'Curso'
                });
                return new Response(JSON.stringify({
                  success: true,
                  message: 'Progreso guardado localmente. Se sincronizará cuando haya conexión.',
                  offline: true
                }), {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/json' }
                });
              }

              if (isEvaluationEndpoint) {
                await queueEvaluation({
                  modulo_nombre: body.modulo_nombre,
                  unidad_nombre: body.unidad_nombre,
                  paso_nombre: body.paso_nombre,
                  todas_correctas: body.todas_correctas
                });
                return buildOfflineSuccess('Evaluación guardada localmente. Se sincronizará cuando haya conexión.');
              }

              if (isPlanResponsesEndpoint) {
                await persistPlanPayload(body, 'respuestas');
                return buildOfflineSuccess('Respuestas del plan guardadas localmente debido a error de red.');
              }

              if (isPlanPointsEndpoint) {
                await persistPlanPayload(body, 'puntos');
                return buildOfflineSuccess('Puntos del plan guardados localmente debido a error de red.');
              }
            } catch (queueError) {
              console.error('[FetchWrapper] Error al guardar en cola después de fallo:', queueError);
              throw error; // Re-lanzar el error original
            }
          }
        }
      }
    } catch (urlError) {
      // Si hay error al parsear URL, continuar con request normal
      console.warn('[FetchWrapper] Error al parsear URL:', urlError);
    }
  }

  // Realizar request normal
  if (typeof input === 'string') {
    return originalFetchWithAutoRefresh(resolvedUrl, init);
  }

  if (input instanceof Request) {
    return originalFetchWithAutoRefresh(input, init);
  }

  return originalFetchWithAutoRefresh(input, init);
};

// Proactivo: cuando vuelve la conexión en PWA, intentar renovar token (si existe refresh cookie)
try {
  if (isInstalledPwa()) {
    window.addEventListener('online', () => {
      refreshAccessTokenIfPossible();
    });
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setTimeout(() => {
        refreshAccessTokenIfPossible();
      }, 500);
    }
  }
} catch {
  // ignore
}

